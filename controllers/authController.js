const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { OAuth2Client } = require("google-auth-library");
const parser = require("ua-parser-js");
const { hashToken, generateToken, decrypt, encrypt } = require("../utils");
const Cryptr = require("cryptr");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const cryptr = new Cryptr(process.env.CRYPTR_KEY);

// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be up to 6 characters");
  }

  // Check if user email already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("Email has already been registered");
  }

  // Get User Device Details
  const ua = parser(req.headers["user-agent"]);
  const userAgent = [ua.ua];

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    userAgent,
  });

  //   Generate JWT Token
  const token = generateToken(user._id);

  // Send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: "none",
    secure: true,
  });

  //send welcome mail
  const subject = "Welcome to Nestlypay";
  const send_to = email;
  const sent_from = "Nestlypay <hello@nestlypay.com>";
  const reply_to = "no-reply@nestlypay.com";
  const fullname = user.name;
  const template = "welcome";

  try {
    await sendEmail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      fullname,
    );
    res
      .status(200)
      .json({ success: true, message: "Welcome Email Sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
  }

  if (user) {
    const { _id, name, email, photo, phone, isVerified, role } = user;
    res.status(201).json({
      _id,
      name,
      email,
      photo,
      phone,
      isVerified,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});


// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate Request
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password");
  }

  // Check if user exists
  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  // User exists, check if password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  if (!passwordIsCorrect) {
    res.status(400);
    throw new Error("Invalid email or password");
  }

  // Trigger 2FA for unknown userAgent/device
  const ua = parser(req.headers["user-agent"]);
  const thisUserAgent = ua.ua;
  console.log(thisUserAgent);
  const allowedDevice = user.userAgent.includes(thisUserAgent);

  if (!allowedDevice) {
    const loginCode = Math.floor(100000 + Math.random() * 900000);
    // Hash token before saving to DB
    const encryptedLoginCode = cryptr.encrypt(loginCode.toString());

    // Delete token if it exists in DB
    let userToken = await Token.findOne({ userId: user._id });
    if (userToken) {
      await userToken.deleteOne();
    }

    // Save Access Token to DB
    await new Token({
      userId: user._id,
      loginToken: encryptedLoginCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60 * (60 * 1000), // Thirty minutes  1hr = 60 * (60 * 1000)
    }).save();

    res.status(400);
    throw new Error("Check your email for login code");
  }



  //   Generate Token
  const token = generateToken(user._id);
  if (user && passwordIsCorrect) {
    // Send HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true,
    });

    const { _id, name, email, photo, phone, isVerified, role } = user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      isVerified,
      role,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Something went wrong, please try again");
  }
});

const sendLoginCode = asyncHandler(async (req, res) => {
  res.send("Login Token");
  const { email } = req.params;
  console.log(email);
  const user = await User.findOne({ email });

  // Check if user doesn't exists
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Find Access Token in DB
  let userToken = await Token.findOne({ userId: user._id });

  if (!userToken) {
    res.status(500);
    throw new Error("Invalid or Expired token, Login again");
  }

  // get the login code
  const loginCode = userToken.loginToken;
  const decryptedLoginCode = cryptr.decrypt(loginCode);
  console.log(loginCode);

  const subject = "Login Access Code - Nestlypay";
  const send_to = email;
  const sent_from = "Nestlypay <hello@nestlypay.com>";
  const reply_to = "no-reply@nestlypay.com";
  const template = "accessToken";
  const name = user.name;
  const link = decryptedLoginCode;

  try {
    await sendEmail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      name,
      link
    );
    res
      .status(200)
      .json({ success: true, message: "Access Code Sent to your email." });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
  }
});



// Login with code
const loginWithCode = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const { loginCode } = req.body;
  console.log(email);
  console.log(loginCode);

  const user = await User.findOne({ email });

  // Check if user doesn't exists
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Find Token in DB
  const userToken = await Token.findOne({
    userId: user.id,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired Code, please login again");
  }

  const decryptedLoginCode = cryptr.decrypt(userToken.loginToken);

  // Log user in
  if (loginCode !== decryptedLoginCode) {
    res.status(400);
    throw new Error("Incorrect login code, please try again");
  } else {
    // Register the userAgent
    const ua = parser(req.headers["user-agent"]);
    const thisUserAgent = ua.ua;
    user.userAgent.push(thisUserAgent);
    await user.save();
    //   Generate Token
    const token = generateToken(user._id);

    // Send HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true,
    });

    const { _id, name, email, photo, phone, bio, isVerified, role } = user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      isVerified,
      role,
      token,
    });
  }
});



// Send Verification Email
const sendVerificationEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Check if user doesn't exists
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error("User already verified");
  }

  // Delete token if it exists in DB
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  // Create Verification Token and save
  const verificationToken = crypto.randomBytes(32).toString("hex") + user.id;

  // Hash token before saving to DB
  const hashedToken = hashToken(verificationToken);

  // Save Token to DB
  await new Token({
    userId: user._id,
    vToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * (60 * 1000), // Thirty minutes
  }).save();

  // Construct Verification Url
  const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

  // Verification Email
  // const message = `
  //     <h2>Hello ${user.name}</h2>
  //     <p>Please use the url below to verify your account</p>
  //     <p>This link is valid for 24hrs</p>

  //     <a href=${verificationUrl} clicktracking=off>${verificationUrl}</a>

  //     <p>Regards...</p>
  //     <p>Nestlypay Team</p>
  //   `;
  const subject = "Verify Your Account - Nestlypay";
  const send_to = user.email;
  const sent_from = "Nestlypay <hello@nestlypay.com>";
  const reply_to = "no-reply@nestlypay.com";
  const template = "email";
  const name = user.name;
  const link = verificationUrl;

  try {
    await sendEmail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({ success: true, message: "Verification Email Sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
  }
});



