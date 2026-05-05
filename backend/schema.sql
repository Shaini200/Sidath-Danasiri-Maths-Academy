CREATE DATABASE IF NOT EXISTS student_management;
USE student_management;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Student') NOT NULL DEFAULT 'Student'
);

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    grade VARCHAR(20),
    year INT
);

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    bank VARCHAR(100) NOT NULL,
    method VARCHAR(50) NOT NULL,
    month VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    slip_path VARCHAR(255) NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Insert default admin
INSERT IGNORE INTO users (username, password, role) VALUES ('admin', '$2a$10$tZ2.Q2xN9iUjP.Z8m1Q/iOgL1.tM8r2H1yL2E9xUuU7eT9sWbYm.q', 'Admin');
-- password is 'admin123'
