// routes/chatRoutes.js
import express from "express";
import {
  createOrGetChat,
  getMyChats,
  createGroupChat,
  addUserToGroup,
  removeUserFromGroup,
  leaveGroup,
  renameGroup,
  transferGroupAdmin,
  updateGroupProfilePic,
} from "../controllers/chatController.js";

import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js"; // <-- Cloudinary upload middleware

const router = express.Router();

// All routes protected
router.use(protect);

// 1-on-1 chat
router.post("/create-or-get", createOrGetChat);

// Get all user chats
router.get("/my", getMyChats);

// Create group chat
router.post("/group", createGroupChat);

// Add user to group
router.put("/group/add", addUserToGroup);

// Remove user from group
router.put("/group/remove", removeUserFromGroup);

// User leaving group
router.put("/group/leave", leaveGroup);

// Rename group chat
router.put("/group/rename", renameGroup);

// Transfer group admin
router.put("/group/transfer-admin", transferGroupAdmin);

// Update group profile picture (Cloudinary)
router.put("/group/update-pic", upload.single("groupPic"), updateGroupProfilePic);

export default router;
