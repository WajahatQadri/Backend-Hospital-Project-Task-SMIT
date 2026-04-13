import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    name :{
        type : String,
        required : [true, "plz enter your name"],
        minLength : 3,
        maxLength : 40
    },
    email : {
        type : String,
        required : [true, "plz enter your name"],
        unique : true,
        trim : true
    },
    password : {
        type : String,
        required : [true, "plz enter your password"],
        minLength : 8,
        select : false
    },
    avatar : {
        public_id : {
            type : String,
            required : true
        },
        url : {
            type : String,
            required : true
        }
    },
    role : {
        type : String,    
        default : "USER"
    },
    resetPasswordToken : String,
    resetPasswordExpire : Date
},{
    timestamps : true
})

userSchema.pre("save", async function(){
    if(!this.isModified("password")){
        return 
    };
    this.password = await bcrypt.hash(this.password,10);
})

userSchema.methods.getJWTToken = function (){
    return jwt.sign({id : this._id}, process.env.MY_SECRET_KEY, {expiresIn : "7d"})
}

userSchema.methods.comparePassword = async function(enterdPassword){
    return await bcrypt.compare(enterdPassword,this.password)
}

userSchema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000
    return resetToken
}
 
const User = new mongoose.model("User", userSchema);
export default User