const User = require('../models/User');
const Profile = require('../models/Profile');
const mailSender = require('../utils/mailSender');
const { passwordUpdated } = require('../mail/templates/passwordUpdate');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//sendOTP for email verification

exports.sendOTP = async (req, res) => {
  
  try {
    //fetch email from request ki body
  const { email } = req.body;

    //check if user is already present
    //find user with email
  const checkUserPresent = await User.findOne({ email });

  //if user already exist, then return a response
  if (checkUserPresent) {
    return res.status(401).json({
      success: false,
      message: "User is already registered",
    })
  }

  //generate otp
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars:false,
    });

    console.log("OTP Generator: " + otp);

    //check unique OTP or not
    let result = await OTP.findOne({ otp: otp });
    
    //if newly generated OTP is already present in old docs created in DB
    //result --> true
    //this while loop runs until a new different OTP is found
    // this time we will get definitely a different OTP, since we had added lowercase and special chars this time
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
    }

    const otpPayload = { email, otp };

    //create an entry in DB
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    //return response successfully
    res.status(200).json({
      success:true,
      message: 'OTP generated and entered in DB successfully',
      otp
    })
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Error creating in OTP',
    });
  }

};

//signup controller for registering users

exports.signUp = async (req, res) => {
  try {
    //data fetch from request body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp
    } = req.body;
    
    //validate the data
    if (!firstName || !lastName || !email || !password || !confirmPassword || !otp || !accountType) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      })
    }
    
    //check if password and confirm password matches or not
    //2 password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password does not match with confirm password",
      });
    }
    

    //check if user already existed
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists, Please sign in to continue",
      });
    }

    //find most recent OTP for the email in DB
    const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    console.log(recentOtp);
    //validate the OTP
    if (recentOtp.length == 0) {
      //OTP not found
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    } else if (otp !== recentOtp[0].otp) {
      //User entered OTP doesn't match with the server generated & entered DB OTP
      //User is entering Invalid OTP

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }
    
    //All clear !!
    //User entered a valid OTP

    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    //Creating a User
    let approved = "";
    approved == "Instructor" ? (approved = false) : (approved = true);
    
    //entry create in DB
    //create the additional profile for user
    
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType: accountType,
      approved: approved,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    })

    //return res
    return res.status(200).json({
      success: true,
      message: 'User created successfully',
      user
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'User cannot be registered. Please try again!!'
    });
  }
};

//login controller for already registered users

exports.login = async (req, res) => {
  try {
    //get data from request body
    const { email, password } = req.body;
    //validation data
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    //check if user exists
    const user = await User.findOne({ email }).populate("additionalDetails");
    
    //If user doesn't exist
    if (!user) {
      //return unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: 'User is not registered with us, please signup to continue',
      });
    }

    //generate JWT token and compare password

    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user.id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      //save token to user document in database

      user.token = token;
      user.password = undefined;

      //set cookie for token and return success response

      const options = {
        expires : new Date(Date.now()+ 3*24*60*60*1000),httpOnly:true,
      }
      //created cookie for token in response
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message:'User Login Success'
      })
    } else {
      return res.status(401).json({
        success: false,
        message:'Password is Incorrect',
      })
    }
    
  } catch (error) { 
    console.log(error);
    //Internal server error
    return res.status(500).json({
      success: false,
      message:'Login failure please try again'
    })
  }
};

//changePassword for already registered users

exports.changePassword = async (req, res) => {
  try {
    //get user data from req.user
    const userDetails = await User.findById(req.user.id);

    //get user entered data from req body
    //get old password, new password, confirm new password
    const { email, oldPassword, newPassword, confirmNewPassword } = req.body;

    //validation

    if (!email || !oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    //Validate old password entered with store old password in DB previously
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );

    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" });
    }

    //Match new password and confirm new password
    if (newPassword !== confirmNewPassword) {
      //bad request (400) error
      return res.status(400).json({
        success: false,
        message: "Password and confirm password does not match",
      });
    }

    //encrypt the new password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    //update the newly encrypted password in DB
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    //send notification mail saying  password is updated
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        passwordUpdated(
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      );
      console.log("Email sent successfully: ", emailResponse.response);
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      });
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
}
