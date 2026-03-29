const pool = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

const getSchedules = async (req, res) => {
  try {
    const user = await pool.query('SELECT id FROM users LIMIT 1');
    const userId = user.rows[0].id;

    const schedules = await pool.query(
      'SELECT * FROM availability_schedules WHERE user_id=$1 ORDER BY is_default DESC, created_at ASC',
      [userId]
    );

    // Get rules for each schedule
    const result = [];
    for (const schedule of schedules.rows) {
      const rules = await pool.query(
        'SELECT * FROM availability_rules WHERE schedule_id=$1 ORDER BY day_of_week ASC',
        [schedule.id]
      );
      const overrides = await pool.query(
        'SELECT * FROM date_overrides WHERE schedule_id=$1 ORDER BY date ASC',
        [schedule.id]
      );
      result.push({ ...schedule, rules: rules.rows, overrides: overrides.rows });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSchedule = async (req, res) => {
  try {
    const schedule = await pool.query('SELECT * FROM availability_schedules WHERE id=$1', [req.params.id]);
    if (schedule.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const rules = await pool.query(
      'SELECT * FROM availability_rules WHERE schedule_id=$1 ORDER BY day_of_week ASC',
      [req.params.id]
    );
    const overrides = await pool.query(
      'SELECT * FROM date_overrides WHERE schedule_id=$1 ORDER BY date ASC',
      [req.params.id]
    );
    res.json({ ...schedule.rows[0], rules: rules.rows, overrides: overrides.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createSchedule = async (req, res) => {
  try {
    const user = await pool.query('SELECT id FROM users LIMIT 1');
    const userId = user.rows[0].id;
    const { name, timezone, rules } = req.body;
    const id = uuidv4();

    await pool.query(
      'INSERT INTO availability_schedules (id, user_id, name, timezone) VALUES ($1,$2,$3,$4)',
      [id, userId, name || 'My Schedule', timezone || 'UTC']
    );

    if (rules && rules.length > 0) {
      for (const rule of rules) {
        await pool.query(
          'INSERT INTO availability_rules (id, schedule_id, day_of_week, start_time, end_time, is_available) VALUES ($1,$2,$3,$4,$5,$6)',
          [uuidv4(), id, rule.day_of_week, rule.start_time, rule.end_time, rule.is_available !== false]
        );
      }
    }

    const result = await pool.query('SELECT * FROM availability_schedules WHERE id=$1', [id]);
    const newRules = await pool.query('SELECT * FROM availability_rules WHERE schedule_id=$1', [id]);
    res.status(201).json({ ...result.rows[0], rules: newRules.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { name, timezone, rules } = req.body;
    const scheduleId = req.params.id;

    await pool.query(
      'UPDATE availability_schedules SET name=COALESCE($1,name), timezone=COALESCE($2,timezone), updated_at=NOW() WHERE id=$3',
      [name, timezone, scheduleId]
    );

    if (rules && rules.length > 0) {
      await pool.query('DELETE FROM availability_rules WHERE schedule_id=$1', [scheduleId]);
      for (const rule of rules) {
        await pool.query(
          'INSERT INTO availability_rules (id, schedule_id, day_of_week, start_time, end_time, is_available) VALUES ($1,$2,$3,$4,$5,$6)',
          [uuidv4(), scheduleId, rule.day_of_week, rule.start_time, rule.end_time, rule.is_available !== false]
        );
      }
    }

    const schedule = await pool.query('SELECT * FROM availability_schedules WHERE id=$1', [scheduleId]);
    const newRules = await pool.query('SELECT * FROM availability_rules WHERE schedule_id=$1 ORDER BY day_of_week', [scheduleId]);
    const overrides = await pool.query('SELECT * FROM date_overrides WHERE schedule_id=$1', [scheduleId]);
    res.json({ ...schedule.rows[0], rules: newRules.rows, overrides: overrides.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addDateOverride = async (req, res) => {
  try {
    const { date, is_blocked, start_time, end_time } = req.body;
    const scheduleId = req.params.id;
    const id = uuidv4();

    // Remove existing override for this date
    await pool.query('DELETE FROM date_overrides WHERE schedule_id=$1 AND date=$2', [scheduleId, date]);

    await pool.query(
      'INSERT INTO date_overrides (id, schedule_id, date, is_blocked, start_time, end_time) VALUES ($1,$2,$3,$4,$5,$6)',
      [id, scheduleId, date, is_blocked || false, start_time || null, end_time || null]
    );

    const result = await pool.query('SELECT * FROM date_overrides WHERE id=$1', [id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteDateOverride = async (req, res) => {
  try {
    await pool.query('DELETE FROM date_overrides WHERE id=$1', [req.params.overrideId]);
    res.json({ message: 'Override deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getSchedules, getSchedule, createSchedule, updateSchedule, addDateOverride, deleteDateOverride };
