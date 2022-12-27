const express = require("express");
const User = require("../models/userModel.js");
const { isAuthenticatedUser } = require("../middleware/authMiddleware");
const {
    getBusiness,
    getBusinesses,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    getBusinessesByUser,

} = require("../controllers/businessController");

const router = express.Router();

router.get("/business/getBusiness/:id", isAuthenticatedUser,  getBusiness );
router.get("/business/getBusinessByUser", isAuthenticatedUser, getBusinessesByUser );
router.get("/business/gettotalBusinesses", isAuthenticatedUser,   getBusinesses);
router.post("/business/create", isAuthenticatedUser,  createBusiness);
router.patch("/business/update/:id", isAuthenticatedUser,  updateBusiness)
router.delete("/business/delete/:id", isAuthenticatedUser,  deleteBusiness);

module.exports = router;