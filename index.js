import dotenv from "dotenv"
dotenv.config()

import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import doctorRouter from "./routes/doctorRoutes.js";
import patientRouter from "./routes/patientRoutes.js";
import medicineRouter from "./routes/medicineRoutes.js";
import connection from "./db/connection.js";
import cors from "cors"

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin : "http://localhost:5173",
    credentials : true
}));

connection();

app.use(express.json());
app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories",categoryRouter);
app.use("/api/v1/doctors",doctorRouter);
app.use("/api/v1/patients",patientRouter);
app.use("/api/v1/medicines",medicineRouter);

const port = process.env.PORT;
app.listen( port , () => {
    console.log(`listening on port ${port}`);
})