const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Users table (default admin user)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        bio TEXT,
        avatar_url TEXT,
        timezone VARCHAR(100) DEFAULT 'UTC',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Event types table
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        slug VARCHAR(255) NOT NULL,
        duration INTEGER NOT NULL DEFAULT 30,
        color VARCHAR(20) DEFAULT '#6366f1',
        location VARCHAR(500),
        location_type VARCHAR(50) DEFAULT 'video',
        buffer_time_before INTEGER DEFAULT 0,
        buffer_time_after INTEGER DEFAULT 0,
        min_booking_notice INTEGER DEFAULT 60,
        max_booking_days INTEGER DEFAULT 60,
        is_active BOOLEAN DEFAULT true,
        requires_confirmation BOOLEAN DEFAULT false,
        custom_questions JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, slug)
      )
    `);

    // Availability schedules
    await client.query(`
      CREATE TABLE IF NOT EXISTS availability_schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL DEFAULT 'Working Hours',
        timezone VARCHAR(100) DEFAULT 'UTC',
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Availability rules (days & hours per schedule)
    await client.query(`
      CREATE TABLE IF NOT EXISTS availability_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        schedule_id UUID NOT NULL REFERENCES availability_schedules(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Date overrides (block dates or set custom hours)
    await client.query(`
      CREATE TABLE IF NOT EXISTS date_overrides (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        schedule_id UUID NOT NULL REFERENCES availability_schedules(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        is_blocked BOOLEAN DEFAULT false,
        start_time TIME,
        end_time TIME,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Link event types to availability schedules
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_type_schedules (
        event_type_id UUID REFERENCES event_types(id) ON DELETE CASCADE,
        schedule_id UUID REFERENCES availability_schedules(id) ON DELETE CASCADE,
        PRIMARY KEY (event_type_id, schedule_id)
      )
    `);

    // Bookings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
        uid VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE NOT NULL,
        booker_name VARCHAR(255) NOT NULL,
        booker_email VARCHAR(255) NOT NULL,
        booker_phone VARCHAR(50),
        status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'pending', 'rescheduled')),
        cancellation_reason TEXT,
        location VARCHAR(500),
        meeting_url TEXT,
        custom_answers JSONB DEFAULT '{}',
        reschedule_from UUID REFERENCES bookings(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Indexes for performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_event_type ON bookings(event_type_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_booker_email ON bookings(booker_email)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_event_types_user ON event_types(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_event_types_slug ON event_types(slug)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_availability_rules_schedule ON availability_rules(schedule_id)`);

    await client.query('COMMIT');
    console.log('✅ All tables created successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

createTables();
