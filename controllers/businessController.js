const mongoose = require('mongoose');
const asyncHandler = require("express-async-handler");
const Business = require("../models/businessModel");


    // Create a Business
    const createBusiness = asyncHandler(async (req, res) => {

        const business = req.body
    
        const newBusiness = new Business({...business, createdAt: new Date().toISOString() })
    
        try {
            await newBusiness.save()
            res.status(201).json(newBusiness)
        } catch (error) {
            res.status(409).json(error.message)
        }
    });

    // Get A getBusiness
    const getBusiness = asyncHandler(async (req, res) => { 
    const { id } = req.params;

    try {
        const business = await Business.findById(id);
        
        res.status(200).json(business);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

    // Get All Businesses
    const getBusinesses = asyncHandler(async (req, res) => {
    const { page } = req.query;
    
    try {
        const LIMIT = 8;
        const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page
    
        const total = await Business.countDocuments({});
        const businesses = await Business.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex);

        res.json({ data: businesses, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)});
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
});

    // Update Business
    const updateBusiness = asyncHandler(async (req, res) => {
    const { id: _id } = req.params
    const business = req.body

    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No business with that id')

    const updatedBusiness = await Business.findByIdAndUpdate(_id, {...business, _id}, { new: true})

    res.json(updatedBusiness)
});


    // Delete Business
    const deleteBusiness = asyncHandler(async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No business with that id')

    await Business.findByIdAndRemove(id)

    res.json({message: 'Business deleted successfully'})
});


    // Get a business by a User
    const getBusinessesByUser = asyncHandler(async (req, res) => {
    const { searchQuery } = req.query;

    try {
        const businesses = await Business.find({ userId: searchQuery });

        res.json({ data: businesses });
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
});



module.exports = {
    getBusiness,
    getBusinesses,
    getBusinessesByUser,
    createBusiness,
    updateBusiness,
    deleteBusiness,

}