const auditService = require('../services/auditService');

const createCheckInAudit = async (req, res) => {
  try {
    const { roomStayId, auditorName, notes, items } = req.body;
    const result = await auditService.createCheckInAudit(roomStayId, auditorName, notes, items);
    res.status(201).json({ message: 'Check-in audit created successfully', auditId: result.auditId });
  } catch (error) {
    console.error('Error creating check-in audit:', error);
    res.status(500).json({ error: 'Failed to create check-in audit' });
  }
};

const createCheckOutAudit = async (req, res) => {
  try {
    const { roomStayId, auditorName, notes, items } = req.body;
    const result = await auditService.createCheckOutAudit(roomStayId, auditorName, notes, items);
    res.status(201).json({ message: 'Check-out audit created successfully', auditId: result.auditId });
  } catch (error) {
    console.error('Error creating check-out audit:', error);
    res.status(500).json({ error: 'Failed to create check-out audit' });
  }
};

const compareAudits = async (req, res) => {
  try {
    const { roomStayId } = req.params;
    const result = await auditService.compareAudits(roomStayId);
    res.json(result);
  } catch (error) {
    console.error('Error comparing audits:', error);
    const statusCode = error.status || 500;
    res.status(statusCode).json({ error: error.message || 'Failed to compare audits' });
  }
};

module.exports = {
  createCheckInAudit,
  createCheckOutAudit,
  compareAudits
};