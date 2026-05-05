const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/', auth, studentController.getAllStudents);
// Must be before /:id to avoid route collision
router.get('/by-grade', auth, studentController.getStudentsByGrade);
router.get('/grade-counts', auth, studentController.getGradeCounts);
router.get('/:id', auth, studentController.getStudentById);
router.post('/', adminAuth, studentController.createStudent);
router.put('/:id', adminAuth, studentController.updateStudent);
router.delete('/:id', adminAuth, studentController.deleteStudent);

module.exports = router;
