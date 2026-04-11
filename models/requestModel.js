import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    requesterName: { type: String, required: true },
    requesterRole: { type: String, required: true },

    requestedName: { type: String, required: true, uppercase: true, trim: true },
    label: { type: String, required: true, uppercase: true },

    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    adminMessage: { type: String, default: "" }
}, { timestamps: true });

const Request = mongoose.model("Request", requestSchema);
export default Request;