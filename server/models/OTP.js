const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require('../mail/templates/emailVerificationTemplate');
const nodemailer = require('nodemailer');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required:true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 36000,
    //this doc will get deleted after 5 min of it's creation time
  }
});

//need to write the nodemailer code
//after schema
//before model
//this will work as pre-middleware code

// a function --> to send email

async function sendVerificationEmail(email, otp) {
  // Create a transporter to send emails

  // Define the email options

  // Send the email
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email",
      emailTemplate(otp),
    );
    console.log("Email Sent Successfully: ", mailResponse.response);
  } catch (error) {
    console.log("error sending verification mail");
    console.log(error.message);
    throw error;
  }
}

// Define a post-save hook to send email after the document has been sav

otpSchema.pre("save", async function (next) {
  console.log("New document saved to DB");
  // Only send an email when a new document is created
  if (this.isNew) {
     await sendVerificationEmail(this.email, this.otp);
  }
 
  next();
});

module.exports = mongoose.model("OTP", otpSchema);
