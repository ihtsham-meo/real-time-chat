//backend/controllers/authController.js
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import uploadToCloudinary from "../config/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  // Check if email already exists
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    const error = new Error("Email already exists");
    error.statusCode = 400;
    throw error;
  }

  // Check if username already exists
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    const error = new Error("Username already exists");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({ name, username, email, password });

  generateToken(res, user._id);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    profilePic: user.profilePic,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // Find user by email OR username
  const user = await User.findOne({
    $or: [{ email: email || "" }, { username: username || "" }],
  });

  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 400;
    throw error;
  }

  generateToken(res, user._id);

  user.status = "online";
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    profilePic: user.profilePic,
  });
});

export const logout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.json({ msg: "Logged out" });
};

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // If username changed, ensure it's not used by another account
  if (username && username !== user.username) {
    const exists = await User.findOne({ username });
    if (exists) {
      const error = new Error("Username already in use");
      error.statusCode = 400;
      throw error;
    }
    user.username = username;
  }

  // If email changed, ensure it's not used by another account
  if (email && email !== user.email) {
    const exists = await User.findOne({ email });
    if (exists) {
      const error = new Error("Email already in use");
      error.statusCode = 400;
      throw error;
    }
    user.email = email;
  }

  if (name) user.name = name;
  if (password) user.password = password; // will be hashed by pre-save hook

  // handle profile pic upload (multer set req.file)
  if (req.file) {
    const mime = req.file.mimetype;
    let type = mime.startsWith("image/") ? "image" : "auto";
    const url = await uploadToCloudinary(req.file.buffer, "user-profile-pics", type);
    user.profilePic = url;
  }

  await user.save();

  // respond with updated user (no password)
  res.json({
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    profilePic: user.profilePic,
  });
});
