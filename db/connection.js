import mongoose from "mongoose";

const connection = async () => {
    try {
        await mongoose.connect(process.env.URL)
        console.log("Connection Successful");        
    } catch (error) {
        console.log(error);        
    }
}

export default connection