import Medicine from "../models/medicineModel.js";
import ApiFeatures from "../utils/apiFeatures.js"

export const createMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.create(req.body);
        res.status(201).json({ success: true, medicine });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllMedicines = async (req, res) => {
    try {
        const resultPerPage = 10;
        const medicinesCount = await Medicine.countDocuments();

        const apiFeature = new ApiFeatures(Medicine.find(), req.query)
            .search()
            .filter()
            .sort()
            .pagination(resultPerPage);

        const medicines = await apiFeature.query;

        res.status(200).json({
            success: true,
            count: medicines.length,
            medicinesCount,
            medicines
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true
        });
        if (!medicine) return res.status(404).json({ success: false, message: "Medicine not found" });
        
        if (medicine.stock > 0) medicine.status = "Available";
        else medicine.status = "Out of Stock";
        await medicine.save();

        res.status(200).json({ success: true, medicine });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteMedicine = async (req, res) => {
    try {
        await Medicine.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Medicine removed from system" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMedicineDetails = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        
        if (!medicine) {
            return res.status(404).json({ success: false, message: "Medicine not found" });
        }

        res.status(200).json({
            success: true,
            medicine
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};