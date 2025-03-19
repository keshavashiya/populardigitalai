const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');

router.post('/check-in', auditController.createCheckInAudit);
router.post('/check-out', auditController.createCheckOutAudit);
router.get('/compare/:roomStayId', auditController.compareAudits);

module.exports = router;