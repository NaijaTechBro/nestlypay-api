require('dotenv').config();

const express = require('express');

// Security
const helmet = require('helmet');
const cors = require('cors');
const whitelist = require('./config/whiteList')
const xss = require('xss-clean');

// Swagger UI
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerJsDocs = YAML.load("./api.yaml");

const nodemailer = require("nodemailer")
const app = express();
const path = require('path');
const sendEmail = require("./utils/sendEmail");
const { logger, logEvents } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const pdf = require("html-pdf");
const { fileURLToPath } = require('url');
const { dirname } = require('path');

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");


// const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
const PORT = process.env.PORT || PORT

// Route Import

const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const userRoutes = require("./routes/userRoutes");
const clientRoutes = require("./routes/clientRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const profileRoutes = require("./routes/profileRoutes");
const businessRoutes = require("./routes/businessRoutes");
const errorHandlerr = require("./middleware/errorMiddleware");

// Invoice Helper Import

const pdfTemplate = require("./documents/index");
const emailTemplate = require("./documents/email");

// Connecting to Database Environments

console.log(process.env.NODE_ENV)

connectDB()

// Middlewares

app.use(logger)

// Cross Origin Resource Sharing
app.use(cors(whitelist));

app.use(express.json({ limit: "30mb", extended: true}))
app.use(helmet());
app.use(xss());
app.use(cookieParser())
app.use(express.urlencoded({ limit: "30mb", extended: false}))
app.use(bodyParser.json())

app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes Middleware
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJsDocs));
app.use("/api/v1", authRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", clientRoutes);
app.use("/api/v1", invoiceRoutes);
app.use("/api/v1", profileRoutes);
app.use("/api/v1", contactRoutes);
app.use("/api/v1", businessRoutes);


var options = { format: 'A4' };
//SEND PDF INVOICE VIA EMAIL
app.post('/send-pdf', (req, res) => {
    const { email, company } = req.body

    pdf.create(pdfTemplate(req.body), options).toFile('invoice.pdf', async (err) => {
    
          // send mail with defined transport object
        const subject = `Invoice from ${company.businessName ? company.businessName : company.name}`;
        const send_to = email;
        const sent_from = process.env.EMAIL_USER;
        const reply_to = "noreply@nestlypay.com";
        const template = "emailTemplate";
        const  attachments = [{
            filename: 'invoice.pdf',
            path: `${__dirname}/invoice.pdf`
        }];

        
    try {
        await sendEmail(
    subject,
    send_to,
    sent_from,
    reply_to,
    template,
    attachments,
    );
    res
    .status(200)
    .json({ success: true, message: "Invoice sent as Email"});
} catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
}
});
});

    

//Problems downloading and sending invoice
// npm install html-pdf -g
// npm link html-pdf
// npm link phantomjs-prebuilt

//CREATE AND SEND PDF INVOICE
app.post('/create-pdf', (req, res) => {
    pdf.create(pdfTemplate(req.body), {}).toFile('invoice.pdf', (err) => {
        if(err) {
            res.send(Promise.reject());
        }
        res.send(Promise.resolve());
    });
});

//GET PDF INVOICE
app.get('/fetch-pdf', (req, res) => {
    res.sendFile(`${__dirname}/invoice.pdf`)
})


// Routes

app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', require('./routes/root'))
app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})
// Error Middleware
app.use(errorHandler)
app.use(errorHandlerr)

// Connect to MongoDB
mongoose.set("strictQuery", true);
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}...`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})