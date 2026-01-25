const mysql = require('mysql2/promise');
require('dotenv').config();

async function diagnosePurchases() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        console.log('--- ITEMS TABLE ---');
        const [items] = await connection.execute('SELECT id, title, status FROM items');
        console.table(items);

        console.log('\n--- BOOKINGS TABLE ---');
        const [bookings] = await connection.execute('SELECT id, item_id, user_id, status FROM bookings');
        console.table(bookings);

        console.log('\n--- JOINED PURCHASES (Current logic) ---');
        const [purchases] = await connection.execute(`
      SELECT items.id as item_id, items.title, items.status as item_status, 
             bookings.id as booking_id, bookings.status as booking_status, bookings.user_id
      FROM bookings 
      JOIN items ON bookings.item_id = items.id 
      WHERE bookings.status IN ('confirmed', 'reserved') 
        AND items.status != 'available'
    `);
        console.table(purchases);

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

diagnosePurchases();
