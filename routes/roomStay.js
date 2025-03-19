const express = require('express');
const router = express.Router();
const roomStayController = require('../controllers/roomStayController');

// check-in and check-out guest
router.post('/check-in', roomStayController.checkInGuest);
router.post('/check-out/:roomStayId', roomStayController.checkOutGuest);

module.exports = router;