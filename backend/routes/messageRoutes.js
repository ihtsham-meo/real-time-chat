//backend/routes/messageRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { getChatMessages, sendMessage, markAsSeen } from "../controllers/messageController.js";
import validate from "../middlewares/validate.js";
import { sendMessageSchema } from "../validators/messageValidators.js";

const router = express.Router();

router.use(protect);

router.get("/chat/:chatId", getChatMessages);

router.post("/send", upload.single("file"), validate(sendMessageSchema), sendMessage);

router.put("/seen/:messageId", markAsSeen);

export default router;
