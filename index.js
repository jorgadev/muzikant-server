const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

// Import routes
const indexRoute = require("./routes/index");
const userRoute = require("./routes/user");
const spotifyRoute = require("./routes/spotify");
const usersRoute = require("./routes/users");

// Configure dotenv
dotenv.config();

// Connect to database
mongoose.connect(process.env.DB_CONNECT, () =>
  console.log("Connected to database...")
);

// Middleware
app.use(cors());
app.use(express.json());
// Route middlewares
app.get("/", indexRoute);
app.use("/user", userRoute);
app.use("/spotify", spotifyRoute);
app.use("/users", usersRoute);
app.listen(process.env.PORT, () => console.log("Server is up and running..."));
