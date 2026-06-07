const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function resetDb() {
    try {
        console.log('Connecting...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Shaini123#',
            multipleStatements: true
        });

        const databaseName = process.env.DB_NAME || 'student_management';
        console.log('Resetting database...');
        await connection.query(`DROP DATABASE IF EXISTS \`${databaseName}\`;`);
        await connection.query(`CREATE DATABASE \`${databaseName}\`;`);
        await connection.query(`USE \`${databaseName}\`;`);

        console.log('Reading schema.sql...');
        const schema = fs.readFileSync(path.join(process.cwd(), 'server', 'schema.sql'), 'utf-8');
        await connection.query(schema);

        console.log('Generating hash for admin123...');
        const hash = await bcrypt.hash('admin123', 10);
        await connection.query('UPDATE users SET password = ? WHERE username = "admin"', [hash]);

        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
resetDb();
