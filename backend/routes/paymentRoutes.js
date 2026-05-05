const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

router.post('/upload', auth, paymentController.uploadPayment);
router.get('/history', auth, paymentController.getPaymentHistory);
// Per-student payment history — must be before any /:id wildcards
router.get('/student/:student_id', auth, paymentController.getPaymentsByStudentId);

router.get('/income-summary', auth, paymentController.getIncomeSummary);

module.exports = router;
