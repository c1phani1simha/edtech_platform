const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');

//create Rating
exports.createRating = async (req, res) => {
  try {

    //get user id

    const userId = req.user.id;
    //fetch data from request body

    const { rating, review, courseId } = req.body;
    //check if user is enrolled or not

    const courseDetails = await Course.findOne({
      _id:courseId,
      studentsEnrolled: { $elemMatch: {$eq:userId} }
      });

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message:'Student is not enrolled in course'
      })
    }
    //check if user is already reviewed this course
    const isAlreadyreviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId
    });

    if (!isAlreadyreviewed) { 
      return res.status(404).json({
        success: false,
        message:'Course is already reviewed'
      });
    }
    //create rating and review

    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });
    //update course with this rating finally

    const updatedDetails = await Course.findByIdAndUpdate(
      {_id:courseId},
      {
        $push:
        {
        ratingAndReviews: ratingReview._id,
        },
      },
      {
      new:true
      }
    );

    console.log(updatedDetails);
    //return response
    
    return res.status(200).json({
      success: true,
      message: 'Rating created successfully'
    });
       
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
}

//get average rating

exports.getAverageRating = async (req, res) => {
  try {
    
    //get course id
    const courseId = req.body.courseId;

    //calculate average rating
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: {$avg : "$rating"}
        }
      },
    ]);
    //return rating

    if (result.length > 0) { 
      return res.status(200).json({
        success: true,
        averageRating:result[0].averageRating,
        message:'Got average rating'
      })
    }

    //if no rating exist
    return res.status(200).json({
      success: true,
      message: 'Average rating is zero, no ratings given till now',
      averageRating:0,
    });

  } catch (err) {
     return res.status(500).json({
       success: false,
       message: "Internal Server Error",
     });
  }
} 


//get all ratings irrespective of course type

exports.getAllRating = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: 'desc' })
      .populate({
      path: 'user',
      select:'firstName lastName email image'
      })
      .populate({
        path: 'course', 
        select:'courseName'
      })
      .exec()
      ;
    
    
    return res.status(200).json({
      success: true,
      message: 'All reviews fetched successfully',
      date:allReviews
    })

  } catch (err) {
    
     return res.status(500).json({
       success: false,
       message: "Internal Server Error",
     });
  }
}