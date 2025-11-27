//backend/routes/messageRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { getChatMessages, sendMessage, markAsSeen } from "../controllers/messageController.js";

const router = express.Router();

router.use(protect);

router.get("/chat/:chatId", getChatMessages);

router.post("/send", upload.single("file"), sendMessage);

router.put("/seen/:messageId", markAsSeen);

export default router;
