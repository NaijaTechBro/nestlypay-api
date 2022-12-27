const mongoose = require ('mongoose');

const { ObjectId } = mongoose.Schema;

const ClientSchema = mongoose.Schema(
    {
    name: {
        type: String,
        require: true,
        text: true,
    },
    email: {
        type: String,
        require: true,
        text: true,
    },
    userId: {
        type: String
    },
    phone: {
        type: String,
        require: true,
        text: true,
    },
    address: {
        type: String,
        require: true,
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    createdBy: {
        type: ObjectId,
        ref: "User",
    },
    },
    { timestamps: true }
    );

module.exports = mongoose.model('Client', ClientSchema)