const mongoose = require("mongoose");

const coursesSchema = new mongoose.Schema({
  courseName: {
    type: String,
  },
  courseDescription: {
    type: String,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectID,
    ref: "User",
    required: true,
  },
  whatYouWillLearn: {
    type: String,
  },
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "Section",
    },
  ],
  ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "RatingAndReview",
    },
  ],
  price: {
    type: Number,
  },
  thumbnail: {
    type: String,
  },
  category: {
    type: mongoose.Schema.Types.ObjectID,
    
    ref: "Category",
  },
  tag: {
    type: [String],
    required: true,
    
  },
  studentsEnrolled: [{
    type: mongoose.Schema.Types.ObjectID,
    required: true,
    ref: "User",
  }],
  instructions: {
    type:[String],
  },
  status: {
    type:String,
    enum:["Draft","Published"],
  },
});

module.exports = mongoose.model("Course", coursesSchema);
