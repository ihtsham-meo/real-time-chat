// controllers/chatController.js
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import uploadToCloudinary from "../config/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createOrGetChat = asyncHandler(async (req, res) => {
  const { userId } = req.body; // the other user's id
  const myId = req.user._id;

  // check existing one-to-one chat
  let chat = await Chat.findOne({
    isGroupChat: false,
    $and: [{ users: { $elemMatch: { $eq: myId } } }, { users: { $elemMatch: { $eq: userId } } }],
  }).populate("users", "name username email profilePic").populate("latestMessage");

  if (chat) return res.json({ chat });

  // create new chat
  const newChat = await Chat.create({
    isGroupChat: false,
    users: [myId, userId],
  });

  const fullChat = await Chat.findById(newChat._id).populate("users", "name username email profilePic");
  res.status(201).json({ chat: fullChat });
});

export const getMyChats = asyncHandler(async (req, res) => {
  const myId = req.user._id;
  const chats = await Chat.find({ users: { $elemMatch: { $eq: myId } } })
    .populate("users", "name username email profilePic")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });
  res.json({ chats });
});

export const createGroupChat = asyncHandler(async (req, res) => {
  const { name, users } = req.body;
  const myId = req.user._id;

  // expect users to be an array of userIds; handle stringified JSON too
  let usersArray = users;
  if (typeof users === "string") {
    try {
      usersArray = JSON.parse(users);
    } catch (err) {
      // not JSON, fall back to comma-split
      usersArray = users.split(",").map((u) => u.trim()).filter(Boolean);
    }
  }

  if (!Array.isArray(usersArray) || usersArray.length < 1) {
    const error = new Error("Please provide at least one user to create a group with");
    error.statusCode = 400;
    throw error;
  }

  // add current user if not already included
  if (!usersArray.find((u) => u.toString() === myId.toString())) {
    usersArray.push(myId);
  }

  // Create group chat
  const groupChat = await Chat.create({
    isGroupChat: true,
    groupName: name,
    users: usersArray,
    groupAdmin: myId,
  });

  const fullGroupChat = await Chat.findById(groupChat._id)
    .populate("users", "name username email profilePic")
    .populate("groupAdmin", "name username email profilePic")
    .populate("latestMessage");

  res.status(201).json({ chat: { ...fullGroupChat.toObject(), messages: [] } });
});

// Add user to group chat
export const addUserToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const myId = req.user._id;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    const error = new Error("Chat not found");
    error.statusCode = 404;
    throw error;
  }
  if (!chat.isGroupChat) {
    const error = new Error("This is not a group chat");
    error.statusCode = 400;
    throw error;
  }

  // only admin can add
  if (chat.groupAdmin.toString() !== myId.toString()) {
    const error = new Error("Only group admin can add users");
    error.statusCode = 403;
    throw error;
  }

  // add user only if not already in group
  if (chat.users.includes(userId)) {
    const error = new Error("User already in group");
    error.statusCode = 400;
    throw error;
  }

  chat.users.push(userId);
  await chat.save();

  const updatedChat = await Chat.findById(chatId)
    .populate("users", "name username email profilePic")
    .populate("groupAdmin", "name username email profilePic")
    .populate("latestMessage");

  res.json({ chat: { ...updatedChat.toObject(), messages: [] } });
});

// Remove user from group chat
export const removeUserFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const myId = req.user._id;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    const error = new Error("Chat not found");
    error.statusCode = 404;
    throw error;
  }
  if (!chat.isGroupChat) {
    const error = new Error("This is not a group chat");
    error.statusCode = 400;
    throw error;
  }

  // only admin can remove
  if (chat.groupAdmin.toString() !== myId.toString()) {
    const error = new Error("Only group admin can remove users");
    error.statusCode = 403;
    throw error;
  }

  // cannot remove admin themself
  if (userId === chat.groupAdmin.toString()) {
    const error = new Error("Admin cannot remove themselves");
    error.statusCode = 400;
    throw error;
  }

  // remove user
  chat.users = chat.users.filter((u) => u.toString() !== userId.toString());
  await chat.save();

  const updatedChat = await Chat.findById(chatId)
    .populate("users", "name username email profilePic")
    .populate("groupAdmin", "name username email profilePic")
    .populate("latestMessage");

  res.json({ chat: { ...updatedChat.toObject(), messages: [] } });
});

