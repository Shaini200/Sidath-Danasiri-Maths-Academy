const dotenv = require('dotenv');
const mysql = require('mysql2');
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const postgresUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.SUPABASE_DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const monthOrder = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

const toPostgresQuery = (sql, params = []) => {
    let index = 0;
    let text = sql.replace(/\?/g, () => `$${++index}`);

    text = text.replace(/`/g, '"');
    text = text.replace(
        /ORDER BY FIELD\(month,\s*'January',\s*'February',\s*'March',\s*'April',\s*'May',\s*'June',\s*'July',\s*'August',\s*'September',\s*'October',\s*'November',\s*'December'\)/i,
        `ORDER BY CASE month ${monthOrder.map((month, i) => `WHEN '${month}' THEN ${i + 1}`).join(' ')} ELSE 13 END`
    );

    if (/^\s*INSERT\s+INTO\s+students\b/i.test(text) || /^\s*INSERT\s+INTO\s+payments\b/i.test(text)) {
        text = `${text} RETURNING id`;
    }

    return { text, values: params };
};

const createPostgresDb = () => {
    const pool = new Pool({
        connectionString: postgresUrl,
        ssl: process.env.POSTGRES_SSL === 'false' ? false : { rejectUnauthorized: false },
    });

    return {
        async execute(sql, params = []) {
            const query = toPostgresQuery(sql, params);
            const result = await pool.query(query);

            if (/^\s*INSERT\b/i.test(sql)) {
                return [{ insertId: result.rows[0]?.id }, result.fields];
            }

            return [result.rows, result.fields];
        },
    };
};

const createMysqlDb = () => {
    const hasMysqlConfig = process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME;

    if (!hasMysqlConfig && process.env.NODE_ENV === 'production') {
        return {
            async execute() {
                throw new Error('Database is not configured. Set DATABASE_URL for Supabase/Postgres or DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME for MySQL.');
            },
        };
    }

    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Shaini123#',
        database: process.env.DB_NAME || 'student_management',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    return pool.promise();
};

const stripLike = (value = '') => String(value).replace(/^%|%$/g, '');

const throwSupabaseError = (error) => {
    if (error) {
        throw new Error(error.message);
    }
};

const createSupabaseDb = () => {
    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false,
        },
    });

    const selectStudents = async ({ grade, search, month } = {}) => {
        let studentIds = null;

        if (month && month !== 'All') {
            const { data, error } = await supabase
                .from('payments')
                .select('student_id')
                .eq('month', month);
            throwSupabaseError(error);
            studentIds = [...new Set((data || []).map((payment) => payment.student_id))];
            if (studentIds.length === 0) return [];
        }

        let query = supabase.from('students').select('*').order('name', { ascending: true });

        if (studentIds) query = query.in('student_id', studentIds);
        if (grade && grade !== 'All') query = query.eq('grade', grade);
        if (search) {
            const term = stripLike(search).replace(/,/g, '\\,');
            query = query.or(`name.ilike.%${term}%,student_id.ilike.%${term}%`);
        }

        const { data, error } = await query;
        throwSupabaseError(error);
        return data || [];
    };

    const selectPaymentsWithNames = async ({ studentId } = {}) => {
        let paymentsQuery = supabase.from('payments').select('*').order('date', { ascending: false });
        if (studentId) paymentsQuery = paymentsQuery.eq('student_id', studentId);

        const { data: payments, error: paymentsError } = await paymentsQuery;
        throwSupabaseError(paymentsError);

        const studentIds = [...new Set((payments || []).map((payment) => payment.student_id))];
        if (studentIds.length === 0) return [];

        const { data: students, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .in('student_id', studentIds);
        throwSupabaseError(studentsError);

        const studentsById = new Map((students || []).map((student) => [student.student_id, student]));

        return (payments || []).map((payment) => {
            const student = studentsById.get(payment.student_id) || {};
            return {
                ...payment,
                name: student.name,
                grade: student.grade,
                phone: student.phone,
                address: student.address,
                year: student.year,
            };
        });
    };

    const selectIncomeByGrade = async () => {
        const students = await selectStudents();
        const { data: payments, error } = await supabase.from('payments').select('student_id, amount');
        throwSupabaseError(error);

        const totals = new Map();
        for (const student of students) {
            if (!totals.has(student.grade)) {
                totals.set(student.grade, {
                    grade: student.grade,
                    total_income: 0,
                    student_count: 0,
                });
            }
            totals.get(student.grade).student_count += 1;
        }

        for (const payment of payments || []) {
            const student = students.find((item) => item.student_id === payment.student_id);
            if (!student) continue;
            if (!totals.has(student.grade)) {
                totals.set(student.grade, {
                    grade: student.grade,
                    total_income: 0,
                    student_count: 0,
                });
            }
            totals.get(student.grade).total_income += Number(payment.amount || 0);
        }

        return [...totals.values()];
    };

    const selectMonthlyIncome = async () => {
        const { data: payments, error } = await supabase.from('payments').select('month, amount');
        throwSupabaseError(error);

        const totals = new Map();
        for (const payment of payments || []) {
            totals.set(payment.month, (totals.get(payment.month) || 0) + Number(payment.amount || 0));
        }

        return [...totals.entries()]
            .map(([month, total_income]) => ({ month, total_income }))
            .sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
    };

    return {
        async execute(sql, params = []) {
            const normalizedSql = sql.replace(/\s+/g, ' ').trim();

            if (/^SELECT \* FROM users WHERE username = \?/i.test(normalizedSql)) {
                const { data, error } = await supabase.from('users').select('*').eq('username', params[0]);
                throwSupabaseError(error);
                return [data || [], null];
            }

            if (/^SELECT id, username, role FROM users WHERE id = \?/i.test(normalizedSql)) {
                const { data, error } = await supabase.from('users').select('id, username, role').eq('id', params[0]);
                throwSupabaseError(error);
                return [data || [], null];
            }

            if (/^SELECT \* FROM students ORDER BY name ASC/i.test(normalizedSql)) {
                return [await selectStudents(), null];
            }

            if (/^SELECT DISTINCT s\.\* FROM students s/i.test(normalizedSql)) {
                let paramIndex = 0;
                const month = normalizedSql.includes('p.month = ?') ? params[paramIndex++] : undefined;
                const grade = normalizedSql.includes('s.grade = ?') ? params[paramIndex++] : undefined;
                const search = normalizedSql.includes('s.name LIKE ?') ? params[paramIndex] : undefined;
                return [await selectStudents({ grade, search, month }), null];
            }

            if (/^SELECT grade, COUNT\(\*\) AS count FROM students GROUP BY grade/i.test(normalizedSql)) {
                const students = await selectStudents();
                const counts = new Map();
                for (const student of students) {
                    counts.set(student.grade, (counts.get(student.grade) || 0) + 1);
                }
                return [[...counts.entries()].map(([grade, count]) => ({ grade, count })), null];
            }

            if (/^SELECT \* FROM students WHERE id = \?/i.test(normalizedSql)) {
                const { data, error } = await supabase.from('students').select('*').eq('id', params[0]);
                throwSupabaseError(error);
                return [data || [], null];
            }

            if (/^SELECT \* FROM students WHERE student_id = \?/i.test(normalizedSql)) {
                const { data, error } = await supabase.from('students').select('*').eq('student_id', params[0]);
                throwSupabaseError(error);
                return [data || [], null];
            }

            if (/^INSERT INTO students/i.test(normalizedSql)) {
                const [name, student_id, address, phone, grade, year] = params;
                const { data, error } = await supabase
                    .from('students')
                    .insert({ name, student_id, address, phone, grade, year })
                    .select('id')
                    .single();
                throwSupabaseError(error);
                return [{ insertId: data?.id }, null];
            }

            if (/^UPDATE students SET/i.test(normalizedSql)) {
                const [name, address, phone, grade, year, id] = params;
                const { error } = await supabase
                    .from('students')
                    .update({ name, address, phone, grade, year })
                    .eq('id', id);
                throwSupabaseError(error);
                return [{ affectedRows: 1 }, null];
            }

            if (/^DELETE FROM students WHERE id = \?/i.test(normalizedSql)) {
                const { error } = await supabase.from('students').delete().eq('id', params[0]);
                throwSupabaseError(error);
                return [{ affectedRows: 1 }, null];
            }

            if (/^INSERT INTO payments/i.test(normalizedSql)) {
                const [student_id, bank, method, month, date, slip_path, amount] = params;
                const { data, error } = await supabase
                    .from('payments')
                    .insert({ student_id, bank, method, month, date, slip_path, amount: amount || 0 })
                    .select('id')
                    .single();
                throwSupabaseError(error);
                return [{ insertId: data?.id }, null];
            }

            if (/^SELECT p\.\*, s\.name FROM payments p JOIN students s ON p\.student_id = s\.student_id WHERE p\.student_id = \?/i.test(normalizedSql)) {
                return [await selectPaymentsWithNames({ studentId: params[0] }), null];
            }

            if (/^SELECT p\.\*, s\.name FROM payments p JOIN students s ON p\.student_id = s\.student_id ORDER BY p\.date DESC/i.test(normalizedSql)) {
                return [await selectPaymentsWithNames(), null];
            }

            if (/^SELECT p\.\*, s\.name, s\.grade, s\.phone, s\.address, s\.year FROM payments p JOIN students s/i.test(normalizedSql)) {
                return [await selectPaymentsWithNames({ studentId: params[0] }), null];
            }

            if (/^SELECT s\.grade, SUM\(p\.amount\) as total_income/i.test(normalizedSql)) {
                return [await selectIncomeByGrade(), null];
            }

            if (/^SELECT month, SUM\(amount\) as total_income FROM payments GROUP BY month/i.test(normalizedSql)) {
                return [await selectMonthlyIncome(), null];
            }

            if (/^SELECT SUM\(amount\) as total_income FROM payments/i.test(normalizedSql)) {
                const { data, error } = await supabase.from('payments').select('amount');
                throwSupabaseError(error);
                const total_income = (data || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
                return [[{ total_income }], null];
            }

            throw new Error(`Unsupported Supabase query: ${normalizedSql}`);
        },
    };
};

module.exports = postgresUrl
    ? createPostgresDb()
    : supabaseUrl && supabaseKey
        ? createSupabaseDb()
        : createMysqlDb();
