const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAdmin() {
    try {
        const hash = await bcrypt.hash('admin123', 10);
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Shaini123#',
            database: process.env.DB_NAME || 'student_management'
        });

        await connection.execute('UPDATE users SET password = ? WHERE username = "admin"', [hash]);
        console.log('Successfully fixed the admin password hash!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixAdmin();
