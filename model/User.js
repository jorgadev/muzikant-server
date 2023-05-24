const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 6,
    max: 255,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 1024,
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  role: {
    type: String,
    default: "player",
  },
  character: {
    type: Number,
    default: 0,
  },
  coins: {
    type: Number,
    default: 0,
  },
  experience: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("User", userSchema);
