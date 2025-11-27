//backend/controllers/messageController.js
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import uploadToCloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";


export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId))
      return res.status(400).json({ message: "Invalid Chat Id" });

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email profilePic")
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===================== SEND MESSAGE ======================
export const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const senderId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(chatId))
      return res.status(400).json({ message: "Invalid chat id" });

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
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const markAsSeen = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { seenBy: userId } },
      { new: true }
    );

    res.json({ message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
