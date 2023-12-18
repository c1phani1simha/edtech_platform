//Import required modules

const express = require('express');
const router = express.Router();

const { auth, isAdmin, isInstructor, isStudent } = require('../middleware/auth');
const { deleteAccount, updateProfile, getAllUserDetails, updateDisplayPicture, getEnrolledCourses } = require('../controllers/Profile');

/** Profile routes */

//delete user account

router.delete('/deleteProfile', auth,deleteAccount);
router.put('/updateProfile', auth, updateProfile);
router.get('/getUserDetails', auth, getAllUserDetails);
router.get('/getEnrolledCourses', auth, getEnrolledCourses);
router.put('/updateDisplayPicture', auth, updateDisplayPicture);

module.exports = router;