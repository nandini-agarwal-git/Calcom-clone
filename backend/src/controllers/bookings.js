const pool = require('../db/pool');
const { v4: uuidv4 } = require('uuid');
const emailService = require('../utils/email');

const getBookings = async (req, res) => {
  try {
    const user = await pool.query('SELECT id FROM users LIMIT 1');
    const userId = user.rows[0].id;
    const { status, upcoming } = req.query;

    let query = `
      SELECT b.*, et.title as event_title, et.duration, et.color, et.slug
      FROM bookings b
      JOIN event_types et ON b.event_type_id = et.id
      WHERE et.user_id = $1
    `;
    const params = [userId];

    if (status) {
      params.push(status);
      query += ` AND b.status = $${params.length}`;
    }

    if (upcoming === 'true') {
      query += ` AND b.start_time > NOW()`;
    } else if (upcoming === 'false') {
      query += ` AND b.start_time <= NOW()`;
    }

    query += ` ORDER BY b.start_time ${upcoming === 'false' ? 'DESC' : 'ASC'}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getBooking = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, et.title as event_title, et.duration, et.color, et.description as event_description, et.slug,
              u.name as host_name, u.email as host_email, u.timezone
       FROM bookings b
       JOIN event_types et ON b.event_type_id = et.id
       JOIN users u ON et.user_id = u.id
       WHERE b.id = $1 OR b.uid = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { cancellation_reason } = req.body;
    const result = await pool.query(
      `UPDATE bookings SET status='cancelled', cancellation_reason=$1, updated_at=NOW()
       WHERE id=$2 OR uid=$2 RETURNING *`,
      [cancellation_reason || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });

    // Send cancellation email
    const booking = result.rows[0];
    const eventType = await pool.query('SELECT *, (SELECT name FROM users WHERE id=user_id) as host_name FROM event_types WHERE id=$1', [booking.event_type_id]);
    if (eventType.rows.length > 0) {
      await emailService.sendCancellationEmail(booking, eventType.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const rescheduleBooking = async (req, res) => {
  try {
    const { new_start_time, new_end_time } = req.body;
    const originalBooking = await pool.query('SELECT * FROM bookings WHERE id=$1 OR uid=$1', [req.params.id]);
    if (originalBooking.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });

    const original = originalBooking.rows[0];
    const newUid = `booking-${uuidv4().substring(0, 8)}`;

    // Create new booking
    const newBooking = await pool.query(
      `INSERT INTO bookings (id, event_type_id, uid, title, start_time, end_time, booker_name, booker_email, status, location, reschedule_from)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'confirmed',$9,$10) RETURNING *`,
      [uuidv4(), original.event_type_id, newUid, original.title, new_start_time, new_end_time, original.booker_name, original.booker_email, original.location, original.id]
    );

    // Cancel original
    await pool.query(
      `UPDATE bookings SET status='rescheduled', updated_at=NOW() WHERE id=$1`,
      [original.id]
    );

    res.json(newBooking.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getBookings, getBooking, cancelBooking, rescheduleBooking };
