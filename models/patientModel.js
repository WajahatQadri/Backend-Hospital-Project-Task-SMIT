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
      type: String,
      required: true,
      match: [
      /^(\d{4}[-\s]\d{7}|\+\d{1,3}[-\s]\d{3}[-\s]\d{7})$/, 
      'Invalid phone numberformat'
    ]},
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