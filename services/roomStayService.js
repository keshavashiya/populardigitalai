const pool = require('../db/db');

const checkInGuest = async (roomId, guestName, notes) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if room is available
    const roomResult = await client.query(
      'SELECT status FROM rooms WHERE id = $1 FOR UPDATE',
      [roomId]
    );

    if (roomResult.rows.length === 0) {
      throw { status: 404, message: 'Room not found' };
    }

    if (roomResult.rows[0].status !== 'AVAILABLE') {
      throw { status: 400, message: 'Room is not available' };
    }

    // Create room stay record
    const roomStayResult = await client.query(
      'INSERT INTO room_stays (room_id, guest_name, check_in_time, status, notes) VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4) RETURNING id',
      [roomId, guestName, 'CHECKED_IN', notes]
    );

    // Update room status
    await client.query(
      'UPDATE rooms SET status = $1 WHERE id = $2',
      ['OCCUPIED', roomId]
    );

    await client.query('COMMIT');
    return { roomStayId: roomStayResult.rows[0].id };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const checkOutGuest = async (roomStayId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get room stay and room information
    const roomStayResult = await client.query(
      'SELECT rs.*, r.id as room_id FROM room_stays rs JOIN rooms r ON rs.room_id = r.id WHERE rs.id = $1 FOR UPDATE',
      [roomStayId]
    );

    if (roomStayResult.rows.length === 0) {
      throw { status: 404, message: 'Room stay not found' };
    }

    const roomStay = roomStayResult.rows[0];
    if (roomStay.status !== 'CHECKED_IN') {
      throw { status: 400, message: 'Guest is not checked in' };
    }

    // Update room stay record
    await client.query(
      'UPDATE room_stays SET check_out_time = CURRENT_TIMESTAMP, status = $1 WHERE id = $2',
      ['CHECKED_OUT', roomStayId]
    );

    // Update room status
    await client.query(
      'UPDATE rooms SET status = $1 WHERE id = $2',
      ['AVAILABLE', roomStay.room_id]
    );

    await client.query('COMMIT');
    return { message: 'Check-out successful' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  checkInGuest,
  checkOutGuest
};