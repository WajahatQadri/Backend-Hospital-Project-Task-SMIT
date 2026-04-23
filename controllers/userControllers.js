import Doctor from "../models/doctorModel.js";
import User from "../models/userModel.js"
import { sendToken } from "../utils/JWTToken.js"
import { sendEmail } from "../utils/sendEmail.js"
import crypto from "crypto"

export const registerUserController = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all the blanks!"
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: "user",
                url: "user_url"
            }
        });

        if(!user){
            return res.status(400).json({
                success : false,
                message: "user not created"
            })
        }

        sendToken(user, 201, res);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const loginUserController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "email and password both are required"
            })
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return res.status(400).json({
                success: false,
                message: "invalid credentials"
            })
        }

        sendToken(user, 200, res)
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

export const logoutUserController = async (req, res) => {
    try {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
            secure : true,
            sameSite : "none"
        })
        res.status(200).json({
            success: true,
            message: "Logged Out Successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

export const getUserProfileController = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

export const updateUserProfileController = async (req, res) => {
    try {
        let user = await User.findByIdAndUpdate(req.user._id, req.body, {
            new: true,
            runValidators: true
        })
        return res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const updatePasswordController = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        const user = await User.findByIdAndUpdate(req.user._id).select("+password");
        const isMatched = await user.comparePassword(oldPassword);
        if (!isMatched) {
            return res.status(400).json({
                success: false,
                message: "old password is incorrect"
            })
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "passwords do not match"
            })
        }

        user.password = newPassword;
        await user.save();

        sendToken(user, 200, res)
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const deleteUserController = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role; 

        if (userRole === "PATIENT") {
            await Patient.findOneAndDelete({ user: userId });
        } 
        
        if (userRole === "DOCTOR" || userRole === "Doctor") {
            await Doctor.findOneAndDelete({ user: userId });
        }

        await User.findByIdAndDelete(userId);

        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });

        res.status(200).json({
            success: true,
            message: "User and all associated data deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const forgotPasswordController = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "user not found"
            })
        }
        const resetToken = user.getResetPasswordToken();
        user.save({ validatorsBeforeSave: false });
        // const resetUrl = `http://localhost:5173/reset-password${resetToken}`;
        const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/password/reset/${resetToken}`;
        const message = `if you want to reset password click on this link ${resetUrl} If you did not request this, please ignore.`
        try {
            await sendEmail({
                email: user.email,
                subject: "reset password",
                message
            })
            res.status(200).json({
                success: true,
                message: `Email sent to ${user.email}`
            })
        } catch (error) {
            user.ResetPasswordToken = undefined;
            user.ResetPasswordExpire = undefined;
            await user.save({ validatorsBeforeSave: false });
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const resetPasswordRequestController = async (req,res) => {
    try {
        const token = crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user = await User.findOne({
            resetPasswordToken : token,
            resetPasswordExpire: { $gt: Date.now() }
        })

        if(!user){
            return res.status(400).json({
                success: false,
                message: "Token invalid or expired"
            });
        }

        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        sendToken(user,200,res);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}