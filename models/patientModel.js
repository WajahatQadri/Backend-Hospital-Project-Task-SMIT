import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    role: { 
        type: String, 
        default: "USER"
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true,
    },
    bloodgroup: {
        type: String,
    },
    contact: {
        type: Number,
        required: true
    },
    address: {
        type: String,
    },
    assigned_doctors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor"
    }],
    disease: {
        type: String,
        required: true
    },
    notes:{
        type: String,
    },
    history: [{
        disease: String,
        treatment: Date,
        notes: String
    }],
    medicines: [{
        medicine: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Medicine"
        },
        givenBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor"
        },
        dosage: String
    }]
}, {
    timestamps: true
})

const Patient = mongoose.model("Patient", patientSchema);
export default Patient