import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    company: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    purpose: [{
        type: String,
        required: true
    }],
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    expiryDate: {
        type: Date,
        required: true
    },
    potency: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Available", "Out of Stock", "Discontinued"],
        default: "Available"
    }
}, { timestamps: true });

const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;