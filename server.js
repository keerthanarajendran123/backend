import express from "express";
import { createServer } from "http";
import { Server } from "socket.io"; 
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import cors from "cors";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();
const app = express();

app.use(cors({
  origin: ['https://polite-druid-a752f6.netlify.app', 'http://localhost:5173']
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Welcome to Backend of Chat App</h1>");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

// port
const PORT = process.env.PORT || 5000;

const server = createServer(app); // Moved this line here

const io = new Server(server, {
  cors: {
    origin: ['https://polite-druid-a752f6.netlify.app', 'http://localhost:5173'],
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message received", newMessageRecieved);
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`)
);
