const db = require('../config/db');

const REQUIRED_PAYMENT_FIELDS = ['student_id', 'bank', 'month', 'date', 'amount'];

const cleanString = (value) => String(value ?? '').trim();

exports.recordPayment = async (req, res) => {
    try {
        const body = req.body || {};
        const payment = {
            student_id: cleanString(body.student_id),
            bank: cleanString(body.bank),
            method: cleanString(body.method) || 'Bank Transfer',
            month: cleanString(body.month),
            date: cleanString(body.date),
            amount: Number(body.amount),
        };

        const missingField = REQUIRED_PAYMENT_FIELDS.find((field) => {
            if (field === 'amount') return body.amount === undefined || body.amount === null || cleanString(body.amount) === '';
            return !payment[field];
        });

        if (missingField) {
            return res.status(400).json({ message: `Missing payment field: ${missingField}` });
        }

        if (!Number.isFinite(payment.amount) || payment.amount <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than 0' });
        }

        const [students] = await db.execute('SELECT * FROM students WHERE student_id = ?', [payment.student_id]);
        if (students.length === 0) {
            return res.status(404).json({ message: 'Student ID not found' });
        }

        const [result] = await db.execute(
            'INSERT INTO payments (student_id, bank, method, month, date, slip_path, amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [payment.student_id, payment.bank, payment.method, payment.month, payment.date, '', payment.amount]
        );

        res.status(201).json({ message: 'Payment recorded successfully', paymentId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

exports.getPaymentHistory = async (req, res) => {
    try {
        let query = 'SELECT p.*, s.name FROM payments p JOIN students s ON p.student_id = s.student_id ORDER BY p.date DESC';
        let params = [];

        // If not admin, only show own payments (assuming req.user.username is their student_id if they are a student)
        if (req.user.role !== 'Admin') {
            query = 'SELECT p.*, s.name FROM payments p JOIN students s ON p.student_id = s.student_id WHERE p.student_id = ? ORDER BY p.date DESC';
            params = [req.user.username];
        }

        const [payments] = await db.execute(query, params);
        res.json(payments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/payments/student/:student_id
exports.getPaymentsByStudentId = async (req, res) => {
    try {
        const { student_id } = req.params;
        const [payments] = await db.execute(
            `SELECT p.*, s.name, s.grade, s.phone, s.address, s.year
             FROM payments p
             JOIN students s ON p.student_id = s.student_id
             WHERE p.student_id = ?
             ORDER BY p.date DESC`,
            [student_id]
        );
        res.json(payments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
// GET /api/payments/income-summary
exports.getIncomeSummary = async (req, res) => {
    try {
        // Income grouped by grade
        const [incomeByGrade] = await db.execute(`
            SELECT s.grade, SUM(p.amount) as total_income, COUNT(DISTINCT s.student_id) as student_count
            FROM students s
            LEFT JOIN payments p ON s.student_id = p.student_id
            GROUP BY s.grade
        `);

        // Monthly income summary
        const [monthlyIncome] = await db.execute(`
            SELECT month, SUM(amount) as total_income
            FROM payments
            GROUP BY month
            ORDER BY FIELD(month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December')
        `);

        // Total income
        const [totalIncomeResult] = await db.execute('SELECT SUM(amount) as total_income FROM payments');
        const totalIncome = totalIncomeResult[0].total_income || 0;

        res.json({
            incomeByGrade,
            monthlyIncome,
            totalIncome
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
