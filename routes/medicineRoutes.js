import express from "express";
import { createMedicine, getAllMedicines, updateMedicine, deleteMedicine, getMedicineDetails } from "../controllers/medicineControllers.js";
import { isAuthenticatedUser, authorizeRoles } from "../utils/auth.js";

const medicineRouter = express.Router();

medicineRouter.get("/get-all", getAllMedicines);
medicineRouter.get("/get-details/:id", getMedicineDetails);
medicineRouter.post("/admin/new", isAuthenticatedUser, authorizeRoles("ADMIN"), createMedicine);
medicineRouter.put("/admin/update/:id", isAuthenticatedUser, authorizeRoles("ADMIN"), updateMedicine);
medicineRouter.delete("/admin/delete/:id", isAuthenticatedUser, authorizeRoles("ADMIN"), deleteMedicine);

export default medicineRouter;