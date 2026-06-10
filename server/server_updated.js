const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const passport = require("passport");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const initSocket = require("./sockets/notificationSocket");

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users_route_fixed");
const postRoutes = require("./routes/posts");
const jobRoutes = require("./routes/jobs");
const adminRoutes = require("./routes/admin");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
initSocket(io);

// Make io accessible in routes
app.set("io", io);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/", (req, res) => res.json({ message: "DevConnect API is running 🚀" }));

// Error Handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port: http://localhost: ${PORT}`));
