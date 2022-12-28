const mongoose  = require('mongoose')
const Invoice = require('../models/invoiceModel');


// Get Invoices by users
    const getInvoicesByUser = async (req, res) => {
    const {searchQuery} = req.query;

    try {
        const invoices = await Invoice.find({ creator: searchQuery });

        res.status(200).json({ data: invoices });
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
}
    // Get the total number of user
    const getTotalCount = async (req, res) => {
    const {searchQuery} = req.query;

    try {
        // const invoices = await InvoiceModel.find({ creator: searchQuery });
        const totalCount = await Invoice.countDocuments({ creator: searchQuery });

        res.status(200).json(totalCount);
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
}

    // Get Invoices
    const getInvoices = async (req, res) => {

    try {
        const allInvoices = await Invoice.find({}).sort({_id:-1}) 

        res.status(200).json(allInvoices)

    } catch (error) {
        res.status(409).json(error.message)
        
    }
    
}

    // Create Invoices
    const createInvoice = async (req, res) => {

    const invoice = req.body

    const newInvoice = new Invoice(invoice)

    try {
        await newInvoice.save()
        res.status(201).json(newInvoice)
    } catch (error) {
        res.status(409).json(error.message)
    }

}
    const getInvoice = async (req, res) => { 
    const { id } = req.params;

    try {
        const invoice = await Invoice.findById(id);
        
        res.status(200).json(invoice);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

    // Update Invoices
    const updateInvoice = async (req, res) => {
    const { id: _id } = req.params
    const invoice = req.body

    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No invoice with that id')

    const updatedInvoice = await Invoice.findByIdAndUpdate(_id, {...invoice, _id}, { new: true})

    res.json(updatedInvoice)
}

    // Delete Invoices
    const deleteInvoice = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No invoice with that id')

    await Invoice.findByIdAndRemove(id)

    res.json({message: 'Invoice deleted successfully'})
}




module.exports = {
    getInvoicesByUser,
    getTotalCount,
    getInvoices,
    createInvoice,
    getInvoice,
    updateInvoice,
    deleteInvoice,

}