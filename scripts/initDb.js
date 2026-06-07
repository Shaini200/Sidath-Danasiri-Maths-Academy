const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function initDb() {
    try {
        console.log('Connecting to MySQL...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Shaini123#',
            multipleStatements: true
        });

        console.log('Connected! Reading schema.sql...');
        const schema = fs.readFileSync(path.join(process.cwd(), 'server', 'schema.sql'), 'utf-8');

        console.log('Executing schema.sql...');
        await connection.query(schema);

        console.log('Database initialized successfully! You can now log in.');
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

initDb();
