import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

export const sendMessage = async (req, res) => {
  const { chatId, content } = req.body;

  if (!chatId || !content)
    return res.status(400).json({ msg: "chatId and content required" });

  const message = await Message.create({
    chatId,
    sender: req.user._id,
    content,
  });

  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message._id,
  });

  const fullMessage = await message.populate("sender", "-password");

  res.json(fullMessage);
};

export const getMessages = async (req, res) => {
  const { chatId } = req.params;

  const messages = await Message.find({ chatId })
    .populate("sender", "-password")
    .sort({ createdAt: 1 });

  res.json(messages);
};
