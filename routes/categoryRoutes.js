import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../utils/auth.js";
import { createCategory, deleteCategoryController, getAllCategories, getCategoryStats } from "../controllers/categoryControllers.js";
const categoryRouter = express.Router();

categoryRouter.post("/add",isAuthenticatedUser,authorizeRoles("ADMIN","DOCTOR"),createCategory);
categoryRouter.get("/get-all/:labelName",getAllCategories);
categoryRouter.delete("/delete/:id",isAuthenticatedUser,authorizeRoles("ADMIN"),deleteCategoryController);
categoryRouter.get("/stats",isAuthenticatedUser,authorizeRoles("ADMIN"),getCategoryStats);

export default categoryRouter;