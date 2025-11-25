// routes/chatRoutes.js
import express from "express";
import { createOrGetChat, getMyChats, createGroupChat } from "../controllers/chatController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.post("/create-or-get", createOrGetChat);
router.post("/group", createGroupChat);
router.get("/my", getMyChats);
export default router;