//User leaves group chat
export const leaveGroup = asyncHandler(async (req, res) => {
  const { chatId } = req.body;
  const myId = req.user._id;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    const error = new Error("Chat not found");
    error.statusCode = 404;
    throw error;
  }
  if (!chat.isGroupChat) {
    const error = new Error("Not a group chat");
    error.statusCode = 400;
    throw error;
  }

  // admin leaving? transfer admin role to another user
  if (chat.groupAdmin.toString() === myId.toString()) {
    if (chat.users.length === 1) {
      const error = new Error("Admin cannot leave. Group has only 1 member.");
      error.statusCode = 400;
      throw error;
    }

    const newAdmin = chat.users.find((u) => u.toString() !== myId.toString());
    chat.groupAdmin = newAdmin;
  }

  chat.users = chat.users.filter((u) => u.toString() !== myId.toString());
  await chat.save();

  res.json({ message: "Left group successfully" });
});

// Rename group chat
export const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, newName } = req.body;
  const myId = req.user._id;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    const error = new Error("Chat not found");
    error.statusCode = 404;
    throw error;
  }
  if (!chat.isGroupChat) {
    const error = new Error("This is not a group chat");
    error.statusCode = 400;
    throw error;
  }

  // only admin can rename
  if (chat.groupAdmin.toString() !== myId.toString()) {
    const error = new Error("Only group admin can rename the group");
    error.statusCode = 403;
    throw error;
  }

  chat.groupName = newName;
  await chat.save();

  const updatedChat = await Chat.findById(chatId)
    .populate("users", "name username email profilePic")
    .populate("groupAdmin", "name username email profilePic")
    .populate("latestMessage");

  res.json({ chat: { ...updatedChat.toObject(), messages: [] } });
});

//transfer group admin role
export const transferGroupAdmin = asyncHandler(async (req, res) => {
  const { chatId, newAdminId } = req.body;
  const myId = req.user._id;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    const error = new Error("Chat not found");
    error.statusCode = 404;
    throw error;
  }
  if (!chat.isGroupChat) {
    const error = new Error("Not a group chat");
    error.statusCode = 400;
    throw error;
  }

  // only current admin can transfer
  if (chat.groupAdmin.toString() !== myId.toString()) {
    const error = new Error("Only current admin can transfer admin role");
    error.statusCode = 403;
    throw error;
  }

  // new admin must be inside group
  if (!chat.users.includes(newAdminId)) {
    const error = new Error("User must be in group to become admin");
    error.statusCode = 400;
    throw error;
  }

  chat.groupAdmin = newAdminId;
  await chat.save();

  res.json({ message: "Group admin transferred successfully" });
});

//group profile picture update can be added here 
export const updateGroupProfilePic = asyncHandler(async (req, res) => {
  const { chatId } = req.body;
  const myId = req.user._id;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    const error = new Error("Chat not found");
    error.statusCode = 404;
    throw error;
  }
  if (!chat.isGroupChat) {
    const error = new Error("Not a group chat");
    error.statusCode = 400;
    throw error;
  }

  if (chat.groupAdmin.toString() !== myId.toString()) {
    const error = new Error("Only admin can update group picture");
    error.statusCode = 403;
    throw error;
  }

  if (!req.file) {
    const error = new Error("No file uploaded");
    error.statusCode = 400;
    throw error;
  }

  // Upload file buffer to Cloudinary using helper
  const url = await uploadToCloudinary(req.file.buffer, "group_pics", "image");
  chat.groupProfilePic = url;
  await chat.save();

  const updatedChat = await Chat.findById(chatId)
    .populate("users", "name username email profilePic")
    .populate("groupAdmin", "name username email profilePic")
    .populate("latestMessage");

  res.json({ chat: { ...updatedChat.toObject(), messages: [] } });
});

//-- Export all controller functions
export default {
  createOrGetChat,
  getMyChats,
  createGroupChat,
  addUserToGroup,
  removeUserFromGroup,
  leaveGroup,
  renameGroup,
  transferGroupAdmin,
  updateGroupProfilePic,
};  
