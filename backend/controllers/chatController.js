// controllers/chatController.js
import Chat from "../models/Chat.js";
import User from "../models/User.js";

export const createOrGetChat = async (req, res) => {
  try {
    const { userId } = req.body; // the other user's id
    const myId = req.user._id;

    if (!userId) return res.status(400).json({ message: "userId required" });

    // check existing one-to-one chat
    let chat = await Chat.findOne({
      isGroupChat: false,
      $and: [{ users: { $elemMatch: { $eq: myId } } }, { users: { $elemMatch: { $eq: userId } } }],
    }).populate("users", "name email profilePic").populate("latestMessage");

    if (chat) return res.json({ chat });

    // create new chat
    const newChat = await Chat.create({
      isGroupChat: false,
      users: [myId, userId],
    });

    const fullChat = await Chat.findById(newChat._id).populate("users", "name email profilePic");
    res.status(201).json({ chat: fullChat });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyChats = async (req, res) => {
  try {
    const myId = req.user._id;
    const chats = await Chat.find({ users: { $elemMatch: { $eq: myId } } })
      .populate("users", "name email profilePic")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
    res.json({ chats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createGroupChat = async (req, res) => {
  try {
    const { name, users } = req.body;
    const myId = req.user._id;

    if (!name || !users)
      return res.status(400).json({ message: "Group name and users are required" });

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
      return res.status(400).json({ message: "Please provide at least one user to create a group with" });
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
      .populate("users", "name email profilePic")
      .populate("groupAdmin", "name email profilePic")
      .populate("latestMessage");

    res.status(201).json({ chat: {...fullGroupChat.toObject(), messages: [] }});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add user to group chat
export const addUserToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const myId = req.user._id;

    if (!chatId || !userId)
      return res.status(400).json({ message: "chatId and userId are required" });

    const chat = await Chat.findById(chatId);

    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (!chat.isGroupChat) return res.status(400).json({ message: "This is not a group chat" });

    // only admin can add
    if (chat.groupAdmin.toString() !== myId.toString()) {
      return res.status(403).json({ message: "Only group admin can add users" });
    }

    // add user only if not already in group
    if (chat.users.includes(userId)) {
      return res.status(400).json({ message: "User already in group" });
    }

    chat.users.push(userId);
    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate("users", "name email profilePic")
      .populate("groupAdmin", "name email profilePic")
      .populate("latestMessage");

    res.json({ chat: {...updatedChat.toObject(), messages: []} });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove user from group chat
export const removeUserFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const myId = req.user._id;

    if (!chatId || !userId)
      return res.status(400).json({ message: "chatId and userId are required" });

    const chat = await Chat.findById(chatId);

    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (!chat.isGroupChat) return res.status(400).json({ message: "This is not a group chat" });

    // only admin can remove
    if (chat.groupAdmin.toString() !== myId.toString()) {
      return res.status(403).json({ message: "Only group admin can remove users" });
    }
    
      // cannot remove admin themself
    if (userId === chat.groupAdmin.toString()) {
      return res.status(400).json({ message: "Admin cannot remove themselves" });
    }

    // remove user
    chat.users = chat.users.filter((u) => u.toString() !== userId.toString());
    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate("users", "name email profilePic")
      .populate("groupAdmin", "name email profilePic")
      .populate("latestMessage");

    res.json({ chat: {...updatedChat.toObject(), messages: []} });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//User leaves group chat
export const leaveGroup = async (req, res) => {
  try {
    const { chatId } = req.body;
    const myId = req.user._id;

    const chat = await Chat.findById(chatId);

    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (!chat.isGroupChat) return res.status(400).json({ message: "Not a group chat" });

    // admin leaving? transfer admin role to another user
    if (chat.groupAdmin.toString() === myId.toString()) {
      if (chat.users.length === 1) {
        return res.status(400).json({ message: "Admin cannot leave. Group has only 1 member." });
      }

      const newAdmin = chat.users.find((u) => u.toString() !== myId.toString());
      chat.groupAdmin = newAdmin;
    }

    chat.users = chat.users.filter((u) => u.toString() !== myId.toString());
    await chat.save();

    res.json({ message: "Left group successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Rename group chat
export const renameGroup = async (req, res) => {
  try {
    const { chatId, newName } = req.body;
    const myId = req.user._id;

    if (!chatId || !newName)
      return res.status(400).json({ message: "chatId and newName are required" });

    const chat = await Chat.findById(chatId);

    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (!chat.isGroupChat) return res.status(400).json({ message: "This is not a group chat" });

    // only admin can rename
    if (chat.groupAdmin.toString() !== myId.toString()) {
      return res.status(403).json({ message: "Only group admin can rename the group" });
    }

    chat.groupName = newName;
    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate("users", "name email profilePic")
      .populate("groupAdmin", "name email profilePic")
      .populate("latestMessage");

    res.json({ chat: {...updatedChat.toObject(), messages: []} });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//transfer group admin role
export const transferGroupAdmin = async (req, res) => {
  try {
    const { chatId, newAdminId } = req.body;
    const myId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (!chat.isGroupChat) return res.status(400).json({ message: "Not a group chat" });

    // only current admin can transfer
    if (chat.groupAdmin.toString() !== myId.toString()) {
      return res.status(403).json({ message: "Only current admin can transfer admin role" });
    }

    // new admin must be inside group
    if (!chat.users.includes(newAdminId)) {
      return res.status(400).json({ message: "User must be in group to become admin" });
    }

    chat.groupAdmin = newAdminId;
    await chat.save();

    res.json({ message: "Group admin transferred successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//group profile picture update can be added here 
export const updateGroupProfilePic = async (req, res) => {
  try {
    const { chatId } = req.body;
    const myId = req.user._id;

    if (!chatId)
      return res.status(400).json({ message: "chatId is required" });

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (!chat.isGroupChat) return res.status(400).json({ message: "Not a group chat" });

    if (chat.groupAdmin.toString() !== myId.toString()) {
      return res.status(403).json({ message: "Only admin can update group picture" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload file buffer to Cloudinary
    cloudinary.uploader
      .upload_stream({ folder: "group_pics" }, async (error, result) => {
        if (error) return res.status(500).json({ message: "Cloudinary upload failed" });

        chat.groupProfilePic = result.secure_url;
        await chat.save();

        const updatedChat = await Chat.findById(chatId)
          .populate("users", "name email profilePic")
          .populate("groupAdmin", "name email profilePic")
          .populate("latestMessage");

        res.json({ chat: { ...updatedChat.toObject(), messages: [] } });
      })
      .end(req.file.buffer);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
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
