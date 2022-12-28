const express = require ('express');
const mongoose = require ('mongoose');

const Profile = require ('../models/profileModel');

const router = express.Router();

    const getProfiles = async (req, res) => { 
    try {
        const allProfiles = await Profile.find().sort({ _id: -1 });

        res.status(200).json(allProfiles);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

    const getProfile = async (req, res) => { 
    const { id } = req.params;

    try {
        const profile = await Profile.findById(id);

        res.status(200).json(profile);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

    const createProfile = async (req, res) => {
    const {
    name,
    email,
    phoneNumber,
    businessName,
    contactAddress, 
    photo,
    website,
    userId,
    } = req.body;

    const newProfile = new Profile({
    name,
    email,
    phoneNumber,
    businessName,
    contactAddress, 
    photo,
    website,
    userId,
    createdAt: new Date().toISOString() 
    })

    try {
    const existingUser = await Profile.findOne({ email })

    if(existingUser) return res.status(404).json({ message: "Profile already exist" })
        await newProfile.save();

        res.status(201).json(newProfile );
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}



    const getProfilesByUser = async (req, res) => {
    const { searchQuery } = req.query;

    try {
      // const email = new RegExp(searchQuery, "i");

        const profile = await Profile.findOne({ userId: searchQuery });

        res.json({ data: profile });
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
}



    const getProfilesBySearch = async (req, res) => {
    const { searchQuery } = req.query;

    try {
        const name = new RegExp(searchQuery, "i");
        const email = new RegExp(searchQuery, "i");

        const profiles = await Profile.find({ $or: [ { name }, { email } ] });

        res.json({ data: profiles });
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
}

    const updateProfile = async (req, res) => {
    const { id: _id } = req.params
    const profile = req.body

    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No client with that id')

    const updatedProfile = await Profile.findByIdAndUpdate(_id, {...profile, _id}, { new: true})

    res.json(updatedProfile)
}


    const deleteProfile = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No profile with id: ${id}`);

    await Profile.findByIdAndRemove(id);

    res.json({ message: "Profile deleted successfully." });
}


module.exports = {
    getProfiles,
    getProfile,
    createProfile,
    getProfilesByUser,
    getProfilesBySearch,
    updateProfile,
    deleteProfile,
}
