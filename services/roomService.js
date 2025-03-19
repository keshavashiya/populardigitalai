const pool = require("../db/db");

const getRooms = async () => {
  try {
    const result = await pool.query(
      "SELECT * FROM rooms ORDER BY room_number"
    );
    return result.rows;
  } catch (err) {
    throw new Error("Failed to fetch rooms: " + err.message);
  }
};

module.exports = {
  getRooms
};
