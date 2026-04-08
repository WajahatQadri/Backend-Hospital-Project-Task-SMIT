import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const isAuthenticatedUser = async (req,res,next) => {
    try {
        const { token } = req.cookies;
        if(!token){
            return res.status(400).json({
                success : false,
                message : " Please Login First"
            })
        }
        const decodedData = jwt.verify(token,process.env.MY_SECRET_KEY);
        req.user = await User.findById(decodedData.id)
        next()
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

export const authorizeRoles = (...roles) => {
    return(req,res,next) => {
        if(!roles.includes(req.user.role)){
            res.status(400).json({
                success : false,
                message : `Role : ${req.user.role} don't have access to this route`
            })
        }
        next()
    }
}