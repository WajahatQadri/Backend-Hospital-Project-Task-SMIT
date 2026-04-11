import Category from "../models/categoryModel.js";
import Medicine from "../models/medicineModel.js";
import Doctor from "../models/doctorModel.js";
import Patient from "../models/patientModel.js"; 
import Request from "../models/requestModel.js";

export const createCategory = async (req, res) => {
    try {
        let { name, label } = req.body;
        
        if (!name || !label) return res.status(400).json({ success: false, message: "Both are required" });

        name = name.trim().toUpperCase();
        label = label.trim().toUpperCase();

        const exists = await Category.findOne({ name, label });
        if (exists) {
            return res.status(400).json({
                success: false,
                message: "This item already exists in this list"
            });
        }

        const category = await Category.create({ name, label });
        res.status(201).json({
            success: true,
            message: "Category Added Successfully",
            category
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getAllCategories = async (req, res) => {
    try {
        const { labelName } = req.params;
        if (!labelName) {
            return res.status(400).json({ success: false, message: "Label name is required" });
        }

        const normalizedLabel = labelName.toUpperCase();

        // REMOVED THE ROLE CHECK HERE. 
        // We need this list to be public so new users can register.
        const categories = await Category.find({ label: normalizedLabel });
        
        return res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const deleteCategoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const categoryToDelete = await Category.findById(id);

        if (!categoryToDelete) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        const name = categoryToDelete.name;
        const label = categoryToDelete.label;

        if (label === "SPECIALIZATION") {
            const used = await Doctor.exists({
                specialization: name
            })
            if (used)
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete: Doctors are using this specialization.`
                })
        }
        if (label === "GENDER") {
            const used = await Patient.exists({
                gender: name
            });
            if (used)
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete: Patients are using this gender.`
                });
        }

        if (label === "BLOOD_GROUP") {
            const used = await Patient.exists({
                bloodgroup: name
            });
            if (used)
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete: Patients have this blood group.`
                });
        }

        if (label === "MEDICINE_TYPE") {
            const used = await Medicine.exists({
                category: name
            });
            if (used)
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete: Medicines are in this category.`
                });
        }
        await Category.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Category Deleted Successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getCategoryStats = async (req, res) => {
    try {
        const categories = await Category.find();
        
        const stats = await Promise.all(categories.map(async (cat) => {
            let linkedItems = [];

            if (cat.label === "SPECIALIZATION") {
                const docs = await Doctor.find({ specialization: cat.name }).populate("user", "name");
                linkedItems = docs.map(d => ({ id: d._id, name: d.user?.name }));
            } else if (cat.label === "GENDER" || cat.label === "BLOOD_GROUP") {
                const field = cat.label === "GENDER" ? "gender" : "bloodgroup";
                const patients = await Patient.find({ [field]: cat.name }).populate("user", "name");
                linkedItems = patients.map(p => ({ id: p._id, name: p.user?.name }));
            } else if (cat.label === "MEDICINE_TYPE") {
                const meds = await Medicine.find({ category: cat.name });
                linkedItems = meds.map(m => ({ id: m._id, name: m.name }));
            } else if (cat.label === "DISEASE_TYPE") {
                const patients = await Patient.find({ "history.disease": cat.name }).populate("user", "name");
                linkedItems = patients.map(p => ({ id: p._id, name: p.user?.name }));
            }

            return {
                _id: cat._id,
                name: cat.name,
                label: cat.label,
                usageCount: linkedItems.length,
                linkedItems: linkedItems 
            };
        }));

        res.status(200).json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const requestCategory = async (req, res) => {
    try {
        const { name, label } = req.body;
        
        await Request.create({
            userId: req.user._id,
            requesterName: req.user.name,
            requesterRole: req.user.role, // THIS WAS MISSING
            requestedName: name,
            label: label
        });

        res.status(201).json({ success: true, message: "Request sent to Admin." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyCategoryRequests = async (req, res) => {
    try {
        // Find requests that the Admin has already responded to (Not Pending)
        const requests = await Request.find({ userId: req.user._id, status: { $ne: "PENDING" } });
        res.status(200).json({ success: true, requests });
    } catch (error) { res.status(500).json({ success: false }); }
};

export const getAdminInbox = async (req, res) => {
    try {
        const requests = await Request.find({ status: "PENDING" }).sort("-createdAt");
        res.status(200).json({ success: true, requests });
    } catch (error) { res.status(500).json({ success: false }); }
};

export const approveRequest = async (req, res) => {
    try {
        const { message } = req.body; // Admin types this in the banner
        const request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false });

        // A. Create the real Category
        await Category.create({ name: request.requestedName, label: request.label });

        // B. Update status and save message instead of deleting
        // This is so the user can see the notification banner
        request.status = "APPROVED";
        request.adminMessage = message || "Your request has been approved.";
        await request.save();

        res.status(200).json({ success: true, message: "Approved and message saved." });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const rejectRequest = async (req, res) => {
    try {
        const { message } = req.body;
        const request = await Request.findById(req.params.id);
        
        request.status = "REJECTED";
        request.adminMessage = message || "Sorry, we cannot add this category.";
        await request.save();

        res.status(200).json({ success: true, message: "Rejected and message saved." });
    } catch (error) { res.status(500).json({ success: false }); }
};

export const deleteSeenRequest = async (req, res) => {
    try {
        await Request.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
};