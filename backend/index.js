require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Connect to database
connectDB();

// Initialize app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files for uploads
app.use("/uploads", express.static("uploads"));

// Import Routes
const movieRoutes = require("./Routes/MovieRoutes");
const userRoutes = require("./Routes/UserRoutes");

// Use Routes
app.use("/api/movies", movieRoutes);
app.use("/api/users", userRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start Server
const PORT = process.env.PORT || 15400;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));