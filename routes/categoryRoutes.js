import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../utils/auth.js";
import { approveRequest, createCategory, deleteCategoryController, deleteSeenRequest, getAdminInbox, getAllCategories, getCategoryStats, getMyCategoryRequests, rejectRequest, requestCategory } from "../controllers/categoryControllers.js";
const categoryRouter = express.Router();

categoryRouter.post("/add",isAuthenticatedUser,authorizeRoles("ADMIN","DOCTOR"),createCategory);
categoryRouter.get("/get-all/:labelName",getAllCategories);
categoryRouter.delete("/delete/:id",isAuthenticatedUser,authorizeRoles("ADMIN"),deleteCategoryController);
categoryRouter.get("/stats",isAuthenticatedUser,authorizeRoles("ADMIN"),getCategoryStats);
categoryRouter.post("/request", isAuthenticatedUser, requestCategory);
categoryRouter.get("/my-requests", isAuthenticatedUser, getMyCategoryRequests);
categoryRouter.delete("/request/delete/:id", isAuthenticatedUser, deleteSeenRequest);

// Admin
categoryRouter.get("/admin/inbox", isAuthenticatedUser, authorizeRoles("ADMIN"), getAdminInbox);
categoryRouter.put("/admin/approve-request/:id", isAuthenticatedUser, authorizeRoles("ADMIN"), approveRequest);
categoryRouter.put("/admin/reject-request/:id", isAuthenticatedUser, authorizeRoles("ADMIN"), rejectRequest);

export default categoryRouter;