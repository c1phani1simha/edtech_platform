const Category = require('../models/Category');

//create category handler function code

exports.createCategory = async (req, res) => {
  try {
    //fetch data
    const { name, description } = req.body;
    //validation
    if (!name || !description) { 
      return res.status(400).json({
        success: false,
        message:'All fields are required'
      })
    }
    //create entry in DB
    const categoryDetail = await Category.create({
      name: name,
      description: description
    });
    console.log(categoryDetail);
    //return response
    return res.status(200).json({
      success: true,
      message: 'Category created successfully'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message:err.message,
    })
  }
}

//showAllCategorys handler function


exports.showAllCategories = async (req, res) => {
  try {
    const allCategorys = await Category.find({},
      { name: true, description: true }
    );
     return res.status(200).json({
       success: true,
       message: "All Categorys are returned successfully",
       allCategorys,
     });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

//Category page details handler

exports.categoryPageDetails = async (req, res) => {
  try {
    
    //get category id
    const { categoryId } = req.body;

    //get courses specified in category id
    const selectedCategory = await Category.findById(categoryId)
      .populate('courses').exec();
    
    //validation
    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message:'Data not found',
      });
    }

    //get courses for different categories
    const differentCategories = await Category.find({
      _id: {$ne:categoryId},
    }).populate("courses").exec();

   if (!differentCategories) {
   return res.status(404).json({
     success: false,
     message: "Data not found",
   });
    }

    
    //get top 10 selling courses
   
    const allCategories = await Category.find().populate("courses");
    const allCourses = allCategories.flatMap((category) => category.courses);
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    //return response

    return res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategories,
      }
    });

  } catch (err) {
     return res.status(500).json({
       success: false,
       message: 'Internal Server Error',
     });
  }
}


