const pool = require('../db/pool');
const { v4: uuidv4 } = require('uuid');
const emailService = require('../utils/email');

// Get public profile by username
const getPublicProfile = async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, name, username, bio, avatar_url, timezone FROM users WHERE username=$1',
      [req.params.username]
    );
    if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const eventTypes = await pool.query(
      'SELECT id, title, description, slug, duration, color, location_type FROM event_types WHERE user_id=$1 AND is_active=true ORDER BY created_at ASC',
      [user.rows[0].id]
    );

    res.json({ user: user.rows[0], eventTypes: eventTypes.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get event type details for booking page
const getPublicEventType = async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, name, username, bio, avatar_url, timezone FROM users WHERE username=$1',
      [req.params.username]
    );
    if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const eventType = await pool.query(
      'SELECT * FROM event_types WHERE user_id=$1 AND slug=$2 AND is_active=true',
      [user.rows[0].id, req.params.slug]
    );
    if (eventType.rows.length === 0) return res.status(404).json({ error: 'Event type not found' });

    res.json({ user: user.rows[0], eventType: eventType.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get available time slots for a given date
const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    const { username, slug } = req.params;

    if (!date) return res.status(400).json({ error: 'Date is required' });

    // Get user & event type
    const user = await pool.query('SELECT id, timezone FROM users WHERE username=$1', [username]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const eventType = await pool.query(
      'SELECT * FROM event_types WHERE user_id=$1 AND slug=$2 AND is_active=true',
      [user.rows[0].id, slug]
    );
    if (eventType.rows.length === 0) return res.status(404).json({ error: 'Event type not found' });

    const et = eventType.rows[0];
    const requestedDate = new Date(date + 'T00:00:00');
    const dayOfWeek = requestedDate.getDay(); // 0=Sun, 6=Sat

    // Get schedule for this event type
    const scheduleResult = await pool.query(`
      SELECT s.*, r.day_of_week, r.start_time, r.end_time, r.is_available
      FROM availability_schedules s
      JOIN event_type_schedules ets ON ets.schedule_id = s.id
      JOIN availability_rules r ON r.schedule_id = s.id
      WHERE ets.event_type_id = $1 AND r.day_of_week = $2
    `, [et.id, dayOfWeek]);

    // Check date overrides
    const override = await pool.query(`
      SELECT do.* FROM date_overrides do
      JOIN availability_schedules s ON do.schedule_id = s.id
      JOIN event_type_schedules ets ON ets.schedule_id = s.id
      WHERE ets.event_type_id = $1 AND do.date = $2
    `, [et.id, date]);

    // If date is blocked via override
    if (override.rows.length > 0 && override.rows[0].is_blocked) {
      return res.json({ slots: [], date, blocked: true });
    }

    // Determine available hours for this day
    let startHour, endHour;
    if (override.rows.length > 0 && !override.rows[0].is_blocked) {
      startHour = override.rows[0].start_time;
      endHour = override.rows[0].end_time;
    } else if (scheduleResult.rows.length > 0 && scheduleResult.rows[0].is_available) {
      startHour = scheduleResult.rows[0].start_time;
      endHour = scheduleResult.rows[0].end_time;
    } else {
      return res.json({ slots: [], date, available: false });
    }

    // Parse times
    const [startH, startM] = startHour.split(':').map(Number);
    const [endH, endM] = endHour.split(':').map(Number);

    // Generate slots
    const slots = [];
    const slotDuration = et.duration;
    const bufferAfter = et.buffer_time_after || 0;
    const bufferBefore = et.buffer_time_before || 0;
    const minNotice = et.min_booking_notice || 60;

    const now = new Date();
    const minBookingTime = new Date(now.getTime() + minNotice * 60000);

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes + slotDuration <= endMinutes) {
      const slotStart = new Date(date + 'T00:00:00');
      slotStart.setHours(Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0);

      const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);

      // Skip if not enough notice
      if (slotStart > minBookingTime) {
        // Check for conflicts with existing bookings
        const conflict = await pool.query(`
          SELECT id FROM bookings 
          WHERE event_type_id = $1 
          AND status IN ('confirmed', 'pending')
          AND (
            (start_time < $3 AND end_time > $2)
          )
        `, [et.id, 
          new Date(slotStart.getTime() - bufferBefore * 60000).toISOString(),
          new Date(slotEnd.getTime() + bufferAfter * 60000).toISOString()
        ]);

        slots.push({
          time: slotStart.toISOString(),
          available: conflict.rows.length === 0,
          display: formatTime(Math.floor(currentMinutes / 60), currentMinutes % 60)
        });
      }

      currentMinutes += slotDuration + bufferAfter;
    }

    res.json({ slots, date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

function formatTime(hours, minutes) {
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

// Create a booking
const createBooking = async (req, res) => {
  try {
    const { username, slug } = req.params;
    const { start_time, booker_name, booker_email, booker_phone, custom_answers, notes } = req.body;

    if (!start_time || !booker_name || !booker_email) {
      return res.status(400).json({ error: 'Missing required fields: start_time, booker_name, booker_email' });
    }

    // Get user & event type
    const user = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const eventType = await pool.query(
      'SELECT * FROM event_types WHERE user_id=$1 AND slug=$2 AND is_active=true',
      [user.rows[0].id, slug]
    );
    if (eventType.rows.length === 0) return res.status(404).json({ error: 'Event type not found' });

    const et = eventType.rows[0];
    const startTime = new Date(start_time);
    const endTime = new Date(startTime.getTime() + et.duration * 60000);

    // Double booking check
    const conflict = await pool.query(`
      SELECT id FROM bookings 
      WHERE event_type_id = $1 
      AND status IN ('confirmed','pending')
      AND start_time < $3 AND end_time > $2
    `, [et.id, startTime.toISOString(), endTime.toISOString()]);

    if (conflict.rows.length > 0) {
      return res.status(409).json({ error: 'This time slot is no longer available. Please choose another.' });
    }

    const bookingId = uuidv4();
    const uid = `booking-${bookingId.substring(0, 8)}`;
    const title = `${et.title} with ${booker_name}`;

    const booking = await pool.query(
      `INSERT INTO bookings (id, event_type_id, uid, title, start_time, end_time, booker_name, booker_email, booker_phone, status, location, custom_answers)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [bookingId, et.id, uid, title, startTime.toISOString(), endTime.toISOString(), booker_name, booker_email, booker_phone || null, et.requires_confirmation ? 'pending' : 'confirmed', et.location, JSON.stringify(custom_answers || {})]
    );

    // Send confirmation email
    await emailService.sendConfirmationEmail(booking.rows[0], et, user.rows[0]);

    res.status(201).json({
      ...booking.rows[0],
      event_title: et.title,
      host_name: user.rows[0].name,
      host_email: user.rows[0].email
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get available dates for a month (for calendar)
const getAvailableDates = async (req, res) => {
  try {
    const { month, year } = req.query;
    const { username, slug } = req.params;

    const user = await pool.query('SELECT id FROM users WHERE username=$1', [username]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const eventType = await pool.query(
      'SELECT * FROM event_types WHERE user_id=$1 AND slug=$2 AND is_active=true',
      [user.rows[0].id, slug]
    );
    if (eventType.rows.length === 0) return res.status(404).json({ error: 'Event type not found' });

    const et = eventType.rows[0];

    // Get which days of week are available
    const scheduleRules = await pool.query(`
      SELECT r.day_of_week, r.is_available
      FROM availability_rules r
      JOIN event_type_schedules ets ON ets.schedule_id = r.schedule_id
      WHERE ets.event_type_id = $1
    `, [et.id]);

    const availableDays = new Set(
      scheduleRules.rows
        .filter(r => r.is_available)
        .map(r => r.day_of_week)
    );

    // Get date overrides
    const overrides = await pool.query(`
      SELECT do.date, do.is_blocked
      FROM date_overrides do
      JOIN availability_schedules s ON do.schedule_id = s.id
      JOIN event_type_schedules ets ON ets.schedule_id = s.id
      WHERE ets.event_type_id = $1
    `, [et.id]);

    const blockedDates = new Set(overrides.rows.filter(o => o.is_blocked).map(o => o.date.toISOString().split('T')[0]));

    // Build available dates for the month
    const daysInMonth = new Date(year, month, 0).getDate();
    const now = new Date();
    const minNotice = et.min_booking_notice || 60;
    const maxBookingDate = new Date(now.getTime() + (et.max_booking_days || 60) * 24 * 60 * 60 * 1000);

    const availableDates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split('T')[0];

      if (date < now) continue;
      if (date > maxBookingDate) continue;
      if (blockedDates.has(dateStr)) continue;
      if (availableDays.has(date.getDay())) {
        availableDates.push(dateStr);
      }
    }

    res.json({ availableDates, month, year });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getPublicProfile, getPublicEventType, getAvailableSlots, createBooking, getAvailableDates };
