const mongoose = require('mongoose');

const InvoiceSchema = mongoose.Schema({
    dueDate: Date,
    currency: String,
    items: [ { 
        itemName: String, 
        unitPrice: String, 
        quantity: String, 
        discount: String,
        description: String} ],
    rates: String,
    vat: Number,
    total: Number,
    subTotal: Number,
    notes: String,
    status: String,
    invoiceNumber: String,
    type: String,
    creator: [String],
    totalAmountReceived: Number,
    client: { 
        name: String, 
        email: String, 
        phone: String, 
        address: String },
    paymentRecords: [ {
        amountPaid: Number, 
        datePaid: Date, 
        paymentMethod: String, 
        note: String, 
        paidBy: String } ],
    createdAt: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model('Invoice', InvoiceSchema)




	
// {
// 	"name": "baki", 
// 	"address": "hello",
// 	"phone": "+2348166321899",
// 	"email": "test@gmail.com", 
// 	"dueDate": "2022-12-23T21:17:11.760Z",
// 	"date": "2022-12-23T21:17:11.760Z",
// 	"id": "0001",
// 	"note": "Please Make Payment to my account details below",
// 	"subTotal": "124.6",
// 	 "total": "100.5",
// 	"type": "fff",
// 	"vat": "3",
	
// 	"items": [ {
// 			"itemName": "Gold", 
// 			"unitPrice": "23.3", 
// 			"quantity": "2", 
// 			"discount": "0.5" } ],
	
// 	 "status": "unpaid",
// 	"totalAmountReceived": "455.6",
// 	"balanceDue": "23.9",
// 	"company": "GIG",
	
// 	"businessDetails": {
// 		"name": "baki", 
// 		"address": "hello",
// 	"phone": "+2348166321899",
// 	"email": "test@gmail.com"
// 	}    
// }


// const mongoose = require("mongoose");

// const { ObjectId } = mongoose.Schema;

// const invoiceSchema = new mongoose.Schema(
//   {
//     invoiceNumber: {
//       type: Number,
//       require: true,
//       unique: true,
//     },

//     customerId: {
//       type: ObjectId,
//       ref: "Client",
//     },

//     customerName: {
//       type: String,
//       require: true,
//     },
//     customerNumber: {
//       type: String,
//       require: true,
//     },
//     customerAddress: {
//       type: String,
//       require: true,
//     },

//     invoiceDate: {
//       type: Date,
//       require: true,
//     },
//     dueDate: {
//       type: Date,
//       require: true,
//     },

//     due: {
//       type: Number,
//     },
//     paid: {
//       type: Number,
//     },
//     discount: {
//       type: Number,
//       default: 0,
//     },
//     note: {
//       type: String,
//     },
//     subTotal: {
//       type: Number,
//       require: true,
//     },
//     items: [],
//     status: {
//       type: String,
//       enum: ["Unpaid", "Paid", "Partial"],
//     },

//     createdBy: {
//       type: ObjectId,
//       ref: "User",
//     },
//   },
//   { timestamps: true }
// );

// invoiceSchema.pre("save", async function (next) {
//   this.due = this.subTotal - this.paid - this.discount;
//   console.log("Triggerd save", this.due);

//   if (this.due === 0) {
//     this.status = "Paid";
//   } else if (this.due === this.subTotal) {
//     this.status = "Unpaid";
//   } else {
//     this.status = "Partial";
//   }
//   next();
// });

// module.exports = mongoose.model("Invoice", invoiceSchema);











// invoiceSchema.pre("findOneAndUpdate", async function (next) {
//   console.log("Triggerd subTotal", this.subTotal);
//   this.due = this.subTotal - this.paid - this.discount;
//   console.log("Triggerd update", this.due);

//   if (this.due === 0) {
//     this.status = "Paid";
//   } else if (this.due === this.subTotal) {
//     this.status = "Unpaid";
//   } else {
//     this.status = "Partial";
//   }
//   next();
// });







// const mongoose = require("mongoose");
// const Item = require("../models/itemModel");
// const Client = require("../models/clientModel");

// const { ObjectId } = mongoose.Schema;

// const invoiceSchema = new mongoose.Schema(
//     {
//         // Client
//         customerId: {
//             type: ObjectId,
//             ref: "Client",
//         },
    
//         customerName: {
//             type: String,
//             require: true,
//         },
//         customerNumber: {
//             type: String,
//             require: true,
//         },
//         customerAddress: {
//             type: String,
//             require: true,
//         },
//     // Invoice
//     invoiceNumber: {
//         type: Number,
//         require: true,
//         unique: true,
//     },
//     invoiceDate: {
//         type: Date,
//         require: true,
//     },
//     photo: {
//         type: String,
//         required: [true, "Please add an image"],
//         default: "https://i.ibb.co/4pDNDk1/avatar.png"
//     },


//     // Bill
//     bill_from_name: {

//     },
//     bill_from_email: {

//     },
//     bill_from_phone: {

//     },


//     //Issuance
//     dueDate: {
//         type: Date,
//         require: true,
//     },

//     due: {
//         type: Number,
//     },
//     currrency: {
//         type: String
//     },
//     paid: {
//         type: Number,
//     },
//     vat: {
//         type: Number,
//     },
//     discount: {
//         type: Number,
//         default: 0,
//     },
//     note: {
//         type: String,
//     },
//     subTotal: {
//         type: Number,
//         require: true,
//     },
//     total: {
//         type: Number,
//     },
//     type: {
//         type: String,
//     },
//     createdAt: {
//         type: Date,
//         default: new Date()
//     },
//     client: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true,
//         ref: "Client",
//     },
//     items: [],
//     status: {
//         type: String,
//         enum: ["Unpaid", "Paid", "Partial"],
//     },

//     createdBy: {
//         type: ObjectId,
//         ref: "User",
//     },
//     },
//     { timestamps: true }
// );

// invoiceSchema.pre("save", async function (next) {
//     this.due = this.subTotal - this.paid - this.discount;
//     console.log("Triggerd save", this.due);

//     if (this.due === 0) {
//     this.status = "Paid";
//     } else if (this.due === this.subTotal) {
//     this.status = "Unpaid";
//     } else {
//     this.status = "Partial";
//     }
//     next();
// });


// module.exports = mongoose.model("Invoice", invoiceSchema);
