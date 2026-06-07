const db = require('../server/config/db');

async function updateSchema() {
    try {
        console.log('Adding amount column to payments table...');
        await db.execute('ALTER TABLE payments ADD COLUMN amount DECIMAL(10, 2) DEFAULT 0.00');
        console.log('Schema updated successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error updating schema:', err);
        process.exit(1);
    }
}

updateSchema();
