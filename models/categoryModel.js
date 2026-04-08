import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
        //specialized in cardio, general medicine etc
    },
    label: {
        type: String,
        required: true,
        uppercase : true,
        trim : true,
        // enum: ["Specialization", "MedicineType", "DiseaseType","BloodGroup","Gender"]
    }
}, { timestamps: true });

categorySchema.index({ name: 1, label: 1 }, { unique: true });
const Category = mongoose.model("Category", categorySchema);
export default Category;