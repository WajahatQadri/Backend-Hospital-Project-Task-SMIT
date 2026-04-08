import express from "express";
import { registerPatient, getMyPatientProfile, getAllPatients, addMedicalHistory, prescribeMedicine, undoPrescription, adminDeletePatient, deletePatientProfile, bookAppointment, deleteAppointment } from "../controllers/patientControllers.js";
import { isAuthenticatedUser, authorizeRoles } from "../utils/auth.js";

const patientRouter = express.Router();

patientRouter.post("/register", isAuthenticatedUser, registerPatient);
patientRouter.get("/me", isAuthenticatedUser, authorizeRoles("PATIENT","DOCTOR"), getMyPatientProfile);
patientRouter.get("/admin/all", isAuthenticatedUser, authorizeRoles("ADMIN","DOCTOR"), getAllPatients);
patientRouter.put("/add-history/:patientId", isAuthenticatedUser, authorizeRoles("DOCTOR","ADMIN","PATIENT"), addMedicalHistory);
patientRouter.put("/prescribe/:patientId", isAuthenticatedUser, authorizeRoles("DOCTOR","ADMIN","PATIENT"), prescribeMedicine);
patientRouter.put("/undo-prescribe/:patientId/:prescriptionId", isAuthenticatedUser, authorizeRoles("DOCTOR"), undoPrescription);
patientRouter.delete("/admin/delete-patient/:id",isAuthenticatedUser,authorizeRoles("ADMIN"),adminDeletePatient);
patientRouter.delete("/delete-patient",isAuthenticatedUser,deletePatientProfile);
patientRouter.put("/book-appointment/:doctorId", isAuthenticatedUser, authorizeRoles("PATIENT"), bookAppointment);
patientRouter.delete("/delete-appointment/:doctorId/:patientId", isAuthenticatedUser, deleteAppointment);

export default patientRouter;