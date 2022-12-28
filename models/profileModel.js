const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
    name: String,
    email: {
        type: String, 
        required: true, 
        unique: true},
    phoneNumber: String,
    businessName: String,
    contactAddress: String,
    paymentDetails: String, 
    photo: String,
    website: String,
    userId: [String],
})

module.exports = mongoose.model('Profile', profileSchema)
