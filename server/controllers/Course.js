const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');
const {uploadImageToCloudinary} = require('../utils/imageUploader');

//createCourse handler function

exports.createCourse = async (req, res) => {
  try {
    let userId = req.user.id;

    //fetch data
    let { courseName, courseDescription, whatYouWillLearn, price, tag,category,status,instructions } =
      req.body;

    //get thumbnail image from req files
    let thumbnail = req.files.thumbnailImage;

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !thumbnail || !category || !tag
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!status || status === undefined) {
      status = 'Draft';
    }

    //check if the user is an instructor
    
    let instructorDetails = await User.findById(userId, {accountType: 'Instructor'});
     
    if (!instructorDetails) { 
      return res.status(404).json({
        success: false,
        message: "Instructor details not found",
      });
    }

    //check given category is valid or not
    let categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category Details not found",
      });
    }

    //Upload the thumbnail image to cloudinary
    let thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

    console.log(thumbnailImage);
    
    //create an entry for new course
    let newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag: tag,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      status: status,
      instructions: instructions,
    });

    //add the new course to the user schema of the instructor
    await User.findByIdAndUpdate(
      {
      _id: instructorDetails._id,
      },
      {
        $push: {
        course:newCourse._id,
      }
      },
      {
      new:true,
      })
    
    //Add the new course to the Categories
    await Category.findByIdAndUpdate(
      {
        _id: category,
      },
      {
        $push: {
          course: newCourse._id,
        },
      },
      {
        new: true,
      }
    );

    //return response
    return res.status(200).json({
      success: true,
      message: 'Course created successfully',
      data: newCourse,
    });

  } catch(err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: err.message,
    });
  }
}

//getAllCourse handler function
exports.getAllCourse = async (req, res) => { 
  try{
   
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true, studentsEnrolled: true
      }
    ).populate("instructor").exec();

    return res.status(200).json({
      success: true,
      message: "Data for all course fetched successfully"
      , data: allCourses
    });
  } catch(err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Cannot fetch course data',
      error:err.message
    })
  }
}

//getCourseDetails handler function
exports.getCourseDetails = async (req, res) => { 
  try {
    //get id
    const { courseId } = req.body;
    //find course details
    const courseDetails = await Course.find({ _id: courseId })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    
    //Validation

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: 'Course details not found'
      });
      
    }
    console.log(courseDetails);

    //return response
    return res.status(200).json({
      success: true,
      message: "Course details fetched successfully",
      data:courseDetails
    });
   
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message:err.message
    });
  }
}