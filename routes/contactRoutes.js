const express = require("express");
const { contactUs } = require("../controllers/contactController");
const router = express.Router();
const { isAuthenticatedUser } = require("../middleWare/authMiddleware");

router.post("/contacts", isAuthenticatedUser, contactUs);

module.exports = router;