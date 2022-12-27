const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    items: [ {
        itemName: String, 
        unitPrice: String, 
        quantity: String, 
        discount: String,
        description: String,
        amount: String,
        } ],
})



module.exports = mongoose.model("Item", itemSchema);