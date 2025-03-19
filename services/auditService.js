const pool = require('../db/db');

const createCheckInAudit = async (roomStayId, auditorName, notes, items) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const auditResult = await client.query(
      'INSERT INTO audit_records (room_stay_id, audit_type, auditor_name, notes) VALUES ($1, $2, $3, $4) RETURNING id',
      [roomStayId, 'CHECK_IN', auditorName, notes]
    );

    const auditId = auditResult.rows[0].id;

    for (const item of items) {
      await client.query(
        'INSERT INTO audit_items (audit_record_id, item_id, quantity, condition_status, notes) VALUES ($1, $2, $3, $4, $5)',
        [auditId, item.itemId, item.quantity, item.conditionStatus, item.notes]
      );
    }

    await client.query('COMMIT');
    return { auditId };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const createCheckOutAudit = async (roomStayId, auditorName, notes, items) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const auditResult = await client.query(
      'INSERT INTO audit_records (room_stay_id, audit_type, auditor_name, notes) VALUES ($1, $2, $3, $4) RETURNING id',
      [roomStayId, 'CHECK_OUT', auditorName, notes]
    );

    const auditId = auditResult.rows[0].id;

    for (const item of items) {
      await client.query(
        'INSERT INTO audit_items (audit_record_id, item_id, quantity, condition_status, notes) VALUES ($1, $2, $3, $4, $5)',
        [auditId, item.itemId, item.quantity, item.conditionStatus, item.notes]
      );
    }

    await client.query('COMMIT');
    return { auditId };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const compareAudits = async (roomStayId) => {
  const client = await pool.connect();
  try {
    // First check if both check-in and check-out audits exist
    const auditTypesResult = await client.query(
      `SELECT DISTINCT audit_type
       FROM audit_records
       WHERE room_stay_id = $1`,
      [roomStayId]
    );

    const auditTypes = auditTypesResult.rows.map(row => row.audit_type);
    if (!auditTypes.includes('CHECK_IN')) {
      const error = new Error('No check-in audit found for this room stay');
      error.status = 404;
      throw error;
    }
    if (!auditTypes.includes('CHECK_OUT')) {
      return {
        roomStayId,
        status: 'PENDING_CHECKOUT',
        message: 'Check-out audit has not been performed yet'
      };
    }

    const audits = await client.query(
      `SELECT ar.id, ar.audit_type, ar.audit_time, ai.item_id, i.name as item_name,
              ai.quantity, ai.condition_status, ai.notes
       FROM audit_records ar
       JOIN audit_items ai ON ar.id = ai.audit_record_id
       JOIN items i ON ai.item_id = i.id
       WHERE ar.room_stay_id = $1
       ORDER BY ar.audit_time`,
      [roomStayId]
    );

    const checkInItems = {};
    const checkOutItems = {};
    const differences = [];

    audits.rows.forEach(row => {
      const itemData = {
        itemId: row.item_id,
        itemName: row.item_name,
        quantity: row.quantity,
        conditionStatus: row.condition_status,
        notes: row.notes
      };

      if (row.audit_type === 'CHECK_IN') {
        checkInItems[row.item_id] = itemData;
      } else {
        checkOutItems[row.item_id] = itemData;
      }
    });

    for (const itemId in checkInItems) {
      const checkIn = checkInItems[itemId];
      const checkOut = checkOutItems[itemId];

      if (checkOut) {
        if (checkIn.quantity !== checkOut.quantity || checkIn.conditionStatus !== checkOut.conditionStatus) {
          differences.push({
            itemName: checkIn.itemName,
            checkIn: {
              quantity: checkIn.quantity,
              conditionStatus: checkIn.conditionStatus
            },
            checkOut: {
              quantity: checkOut.quantity,
              conditionStatus: checkOut.conditionStatus
            },
            quantityDifference: checkIn.quantity - checkOut.quantity
          });
        }
      } else {
        differences.push({
          itemName: checkIn.itemName,
          checkIn: {
            quantity: checkIn.quantity,
            conditionStatus: checkIn.conditionStatus
          },
          checkOut: null,
          quantityDifference: checkIn.quantity
        });
      }
    }

    return {
      roomStayId,
      differences
    };
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createCheckInAudit,
  createCheckOutAudit,
  compareAudits
};