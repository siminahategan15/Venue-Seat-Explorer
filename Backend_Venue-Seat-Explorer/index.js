require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const venueRoutes = require("./routes/venueRoutes");
const seatRoutes = require("./routes/seatRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const userRoutes = require("./routes/userRoutes");
const searchRoutes = require("./routes/searchRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Seat Explorer API running");
});

app.use("/api/auth", authRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
