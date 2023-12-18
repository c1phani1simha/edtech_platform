const Section = require('../models/Section');
const Course = require('../models/Course');


//creating a section
exports.createSection = async (req, res) => {
  try {
    //data fetch
    const { sectionName, courseId } = req.body;
    //data validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //create section
    const newSection = await Section.create({
      sectionName,
    });
    //update course(include the section created) by ObjectID

    //use populate to replace sections/sub-sections both in the updatedCourseDetails
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      {
        new: true,
      }
    ).populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    
    //return response

    return res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourseDetails,
    });
  } catch (err) { 
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error:err.message,
    });
  }
}


//Update section
exports.updateSection = async (req, res) => {
  try {
    //data input
    const { sectionName, sectionId } = req.body;
    //data validation
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //update data
    const section = await Section.findByIdAndUpdate(
      sectionId,
      {
        sectionName,
      },
      {
        new: true,
      }
    );
    //return response
    return res.status(200).json({
      success: true,
      message: "Section Updated successfully",
      section
    });
  } catch (err) { 
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
}

//delete section

exports.deleteSection = async (req, res) => {
  try {
    //get ID - assuming that we are sending ID in params

    const { sectionId,courseId } = req.body;
    
    //use findByIdAndDelete

    await Section.findByIdAndDelete({ _id: sectionId });
     

    //TODO[testing]: Do we need to delete the entry from the course schema

    //return response
     return res.status(200).json({
       success: true,
       message: "Section Deleted successfully",
     });
    
  } catch (err) { 
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
}