import mongoose from "mongoose";

let isConnected = false; 

const connection = async () => {
    if (isConnected) {
        return;
    }

    try {
        const db = await mongoose.connect(process.env.URL);
        
        isConnected = db.connections[0].readyState;
        console.log("MongoDB Connected Successfully");        
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        throw error; // Let the middleware catch this
    }
}

export default connection;