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
import validate from "../middlewares/validate.js";
import {
  createOrGetChatSchema,
  createGroupChatSchema,
  addRemoveUserSchema,
  leaveGroupSchema,
  renameGroupSchema,
  transferAdminSchema,
  updateGroupPicSchema,
} from "../validators/chatValidators.js";

const router = express.Router();

// All routes protected
router.use(protect);

// 1-on-1 chat
router.post("/create-or-get", validate(createOrGetChatSchema), createOrGetChat);

// Get all user chats
router.get("/my", getMyChats);

// Create group chat
router.post("/group", validate(createGroupChatSchema), createGroupChat);

// Add user to group
router.put("/group/add", validate(addRemoveUserSchema), addUserToGroup);

// Remove user from group
router.put("/group/remove", validate(addRemoveUserSchema), removeUserFromGroup);

// User leaving group
router.put("/group/leave", validate(leaveGroupSchema), leaveGroup);

// Rename group chat
router.put("/group/rename", validate(renameGroupSchema), renameGroup);

// Transfer group admin
router.put("/group/transfer-admin", validate(transferAdminSchema), transferGroupAdmin);

// Update group profile picture (Cloudinary)
router.put("/group/update-pic", upload.single("groupPic"), validate(updateGroupPicSchema), updateGroupProfilePic);

export default router;
