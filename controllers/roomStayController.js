const roomStayService = require('../services/roomStayService');

const checkInGuest = async (req, res) => {
  try {
    const { roomId, guestName, notes } = req.body;
    const result = await roomStayService.checkInGuest(roomId, guestName, notes);
    res.status(201).json({ message: 'Guest checked in successfully', roomStayId: result.roomStayId });
  } catch (error) {
    console.error('Error checking in guest:', error);
    const statusCode = error.status || 500;
    res.status(statusCode).json({ error: error.message || 'Failed to check in guest' });
  }
};

const checkOutGuest = async (req, res) => {
  try {
    const { roomStayId } = req.params;
    const result = await roomStayService.checkOutGuest(roomStayId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error checking out guest:', error);
    const statusCode = error.status || 500;
    res.status(statusCode).json({ error: error.message || 'Failed to check out guest' });
  }
};

module.exports = {
  checkInGuest,
  checkOutGuest
};