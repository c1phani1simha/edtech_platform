const SubSection = require('../models/SubSection');
const Section = require('../models/Section');
const { uploadImageToCloudinary } = require('../utils/imageUploader');


//create subsection

exports.createSubSection = async (req, res) => {
  try {
    //fetch data from request body
    const { sectionId, title, timeDuration, description } = req.body;
    //extract file/video
    const video = req.files.videoFile;
    //validation
    if (!sectionId || !title || !timeDuration || !description || !video) {
      return res.status(404).json({
        success: false,
        message: "All fields are required",
      });
    }
    //upload video to cloudinary to get secure url
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );
    //create subsection
    const SubSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });
    //insert / push new subsection id into the section schema with section ObjectId
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: {
          subSection: SubSectionDetails._id,
        },
      },
      {
        new: true,
      }
    ).populate('subSection');
  

    //return res

    return res.status(200).json({
      success: true,
      message: "SubSection created successfully",
       updatedSection,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
}

//HW: Update subsection
exports.updateSubSection = async (req, res) => {
  try {
    //data input
    const { subSectionName, subSectionId } = req.body;
    //data validation
    if (!subSectionName || !subSectionId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //update data
    const subSection = await SubSection.findByIdAndUpdate(
      subSectionId,
      {
        subSectionName,
      },
      {
        new: true,
      }
    );
    //return response
    return res.status(200).json({
      success: true,
      message: "SubSection Updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to update subsection",
      error: err.message,
    });
  }
};

//HW: delete subsection

exports.deleteSubSection = async (req, res) => {
  try {
    //get ID - assuming that we are sending ID in params

    const { subSectionId } = req.params;

    //use findByIdAndDelete

    await SubSection.findByIdAndDelete(subSectionId);
    //TODO[testing]: Do we need to delete the entry from the course schema

    //return response
    return res.status(200).json({
      success: true,
      message: "Sub Section Deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete subsection",
      error: err.message,
    });
  }
};
