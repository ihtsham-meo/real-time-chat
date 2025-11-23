import Chat from "../models/Chat.js";
import User from "../models/User.js";

export const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ msg: "UserId required" });

  // Check existing chat
  let chat = await Chat.findOne({
    users: { $all: [req.user._id, userId] },
  })
    .populate("users", "-password")
    .populate("lastMessage");

  if (chat) return res.json(chat);

  // Create new chat
  const newChat = await Chat.create({
    users: [req.user._id, userId],
  });

  const fullChat = await newChat.populate("users", "-password");
  res.status(201).json(fullChat);
};

export const fetchChats = async (req, res) => {
  const chats = await Chat.find({
    users: { $in: [req.user._id] },
  })
    .populate("users", "-password")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  res.json(chats);
};
