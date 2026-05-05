const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function updateDb() {
    try {
        console.log('Connecting...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'school_management'
        });

        console.log('Adding amount column to payments table...');
        
        // We catch errors in case the column already exists
        try {
            await connection.query('ALTER TABLE payments ADD COLUMN amount DECIMAL(10,2) NOT NULL DEFAULT 0;');
            console.log('Column added successfully.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('Column already exists, skipping.');
            } else {
                throw e;
            }
        }
        
        console.log('Update complete!');
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
updateDb();
