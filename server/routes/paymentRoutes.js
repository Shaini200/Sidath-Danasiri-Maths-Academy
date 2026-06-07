const express = require('express');
const multer = require('multer');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

const legacySlipParser = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
}).any();

router.post('/', auth, paymentController.recordPayment);
router.post('/upload', auth, legacySlipParser, paymentController.recordPayment);
router.get('/history', auth, paymentController.getPaymentHistory);
// Per-student payment history — must be before any /:id wildcards
router.get('/student/:student_id', auth, paymentController.getPaymentsByStudentId);

router.get('/income-summary', auth, paymentController.getIncomeSummary);

module.exports = router;
