const pool = require('../db/pool');

// Get default user (simulating logged-in user)
const getUser = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No user found' });
    }
    const user = result.rows[0];
    delete user.password;
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, bio, timezone, avatar_url } = req.body;
    const result = await pool.query(
      `UPDATE users SET name=$1, bio=$2, timezone=$3, avatar_url=$4, updated_at=NOW()
       WHERE id=(SELECT id FROM users LIMIT 1) RETURNING *`,
      [name, bio, timezone, avatar_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getUser, updateUser };
