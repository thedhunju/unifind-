const db = require('../db');

async function addPasswordColumn() {
    try {
        console.log('Connected to database (via pool).');

        // Add password column if it doesn't exist
        try {
            await db.query('ALTER TABLE users ADD COLUMN password VARCHAR(255)');
            console.log('Password column added successfully.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Password column already exists.');
            } else {
                throw err;
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Error updating database:', err);
        process.exit(1);
    }
}

addPasswordColumn();
