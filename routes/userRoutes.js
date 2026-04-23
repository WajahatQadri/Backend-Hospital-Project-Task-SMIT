import express from "express";
import { deleteUserController, forgotPasswordController, getUserProfileController, loginUserController, logoutUserController, registerUserController, resetPasswordRequestController, updatePasswordController, updateUserProfileController } from "../controllers/userControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../utils/auth.js";
import { deleteAnyUser, getAllUsers } from "../controllers/adminControllers.js";

const userRouter = express.Router();

userRouter.post("/register-user",registerUserController);
userRouter.post("/login", loginUserController);
userRouter.post("/logout",isAuthenticatedUser, logoutUserController);
userRouter.get("/user-profile",isAuthenticatedUser ,getUserProfileController);
userRouter.put("/update-profile",isAuthenticatedUser ,updateUserProfileController);
userRouter.put("/update-password",isAuthenticatedUser,updatePasswordController);
userRouter.delete("/delete-profile",isAuthenticatedUser,deleteUserController);
userRouter.post("/forgot-password",forgotPasswordController);
userRouter.post("/reset-password/:token",resetPasswordRequestController);

// Admin Routes
userRouter.get("/admin/get-all-users",isAuthenticatedUser,authorizeRoles("ADMIN"),getAllUsers);
userRouter.delete("/admin/delete-user/:id",isAuthenticatedUser,authorizeRoles("ADMIN"),deleteAnyUser);

export default userRouter