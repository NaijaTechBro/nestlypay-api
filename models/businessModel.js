const mongoose = require ('mongoose');

const BusinessSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Please Enter your firstName"]
    },
    lastName: {
        type: String,
        required: [true, "Please Enter your lastName"]
    },
    name: {
        type: String,
        require: [true, "Please Enter your business anme"]
    },
    email: {
        type: String,
        required: [true, "Please add your email"],
        unique: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid email"
        ]
    },
    companyName: {
        type: String,
        required: [true, "Please add your Company name"],
    },
    companyEmail: {
        type: String,
        required: [true, "Please add your Company email"],
        unique: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid email"
        ]
    },
    address1: {
        type: String,
        required: [true, "Please add your house address"]
    },
    address2: {
        type: String,
        required: [false, "Please add your home address"]
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    postalCode: {
        type: String,
    },
    country: {
        type: String,
    },
    website: {
        type: String,
    }


})

module.exports = mongoose.model('Business', BusinessSchema)