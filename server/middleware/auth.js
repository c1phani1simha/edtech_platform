const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');

//auth

//firstly extract token, then check it is same or not with JWT_SECRET KEY

//lastly, if everything works fine, then send the auth middleware to operate for the next middlewares
exports.auth = async (req,res,next) => {
  try {
    //extract token
    const token = req.cookies.token || req.body.token || req.header('Authorisation').replace("Bearer ", '');
    
    //if token missing, then return response
    if (!token) {
       return res.status(401).json({
         success: false,
         message: "Token is missing",
       });
    }
   

    //verify the token extracted
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);
      //In the decode, we will get the payload that we sent previously in Auth.js
      
      //this step will add the payload to the user's request body also
      req.user = decode;
    } catch (error) {
      //verification - issue

      return res.status(401).json({
        success: false,
        message: 'Token is invalid'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:'Something went wrong while validating token'
    });
  }
}

//These three middlewares are having the same type of code
//Just we need to change the keyword
//For students, admins, and Instructors

//isStudent

exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: 'This is a protected route only for Students'
      });
    }

     next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:'User role cannot be verified, please try again',
    }); 
  } 
}

//isInstructor

exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route only for Instructors",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

//isAdmin

exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route only for Admins",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};