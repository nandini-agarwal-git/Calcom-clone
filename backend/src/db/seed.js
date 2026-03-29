const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing data
    await client.query('DELETE FROM bookings');
    await client.query('DELETE FROM event_type_schedules');
    await client.query('DELETE FROM date_overrides');
    await client.query('DELETE FROM availability_rules');
    await client.query('DELETE FROM availability_schedules');
    await client.query('DELETE FROM event_types');
    await client.query('DELETE FROM users');

    // Create default admin user
    const userId = uuidv4();
    await client.query(`
      INSERT INTO users (id, name, email, username, bio, timezone)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      userId,
      'Alex Johnson',
      'alex@calclone.com',
      'alex',
      'Product designer and developer. Let\'s connect and build something amazing together.',
      'America/New_York'
    ]);

    // Create default availability schedule
    const scheduleId = uuidv4();
    await client.query(`
      INSERT INTO availability_schedules (id, user_id, name, timezone, is_default)
      VALUES ($1, $2, $3, $4, $5)
    `, [scheduleId, userId, 'Working Hours', 'America/New_York', true]);

    // Add availability rules (Mon-Fri, 9am-5pm)
    const workDays = [1, 2, 3, 4, 5]; // Monday to Friday
    for (const day of workDays) {
      await client.query(`
        INSERT INTO availability_rules (id, schedule_id, day_of_week, start_time, end_time, is_available)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [uuidv4(), scheduleId, day, '09:00', '17:00', true]);
    }

    // Weekends unavailable
    for (const day of [0, 6]) {
      await client.query(`
        INSERT INTO availability_rules (id, schedule_id, day_of_week, start_time, end_time, is_available)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [uuidv4(), scheduleId, day, '09:00', '17:00', false]);
    }

    // Create event types
    const eventTypes = [
      {
        id: uuidv4(),
        title: '15 Minute Meeting',
        description: 'A quick sync to discuss your questions, ideas, or anything on your mind. Perfect for quick check-ins.',
        slug: '15min',
        duration: 15,
        color: '#6366f1',
        location_type: 'video',
        location: 'Zoom Meeting',
        buffer_time_after: 5,
        custom_questions: JSON.stringify([
          { id: 'q1', label: 'What would you like to discuss?', type: 'textarea', required: false }
        ])
      },
      {
        id: uuidv4(),
        title: '30 Minute Meeting',
        description: 'A standard meeting to go deeper into your project needs, strategy, or collaboration opportunities.',
        slug: '30min',
        duration: 30,
        color: '#8b5cf6',
        location_type: 'video',
        location: 'Google Meet',
        buffer_time_after: 10,
        custom_questions: JSON.stringify([
          { id: 'q1', label: 'What would you like to discuss?', type: 'textarea', required: false },
          { id: 'q2', label: 'Company name (if applicable)', type: 'text', required: false }
        ])
      },
      {
        id: uuidv4(),
        title: '60 Minute Strategy Call',
        description: 'An in-depth strategy session to plan your next steps, review your roadmap, or brainstorm solutions together.',
        slug: '60min',
        duration: 60,
        color: '#ec4899',
        location_type: 'video',
        location: 'Zoom Meeting',
        buffer_time_before: 10,
        buffer_time_after: 15,
        requires_confirmation: true,
        custom_questions: JSON.stringify([
          { id: 'q1', label: 'What are you hoping to achieve from this call?', type: 'textarea', required: true },
          { id: 'q2', label: 'Company name', type: 'text', required: false },
          { id: 'q3', label: 'How did you hear about me?', type: 'select', options: ['Twitter', 'LinkedIn', 'Referral', 'Other'], required: false }
        ])
      },
      {
        id: uuidv4(),
        title: 'Coffee Chat',
        description: 'A casual, informal chat to get to know each other. No agenda required!',
        slug: 'coffee-chat',
        duration: 20,
        color: '#f59e0b',
        location_type: 'phone',
        location: 'Phone Call',
        buffer_time_after: 5,
        custom_questions: JSON.stringify([])
      }
    ];

    for (const et of eventTypes) {
      await client.query(`
        INSERT INTO event_types (id, user_id, title, description, slug, duration, color, location_type, location, buffer_time_before, buffer_time_after, requires_confirmation, custom_questions, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        et.id, userId, et.title, et.description, et.slug, et.duration,
        et.color, et.location_type, et.location,
        et.buffer_time_before || 0, et.buffer_time_after || 0,
        et.requires_confirmation || false,
        et.custom_questions, true
      ]);

      // Link event type to schedule
      await client.query(`
        INSERT INTO event_type_schedules (event_type_id, schedule_id) VALUES ($1, $2)
      `, [et.id, scheduleId]);
    }

    // Create sample bookings
    const now = new Date();
    const eventTypeIds = eventTypes.map(e => e.id);

    const sampleBookings = [
      {
        eventTypeId: eventTypeIds[0],
        startOffset: 2, // days from now
        startHour: 10,
        bookerName: 'Sarah Chen',
        bookerEmail: 'sarah.chen@example.com',
        status: 'confirmed'
      },
      {
        eventTypeId: eventTypeIds[1],
        startOffset: 3,
        startHour: 14,
        bookerName: 'Marcus Williams',
        bookerEmail: 'marcus.w@example.com',
        status: 'confirmed'
      },
      {
        eventTypeId: eventTypeIds[2],
        startOffset: 5,
        startHour: 11,
        bookerName: 'Priya Sharma',
        bookerEmail: 'priya.sharma@company.io',
        status: 'confirmed'
      },
      {
        eventTypeId: eventTypeIds[3],
        startOffset: 7,
        startHour: 15,
        bookerName: 'Jordan Lee',
        bookerEmail: 'jordan.lee@startup.co',
        status: 'confirmed'
      },
      // Past bookings
      {
        eventTypeId: eventTypeIds[0],
        startOffset: -3,
        startHour: 9,
        bookerName: 'Emma Thompson',
        bookerEmail: 'emma.t@design.studio',
        status: 'confirmed'
      },
      {
        eventTypeId: eventTypeIds[1],
        startOffset: -7,
        startHour: 13,
        bookerName: 'David Park',
        bookerEmail: 'david@techco.com',
        status: 'confirmed'
      },
      {
        eventTypeId: eventTypeIds[2],
        startOffset: -10,
        startHour: 10,
        bookerName: 'Olivia Martinez',
        bookerEmail: 'olivia.m@ventures.vc',
        status: 'cancelled'
      }
    ];

    for (const booking of sampleBookings) {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() + booking.startOffset);
      startDate.setHours(booking.startHour, 0, 0, 0);

      const eventType = eventTypes.find(e => e.id === booking.eventTypeId);
      const endDate = new Date(startDate.getTime() + eventType.duration * 60000);

      await client.query(`
        INSERT INTO bookings (id, event_type_id, uid, title, start_time, end_time, booker_name, booker_email, status, location)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        uuidv4(), booking.eventTypeId,
        `booking-${uuidv4().substring(0, 8)}`,
        `${eventType.title} with ${booking.bookerName}`,
        startDate.toISOString(), endDate.toISOString(),
        booking.bookerName, booking.bookerEmail,
        booking.status, eventType.location
      ]);
    }

    // Add a date override (block next Monday)
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7));
    await client.query(`
      INSERT INTO date_overrides (id, schedule_id, date, is_blocked)
      VALUES ($1, $2, $3, $4)
    `, [uuidv4(), scheduleId, nextMonday.toISOString().split('T')[0], true]);

    await client.query('COMMIT');
    console.log('✅ Seed data inserted successfully');
    console.log(`   👤 User: alex@calclone.com`);
    console.log(`   📅 ${eventTypes.length} event types created`);
    console.log(`   📋 ${sampleBookings.length} sample bookings created`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
