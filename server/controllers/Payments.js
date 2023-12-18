const { instance } = require('../config/razorpay');
const Course = require('../models/Course');
const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const { courseEnrollmentEmail } = require('../mail/templates/courseEnrollmentEmail');



//****IMP */
//Steps to follow for payment methods

//Order create / capture payment --> Payment authorized --> action (Enroll the student in the purchased course)


//capture the payment and initiate the razorpay order

exports.capturePayment = async (req, res) => {
  //get course id and user id

  const { course_id } = req.body;
  const userId
    = req.user.id;
  //validation
  //valid courseID
  if (!course_id) {
    return res.json({
      success: false,
      message: 'Please provide valid course id',
    })
  }
  //valid courseDetail
  
  try {
    let course = await Course.findById(course_id);
    if (!course) {
      return res.json({
        success: false,
        message: "could not find course",
      });
    }

    //did user already purchased the course

    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)) {
      return res.status(200).json({
        success: false,
        message: "course already purchased",
      })
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong via payments.js",
      error: err.message,
    });
  }
  
  //order create
  const amount = Course.price;
  const currency = "INR";

  const options = {
    amount: amount * 100,
    currency,
    receipt: Math.random(Date.now()).toString(),
    //we are passing ids here since when we are completed with the check
    //we need to do enroll the user in the course
    //and vice versa for the course to get connected with user
    //since during that time we will not get the ids from req.body, we need to extract from razorpay notes itself
    //since this is not a request from the frontend it is from the razorpay
    notes: {
      courseId: course_id,
      userId,
    }
  };


  try {
    //initiate the payment using razorpay
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);
    return res.status(200).json({
      success: true,
      courseName: Course.courseName,
      courseDescription: Course.courseDescription,
      thumbnail: Course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
      message: "Payment successful",
    });
  } catch (err) {
    console.log(err);
    return res.json({
      success: false,
      message: 'could not initiate order'
    });
  }
  
  //return response
}

//verify signature of razorpay and server
//need to match the secret key from razorpay & server
exports.verifySignature = async (req, res) => {
  try {
    //***IMP */
    //To check the secret key & signature, we don't' match them directly

    //Razorpay sends it own signature in a hashed format, in order to match with that signature we also need to do the same hashing method with our server secret key also

    //Server signature
    const webhookSecret = "12345678";
    //razorpay signature
    const signature = req.headers("x-razorpay-signature");

    //Process to convert our secret key into hashed format

    //HMAC function requires
    //-->
    //1.Algorithm
    //2.Secret key

    const shasum = crypto.createHmac("sha256", webhookSecret);
    //converting the HMAC given object into a string format
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    //checking the signature and webhook secret key in our server
    if (signature === digest) {
      console.log("Payment is authorized");

      //If you want to see the route, we can do console.log(req) to get the route/path to extract notes
      const { courseId, userId } = req.body.payload.payment.entity.notes;

      //***IMP */
      //performing the last step
      //doing the action
      try {
        const enrolledCourse = await Course.findOneAndUpdate(
          { _id: courseId },
          {
            $push: { studentsEnrolled: userId },
          },
          { new: true }
        );
        if (!enrolledCourse) {
          return res.status(404).json({
            success: false,
            message: "Course not found",
          });
        }

        console.log(enrolledCourse);
        //do add the students enrolled course
        const enrolledStudent = await User.findOneAndUpdate(
          { _id: userId },
          {
            $push: {
              courses: courseId,
            },
          },
          {
            new: true,
          }
        );

        console.log(enrolledStudent);
        const firstName = await User.findById(userId).firstName;
        const lastName = await User.findById(userId).lastName;
        const name = firstName + ' ' + lastName;
        //Mail send krlo confirmation wala
        const emailResponse = await mailSender(
          enrolledStudent.email,
          "Congratulations you are enrolled with a new course",
          courseEnrollmentEmail(courseName, name)
        );
        console.log(emailResponse);
        return res.status(200).json({
          success: true,
          message: "Signature verified and student is added to the course",
        });
      } catch (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        message: "Invalid request",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message:err.message,
    });

  }

};