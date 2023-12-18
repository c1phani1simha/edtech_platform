//Import required modules

const express = require('express');
const router = express.Router();

//Import the required controllers and middleware functions

const { login, signUp, sendOTP, changePassword } = require('../controllers/Auth');
const { resetPassword, resetPasswordToken } = require('../controllers/ResetPassword');

const { auth } = require('../middleware/auth');


/*** Routes for authentication */

router.post('/login', login);
router.post('/signup', signUp);
router.post('/sendotp', sendOTP);
router.post('/changePassword', auth, changePassword);

/** Reset Password */

//route for generating a reset password token

router.post('/reset-password-token', resetPasswordToken);

//route for resetting user's password after verification
router.post('/reset-password', resetPassword);

module.exports = router;