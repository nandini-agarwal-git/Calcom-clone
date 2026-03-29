const pool = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

const getEventTypes = async (req, res) => {
  try {
    const user = await pool.query('SELECT id FROM users LIMIT 1');
    const userId = user.rows[0].id;
    const result = await pool.query(
      `SELECT et.*, 
        (SELECT COUNT(*) FROM bookings b WHERE b.event_type_id = et.id AND b.status = 'confirmed' AND b.start_time > NOW()) as upcoming_bookings
       FROM event_types et 
       WHERE et.user_id = $1 
       ORDER BY et.created_at ASC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEventType = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM event_types WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createEventType = async (req, res) => {
  try {
    const user = await pool.query('SELECT id FROM users LIMIT 1');
    const userId = user.rows[0].id;
    const {
      title, description, slug, duration, color, location_type, location,
      buffer_time_before, buffer_time_after, min_booking_notice, max_booking_days,
      requires_confirmation, custom_questions
    } = req.body;

    // Check slug uniqueness
    const existing = await pool.query(
      'SELECT id FROM event_types WHERE user_id=$1 AND slug=$2',
      [userId, slug]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Slug already exists. Please choose a different URL.' });
    }

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO event_types (id, user_id, title, description, slug, duration, color, location_type, location, buffer_time_before, buffer_time_after, min_booking_notice, max_booking_days, requires_confirmation, custom_questions)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [id, userId, title, description, slug, duration || 30, color || '#6366f1', location_type || 'video', location, buffer_time_before || 0, buffer_time_after || 0, min_booking_notice || 60, max_booking_days || 60, requires_confirmation || false, JSON.stringify(custom_questions || [])]
    );

    // Link to default schedule
    const schedule = await pool.query(
      'SELECT id FROM availability_schedules WHERE user_id=$1 AND is_default=true LIMIT 1',
      [userId]
    );
    if (schedule.rows.length > 0) {
      await pool.query(
        'INSERT INTO event_type_schedules (event_type_id, schedule_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [id, schedule.rows[0].id]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateEventType = async (req, res) => {
  try {
    const {
      title, description, slug, duration, color, location_type, location,
      buffer_time_before, buffer_time_after, min_booking_notice, max_booking_days,
      requires_confirmation, custom_questions, is_active
    } = req.body;

    const result = await pool.query(
      `UPDATE event_types SET 
        title=COALESCE($1,title), description=COALESCE($2,description), slug=COALESCE($3,slug),
        duration=COALESCE($4,duration), color=COALESCE($5,color), location_type=COALESCE($6,location_type),
        location=COALESCE($7,location), buffer_time_before=COALESCE($8,buffer_time_before),
        buffer_time_after=COALESCE($9,buffer_time_after), min_booking_notice=COALESCE($10,min_booking_notice),
        max_booking_days=COALESCE($11,max_booking_days), requires_confirmation=COALESCE($12,requires_confirmation),
        custom_questions=COALESCE($13,custom_questions), is_active=COALESCE($14,is_active), updated_at=NOW()
       WHERE id=$15 RETURNING *`,
      [title, description, slug, duration, color, location_type, location, buffer_time_before, buffer_time_after, min_booking_notice, max_booking_days, requires_confirmation, custom_questions ? JSON.stringify(custom_questions) : null, is_active, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteEventType = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM event_types WHERE id=$1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Event type deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const toggleEventType = async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE event_types SET is_active = NOT is_active, updated_at=NOW() WHERE id=$1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getEventTypes, getEventType, createEventType, updateEventType, deleteEventType, toggleEventType };
