const mongoose = require("mongoose");

const categorysSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type:String,
  },
  courses: [
  {
    type: mongoose.Schema.Types.ObjectID,
    ref:"Course",
  },
],
});

module.exports = mongoose.model("Category", categorysSchema);
