const pool = require('../db/db');

async function initializeDatabase() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database');
    client.release();
    return true;
  } catch (err) {
    console.error('Error connecting to the database:', err);
    return false;
  }
}

module.exports = { initializeDatabase };