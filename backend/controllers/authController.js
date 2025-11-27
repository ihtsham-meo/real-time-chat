//backend/controllers/authController.js
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import uploadToCloudinary from "../config/cloudinary.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ msg: "All fields are required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "Email already exists" });

    const user = await User.create({ name, email, password });

    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ msg: "Invalid email or password" });

    generateToken(res, user._id);

    user.status = "online";
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const logout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.json({ msg: "Logged out" });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // If email changed, ensure it's not used by another account
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ msg: "Email already in use" });
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
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
