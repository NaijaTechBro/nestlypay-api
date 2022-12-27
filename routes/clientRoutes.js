const express = require("express");
const User = require("../models/userModel.js");
const { isAuthenticatedUser } = require("../middleware/authMiddleware");
const {
    getClient,
    getClients,
    createClient,
    updateClient,
    deleteClient,
    getClientsByUser,

} = require("../controllers/clientController");

const router = express.Router();

router.get("/client/getClient/:id", isAuthenticatedUser,  getClient );
router.get("/client/getClientByUser", isAuthenticatedUser,  getClientsByUser );
router.get("/client/gettotalClients", isAuthenticatedUser,   getClients);
router.post("/client/create", isAuthenticatedUser,  createClient);
router.patch("/client/update/:id", isAuthenticatedUser,  updateClient)
router.delete("/client/delete/:id", isAuthenticatedUser,  deleteClient);

module.exports = router;