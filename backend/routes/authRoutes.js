//authRoutes.js
import express from "express";
import { register, login, logout, updateProfile } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import validate from "../middlewares/validate.js";
import { registerSchema, loginSchema, updateProfileSchema } from "../validators/authValidators.js";

const authRoutes = express.Router();

authRoutes.post("/register", validate(registerSchema), register);
authRoutes.post("/login", validate(loginSchema), login);
authRoutes.post("/logout", logout);
// update profile (name, email, password, profilePic)
authRoutes.put("/profile", protect, upload.single("profilePic"), validate(updateProfileSchema), updateProfile);

export default authRoutes;