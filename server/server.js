const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const initializeSocket = require("./socket/socket");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const voteRoutes = require("./routes/voteRoutes");
const commentLikeRoutes = require("./routes/commentLikeRoutes");
const communiyRoutes = require("./routes/communityRoutes");
const profileRoutes = require("./routes/profileRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
dotenv.config();

const app = express();

// CREATE HTTP SERVER
const server = http.createServer(app);

// INITIALIZE SOCKET.IO
const io = initializeSocket(server);

// MAKE IO AVAILABLE EVERYWHERE
app.set("io", io);

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/comment-likes", commentLikeRoutes);
app.use("/api/communities", communiyRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/notifications", notificationRoutes);
app.get("/", (req, res) => {
  res.send("Orbix API running...");
});

const PORT = process.env.PORT || 5000;

// USE SERVER INSTEAD OF APP
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
console.log(process.env.JWT_SECRET);
