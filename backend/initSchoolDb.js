const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function initSchoolDb() {
    try {
        console.log('Connecting...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log('Creating new database school_management...');
        await connection.query('CREATE DATABASE IF NOT EXISTS school_management;');
        await connection.query('USE school_management;');

        console.log('Creating tables...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('Admin', 'Student') NOT NULL DEFAULT 'Student'
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                student_id VARCHAR(50) NOT NULL UNIQUE,
                address TEXT,
                phone VARCHAR(20),
                grade VARCHAR(20),
                year INT
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id VARCHAR(50) NOT NULL,
                bank VARCHAR(100) NOT NULL,
                method VARCHAR(50) NOT NULL,
                month VARCHAR(20) NOT NULL,
                date DATE NOT NULL,
                slip_path VARCHAR(255) NOT NULL,
                FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
            )
        `);

        console.log('Inserting admin with correct password hash...');
        const hash = await bcrypt.hash('admin123', 10);
        await connection.query('INSERT IGNORE INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hash, 'Admin']);
        
        console.log('Database initialized perfectly!');
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
initSchoolDb();
