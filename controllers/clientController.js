const mongoose = require('mongoose');
const asyncHandler = require("express-async-handler");
const Client = require("../models/clientModel");



    // Get A Client
    const getClient = asyncHandler(async (req, res) => { 
    const { id } = req.params;

    try {
        const client = await Client.findById(id);
        
        res.status(200).json(client);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

    // Get All Clients
    const getClients = asyncHandler(async (req, res) => {
    const { page } = req.query;
    
    try {
        const LIMIT = 8;
        const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page
    
        const total = await Client.countDocuments({});
        const clients = await Client.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex);

        res.json({ data: clients, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)});
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
});

    // Create a Client
    const createClient = asyncHandler(async (req, res) => {

    const client = req.body

    const newClient = new Client({...client, createdAt: new Date().toISOString() })

    try {
        await newClient.save()
        res.status(201).json(newClient)
    } catch (error) {
        res.status(409).json(error.message)
    }
});

    // Update Client
    const updateClient = asyncHandler(async (req, res) => {
    const { id: _id } = req.params
    const client = req.body

    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No client with that id')

    const updatedClient = await Client.findByIdAndUpdate(_id, {...client, _id}, { new: true})

    res.json(updatedClient)
});


    // Delete Client
    const deleteClient = asyncHandler(async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No Client with that id')

    await Client.findByIdAndRemove(id)

    res.json({message: 'Client deleted successfully'})
});


    // Get a Client by a User
    const getClientsByUser = asyncHandler(async (req, res) => {
    const { searchQuery } = req.query;

    try {
        const clients = await Client.find({ userId: searchQuery });

        res.json({ data: clients });
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
});



// export const getClients = async (req, res) => {
//     const userId = req.body

//     try {
//         const allClients = await Client.find({userId: userId}).sort({_id:-1}) 
//         //find({}).sort({_id:-1}) to sort according to date of creation

//         res.status(200).json(allClients)

//     } catch (error) {
//         res.status(409).json(error.message)
        
//     }
    
// }


module.exports = {
    getClient,
    getClients,
    createClient,
    updateClient,
    deleteClient,
    getClientsByUser,
}