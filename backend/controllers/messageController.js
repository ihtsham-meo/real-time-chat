//backend/controllers/messageController.js
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import uploadToCloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";

export const getChatMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    const error = new Error("Invalid Chat Id");
    error.statusCode = 400;
    throw error;
  }

  const skip = (page - 1) * limit;

  const [messages, totalCount] = await Promise.all([
    Message.find({ chat: chatId })
      .populate("sender", "name email profilePic")
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ chat: chatId }),
  ]);

  res.json({
    messages: messages.reverse(), // Reverse to show oldest first in the page
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalMessages: totalCount,
      hasMore: skip + messages.length < totalCount,
    },
  });
});

// ===================== SEND MESSAGE ======================
export const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content } = req.body;
  const senderId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    const error = new Error("Invalid chat id");
    error.statusCode = 400;
    throw error;
  }

  let messageData = {
    chat: chatId,
    sender: senderId,
    content: content || "",
    messageType: "text",
  };

  // ===== FILE UPLOAD FLOW =====
  if (req.file) {
    const mime = req.file.mimetype;

    // decide type
    let type = "file";
    if (mime.startsWith("image/")) type = "image";
    else if (mime.startsWith("audio/")) type = "audio";

    const uploadedUrl = await uploadToCloudinary(
      req.file.buffer,
      "mern-chat-app",   // folder in Cloudinary
      type
    );

    messageData = {
      ...messageData,
      messageType: type,
      fileUrl: uploadedUrl,
      fileName: req.file.originalname,
    };
  }

  const message = await Message.create(messageData);
  await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

  const fullMessage = await Message.findById(message._id).populate(
    "sender",
    "name email profilePic"
  );

  // respond
  res.status(201).json({ message: fullMessage });
});

export const markAsSeen = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const message = await Message.findByIdAndUpdate(
    messageId,
    { $addToSet: { seenBy: userId } },
    { new: true }
  );

  res.json({ message });
});
