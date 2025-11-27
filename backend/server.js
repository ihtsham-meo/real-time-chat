//backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { parse as parseCookie } from "cookie";
import connectDB from "./config/db.js";
import validateEnv from "./config/validateEnv.js";
import jwt from "jsonwebtoken";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import Chat from "./models/Chat.js";
import Message from "./models/Message.js";
import chatRoutes from "./routes/chatRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();
validateEnv(); // Validate environment variables at startup
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.get("/", (req, res) => res.send("Chat App Backend Running..."));

// Apply rate limiting to auth routes
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/login", authLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chats", chatRoutes);

// Error handler middleware (must be last)
app.use(errorHandler);

// create HTTP server & socket server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
  },
});

// helper: verify token from cookie header using cookie package
const getUserIdFromSocket = (socket) => {
  try {
    const cookieHeader = socket.handshake.headers?.cookie;
    if (!cookieHeader) return null;

    // Parse cookies using the cookie package
    const cookies = parseCookie(cookieHeader);
    const token = cookies.jwt;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (err) {
    return null;
  }
};

io.use((socket, next) => {
  const userId = getUserIdFromSocket(socket);
  if (!userId) return next(new Error("Authentication error"));
  socket.userId = userId;
  return next();
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id, "user:", socket.userId);

  // join a room per user id -> allow direct emits
  socket.join(socket.userId);

  // join chat rooms when client requests (e.g. opens chat)
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
  });

  // leave chat
  socket.on("leaveChat", (chatId) => {
    socket.leave(chatId);
  });

  // sending message via socket (text only or client can send file URL after uploading via REST)
  socket.on("sendMessage", async (payload) => {
    // payload expected:
    // { chatId, content, messageType?, fileUrl?, fileName? }
    try {
      const { chatId, content, messageType, fileUrl, fileName } = payload;
      if (!chatId) return;

      const messageData = {
        chat: chatId,
        sender: socket.userId,
        content: content || "",
        messageType: messageType || (fileUrl ? "file" : "text"),
        fileUrl: fileUrl || "",
        fileName: fileName || "",
      };

      const message = await Message.create(messageData);
      await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

      const fullMessage = await Message.findById(message._id).populate(
        "sender",
        "name username email profilePic"
      );

      // emit to everyone in chat room
      io.to(chatId).emit("newMessage", fullMessage);

      // Additionally notify participants individually (useful for offline delivery)
      const chat = await Chat.findById(chatId).populate("users", "_id");
      if (chat && chat.users) {
        chat.users.forEach((u) => {
          if (u._id.toString() !== socket.userId.toString()) {
            io.to(u._id.toString()).emit("messageNotification", {
              chatId,
              message: fullMessage,
            });
          }
        });
      }
    } catch (err) {
      console.error("sendMessage error", err);
      socket.emit("error", { message: err.message });
    }
  });

  socket.on("typing", ({ chatId, isTyping }) => {
    socket.to(chatId).emit("typing", { userId: socket.userId, isTyping });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on ${PORT}`));

