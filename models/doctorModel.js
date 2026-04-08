import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true,
    },
    role : {
        type : String,
        default : "USER"
    },
    specialization : {
        type : String,
        required : true
    },
    contact : {
        type : String,
        required : true
    },
    fees : {
        type : Number,
        required : true
    },
    days : [{
        type : String,
        required : true
    }],
    timing : [{
        type : String,
        required : true
    }],
    isApproved: {
        type: Boolean,
        default: false
    },
    patients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient"
    }],
    experience: {
        type: String,
        required: true
    },
    hospital: {
        type: String,
        required: true
    },
},{
    timestamps : true
})

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor