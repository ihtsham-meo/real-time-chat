// models/Chat.js
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    isGroupChat: { type: Boolean, default: false },
    users: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    groupName: { type: String }, // only for group chats
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
