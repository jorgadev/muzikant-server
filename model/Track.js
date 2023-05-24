const mongoose = require("mongoose");

const trackSchema = new mongoose.Schema({
  id: { type: String, required: true },
  playlist_id: { type: String, required: true },
  name: { type: String, required: true },
  artists: { type: [String], required: true },
  url: { type: String, required: true },
});

module.exports = mongoose.model("Track", trackSchema);
