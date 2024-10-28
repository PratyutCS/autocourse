const mongoose = require("mongoose");

const sessionSchema = mongoose.Schema({
  session: {
    required: true,
    type: String,
  },
});

const Session = mongoose.model("Session", sessionSchema);
module.exports = Session;