// Verify User
const verifyUser = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  // Hash Token
  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // fIND tOKEN in DB
  const userToken = await Token.findOne({
    vToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired Token!!!");
  }
  // Find User
  const user = await User.findOne({ _id: userToken.userId });

  if (user.isVerified) {
    res.status(400);
    throw new Error("User is already verified!!!");
  }

  // Now Verify user
  user.isVerified = true;
  await user.save();

  res.status(200).json({
    message: "Account Verification Successful",
  });
});



// Login With Google
const loginWithGoogle = asyncHandler(async (req, res) => {
  const { userToken } = req.body;
  // console.log(userToken);

  const ticket = await client.verifyIdToken({
    idToken: userToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const { name, email, picture, sub } = payload;
  const password = Date.now() + sub;
  // Get User Device Details
  const ua = parser(req.headers["user-agent"]);
  const userAgent = [ua.ua];

  // Check is the user exists
  const user = await User.findOne({ email });

  // User doesn't exist, register user
  if (!user) {
    // Create new use
    const newUser = await User.create({
      name,
      email,
      password,
      photo: picture,
      isVerified: true,
      userAgent,
    });

    if (newUser) {
      //   Generate Token
      const token = generateToken(newUser._id);

      // Send HTTP-only cookie
      res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 day
        sameSite: "none",
        secure: true,
      });

      const { _id, name, email, photo, phone, bio, isVerified, role } = newUser;
      res.status(200).json({
        _id,
        name,
        email,
        photo,
        phone,
        bio,
        isVerified,
        role,
        token,
      });
    }
  }

  // user exists, Login
  if (user) {
    //   Generate Token
    const token = generateToken(user._id);

    // Send HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true,
    });

    const { _id, name, email, photo, phone, bio, isVerified, role } = user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      isVerified,
      role,
      token,
    });
  }
});



// Logout User
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json("Logout Successful");
});

// Get Login Status
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  // Verify Token
  const verified = jwt.verify(token, process.env.MY_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

// Update User
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { name, email, photo, phone, role, isVerified } = user;
    user.email = email;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.photo = req.body.photo || photo;

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      phone: updatedUser.phone,
      role,
      isVerified,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, password } = req.body;

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }
  //Validate
  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Please add old and new password");
  }

  // check if old password matches password in DB
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  // Save new password
  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    res
      .status(200)
      .json({ message: "Password change successful, please re-login" });
  } else {
    res.status(400);
    throw new Error("Old password is incorrect");
  }

  // send Changepassword mail
  const subject = "Your Password was Changed";
  const send_to = user.email;
  const sent_from = "Nestlypay <hello@nestlypay.com>";
  const reply_to = "no-reply@nestlypay.com";
  const template = "changePassword";
  const name = user.name;


  try {
    await sendEmail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      name,
    );
    res
      .status(200)
      .json({ success: true, message: "Change Password mail Sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
  }



  // // Construct Reset Url
  // const resetUrl = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;
  // console.log(resetUrl);

  // // Reset Email
  // const subject = "Your Password was Changed";
  // const send_to = user.email;
  // const sent_from = process.env.EMAIL_USER;
  // const reply_to = "noreply@nestlypay.com";
  // const template = "changePassword";
  // const name = user.name;
  // const link = resetUrl;

  // try {
  //   await sendEmail(
  //     subject,
  //     send_to,
  //     sent_from,
  //     reply_to,
  //     template,
  //     name,
  //     link
  //   );
  //   res.status(200).json({ success: true, message: "Email Sent!!!" });
  // } catch (error) {
  //   res.status(500);
  //   throw new Error("Email not sent, please try again");
  // }
});




// forgotPassword
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User does not exist");
  }

  // Delete token if it exists in DB
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  // Create Reset Token
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  console.log(resetToken);

  // Hash token before saving to DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Save Token to DB
  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000), // Thirty minutes
  }).save();

  // Construct Reset Url
  const resetUrl = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;
  console.log(resetUrl);

  // Reset Email
  const subject = "Password Reset Request";
  const send_to = user.email;
  const sent_from = "Nestlypay <hello@nestlypay.com>";
  const reply_to = "no-reply@nestlypay.com";
  const template = "forgotPassword";
  const name = user.name;
  const link = resetUrl;

  try {
    await sendEmail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({ success: true, message: "Email Sent!!!" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
  }
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  // Hash token, then compare to Token in DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Find Token in DB
  const userToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired Token");
  }

  // Find user and reset password
  const user = await User.findOne({ _id: userToken.userId });
  user.password = password;
  await user.save();

  res.status(200).json({
    message: "Password Reset Successful, Please Login",
  });
});


// Send Automated Email
const sendAutomatedEmail = asyncHandler(async (req, res) => {
  const { subject, send_to, reply_to, template, url } = req.body;
  // res.send(template);

  if (!subject || !send_to || !reply_to || !template) {
    res.status(400);
    throw new Error("Missing automated email parameter");
  }

  // Get user
  const user = await User.findOne({ email: send_to });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // const subject = "Verify Your Account - Nestlypay";
  // const send_to = user.email;
  // const sent_from = process.env.EMAIL_USER;
  // const reply_to = "noreply@nestlypay.com";
  // const template = "email";
  const sent_from = process.env.EMAIL_USER;
  const name = user.name;
  const link = `${process.env.FRONTEND_URL}${url}`;
  // const role = user.role;

  try {
    await sendEmail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({ success: true, message: "Email Sent!!!" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
  }
});



module.exports = {
  registerUser,
  sendVerificationEmail,
  verifyUser,
  loginUser,
  logout,
  loginStatus,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
  sendAutomatedEmail,
  loginWithGoogle,
  sendLoginCode,
  loginWithCode,
};