//Import the required modules
//like express routes

const express = require('express');
const router = express.Router();

//Import controllers
const { createCourse, getAllCourse, getCourseDetails } = require('../controllers/Course');

//categories controllers import

const { showAllCategories, createCategory, categoryPageDetails } = require('../controllers/Categorys');

//sections controllers import
const { createSection, updateSection, deleteSection } = require('../controllers/Section');

//subsections controllers import
const { updateSubSection, createSubSection, deleteSubSection } = require('../controllers/Subsection');

//Rating controllers
const { createRating, getAverageRating, getAllRating } = require('../controllers/RatingAndReview');

//Importing middlewares
const { auth, isInstructor, isAdmin, isStudent } = require('../middleware/auth');

/****Course Routes */

//adding authentication as by instructors
router.post('/createCourse', auth, isInstructor, createCourse);
//adding a section
router.post('/addSection', auth, isInstructor, createSection);
//update a section
router.put('/updateSection', auth, isInstructor, updateSection);
//delete a section
router.delete('/deleteSection', auth, isInstructor, deleteSection);
//edit a sub section
router.put('/updateSubSection', auth, isInstructor, updateSubSection);
//add a sub section to a section
router.post('/addSubSection', auth, isInstructor, createSubSection);
//delete a sub section
router.delete('/deleteSubSection', auth, isInstructor, deleteSubSection);
//get all registered courses
router.get('/getAllCourses', getAllCourse);
//get details for a specified course
router.get('/getCourseDetails', getCourseDetails);

/****Category Routes */

//(Only By Admin)

//category can be created only by admin

router.post('/createCategory', auth, isAdmin, createCategory);
router.get('/getCategoryPageDetails', auth, isAdmin, categoryPageDetails);
router.get('/showAllCategories', auth, isAdmin, showAllCategories);

/**Rating and Reviews */

router.post('/createRating', auth, isStudent, createRating);
router.get('/getAverageRating', auth, isStudent, getAverageRating);
router.get('/getReviews', auth, isStudent, getAllRating);

module.exports = router;