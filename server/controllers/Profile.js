const Course = require('../models/Course');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { uploadImageToCloudinary } = require('../utils/imageUploader');

exports.updateProfile = async (req, res) => {
  try {
    //get data
    const { dateOfBirth = "", about = "", gender, contactNumber } = req.body;
    //get userId
    const id = req.user.id;
  
    //find profile by id
    const userDetails = await User.findById(id);
    const profile = await Profile.findById(userDetails.additionalDetails);
    
    //update profile
    //there are two methods
    //first: create function to save details in DB
    //second: using the object already created we will update the required new details
    //second method is used here to update the profile
    //first method is previously used in section, subsection controller
    profile.dateOfBirth = dateOfBirth;
    profile.gender = gender;
    profile.contactNumber = contactNumber;
    profile.about = about;
    await profile.save();

    //return response
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to update profile",
      error: err.message,
    });
  }
}


//delete account
//Explore -> how can we schedule this delete operation
exports.deleteAccount = async (req, res) => {
  try {
    //TODO : Find more on job schedule
    //User will have profile details as additional details
    //User -> Profile
    //get user id
    const id = req.user.id;
    
    //validation
    const user = await User.findById({ _id: id });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    //delete profile
    const profileRes = await Profile.findByIdAndDelete({ _id: user.additionalDetails });
    


    //TODO: Unenroll user from the Course model also
    // const courseRes = await Course.studentsEnrolled.findByIdAndDelete({ _id: user.additionalDetails });
    

    //delete user
    const userRes = await User.findByIdAndDelete({ _id: id });
    

    //return response
    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete account",
      error: err.message,
    });
  }
}



exports.getAllUserDetails = async (req, res) => {
  try {
    //get id
    const id = req.user.id;
    //validation and get user details
    const userDetails = await User.findById(id).populate("additionalDetails").exec();
    //return response 
    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      userDetails,
    });
    
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch user details",
      error: err.message,
    });
  }
}

//update Display Picture

exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;
    const image = await uploadImageToCloudinary(displayPicture, process.env.FOLDER_NAME, 1000, 1000);
    console.log(image);
    const updateProfile = await User.findByIdAndUpdate({ _id: userId }, { image: image.secure_url }, { new: true });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data:updateProfile
    });
    
  } catch (err) {
     return res.status(500).json({
       success: false,
       message: 'Internal Server Error',
     });
  }
}

//get all enrolled courses
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const userDetails = await User.findOne({ _id: userId }).populate('courses').exec();
    
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message:'User not found'
      });
    }
  } catch (err) {
     return res.status(500).json({
       success: false,
       message: 'Internal Server Error',
     });
  }
}