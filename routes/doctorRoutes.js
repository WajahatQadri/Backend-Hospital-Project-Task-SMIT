import express from "express";
import { adminDeleteDoctor, adminGetDoctorDetails, applyToBeDoctor, approveDoctor, cancelDoctorApplication, deleteDoctorProfile, getAllDoctors, getDoctorDetails, getDoctorSelfProfileController, getPendingDoctors, rejectDoctorApplication, updateDoctorProfile } from "../controllers/doctorControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../utils/auth.js";
const doctorRouter = express.Router();

doctorRouter.post("/doctor/apply", isAuthenticatedUser, applyToBeDoctor);
doctorRouter.get("/get-all-doctors", getAllDoctors);
doctorRouter.get("/doctor/my-profile", isAuthenticatedUser, authorizeRoles("DOCTOR"), getDoctorSelfProfileController);
doctorRouter.get("/doctor/:id", getDoctorDetails);
doctorRouter.put("/doctor/update", isAuthenticatedUser, authorizeRoles("DOCTOR"), updateDoctorProfile);
doctorRouter.delete("/doctor/delete",isAuthenticatedUser,deleteDoctorProfile);
doctorRouter.delete("/doctor/delete-request",isAuthenticatedUser,cancelDoctorApplication);

// for Admin
doctorRouter.get("/admin/doctor/:id",isAuthenticatedUser,authorizeRoles("ADMIN"), adminGetDoctorDetails);
doctorRouter.get("/admin/doctors/pending", isAuthenticatedUser, authorizeRoles("ADMIN"), getPendingDoctors);
doctorRouter.put("/admin/doctor/approve/:doctorId", isAuthenticatedUser, authorizeRoles("ADMIN"), approveDoctor);
doctorRouter.delete("/admin/doctor/reject/:doctorId",isAuthenticatedUser,authorizeRoles("ADMIN"),rejectDoctorApplication);
doctorRouter.delete("/admin/doctor/delete/:id", isAuthenticatedUser, authorizeRoles("ADMIN"), adminDeleteDoctor);

export default doctorRouter;