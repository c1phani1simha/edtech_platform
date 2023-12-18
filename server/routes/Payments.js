//Import required modules

const express = require('express');
const router = express.Router();

const { capturePayment, verifySignature } = require('../controllers/Payments');
const { auth, isAdmin, isInstructor, isStudent } = require('../middleware/auth');


router.post('/capturePayment', auth, isStudent, capturePayment);
router.post('/verifySignature', verifySignature);

module.exports = router;