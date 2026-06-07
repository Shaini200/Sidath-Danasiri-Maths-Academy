const db = require('../config/db');

exports.getAllStudents = async (req, res) => {
    try {
        const [students] = await db.execute('SELECT * FROM students ORDER BY name ASC');
        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/students/by-grade?grade=Grade+1&search=
exports.getStudentsByGrade = async (req, res) => {
    try {
        const { grade, search, month } = req.query;
        let query = 'SELECT DISTINCT s.* FROM students s';
        const params = [];
        const conditions = [];

        if (month && month !== 'All') {
            query += ' JOIN payments p ON s.student_id = p.student_id';
            conditions.push('p.month = ?');
            params.push(month);
        }

        if (grade && grade !== 'All') {
            conditions.push('s.grade = ?');
            params.push(grade);
        }
        if (search && search.trim() !== '') {
            conditions.push('(s.name LIKE ? OR s.student_id LIKE ?)');
            params.push(`%${search.trim()}%`, `%${search.trim()}%`);
        }
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY s.name ASC';

        const [students] = await db.execute(query, params);
        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/students/grade-counts  – returns count per grade
exports.getGradeCounts = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT grade, COUNT(*) AS count FROM students GROUP BY grade'
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const [students] = await db.execute('SELECT * FROM students WHERE id = ?', [req.params.id]);
        if (students.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(students[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createStudent = async (req, res) => {
    try {
        const { name, student_id, address, phone, grade, year } = req.body;
        
        const [existing] = await db.execute('SELECT * FROM students WHERE student_id = ?', [student_id]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Student ID already exists' });
        }

        const [result] = await db.execute(
            'INSERT INTO students (name, student_id, address, phone, grade, year) VALUES (?, ?, ?, ?, ?, ?)',
            [name, student_id, address, phone, grade, year]
        );

        res.status(201).json({ id: result.insertId, name, student_id, address, phone, grade, year });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { name, address, phone, grade, year } = req.body;
        await db.execute(
            'UPDATE students SET name = ?, address = ?, phone = ?, grade = ?, year = ? WHERE id = ?',
            [name, address, phone, grade, year, req.params.id]
        );
        res.json({ message: 'Student updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        await db.execute('DELETE FROM students WHERE id = ?', [req.params.id]);
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
