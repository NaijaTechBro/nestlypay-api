const express = require("express");
const router = express.Router();

const { isAuthenticatedUser } = require("../middleware/authMiddleware");
const {
    getInvoicesByUser,
    getTotalCount,
    getInvoices,
    createInvoice,
    getInvoice,
    updateInvoice,
    deleteInvoice
} = require("../controllers/invoiceController");



router.get("/invoice/getInvoicesByUser", isAuthenticatedUser, getInvoicesByUser);
router.get("/invoice/gettotalCount", isAuthenticatedUser, getTotalCount);
router.get("/invoice/getInvoices", isAuthenticatedUser, getInvoices);
router.post("/invoice/create", isAuthenticatedUser, createInvoice);
router.get("/invoice/getInvoice/:invoice_id", isAuthenticatedUser, getInvoice);
router.put("/invoice/update/:invoice_id", isAuthenticatedUser, updateInvoice);
router.delete("/invoice/delete/:invoice_id", isAuthenticatedUser, deleteInvoice);

module.exports = router;