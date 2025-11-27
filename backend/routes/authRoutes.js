//authRoutes.js
import express from "express";
import { register, login, logout, updateProfile } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
// update profile (name, email, password, profilePic)
authRoutes.put("/profile", protect, upload.single("profilePic"), updateProfile);

export default authRoutes;