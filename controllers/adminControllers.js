import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";
import Patient from "../models/patientModel.js"

export const getAllUsers = async (req,res) => {
    try {
        const [users, doctors, patients] = await Promise.all([
            User.find(),
            Doctor.find().populate("user","name email"),
            Patient.find().populate("user", "name email").populate("medicines.medicine", "name price potency")
        ]);

        const allRecords = [...users, ...doctors, ...patients];

        if (allRecords.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found in any collection"
            });
        }

        return res.status(200).json({
            success: true,
            totalUsersCount: allRecords.length,
            users: allRecords
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const deleteAnyUser = async (req, res) => {
    try { 
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        if (user.role === "PATIENT") {
            await Patient.findOneAndDelete({ user: userId });
        } else if (user.role === "DOCTOR") {
            await Doctor.findOneAndDelete({ user: userId });
        }
        await User.findByIdAndDelete(userId);
        
        res.status(200).json({
            success: true,
            message: `(${user.role}) and their profile deleted successfully`
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
