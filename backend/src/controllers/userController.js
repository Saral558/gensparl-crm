const bcrypt = require('bcryptjs');
const db = require('../models/db');

exports.getAllUsers = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role, created_at FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, password } = req.body;
  try {
    let query = 'UPDATE users SET name=$1, email=$2, role=$3';
    let params = [name, email, role, id];
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password=$4 WHERE id=$5';
      params = [name, email, role, hashedPassword, id];
    } else {
      query += ' WHERE id=$4';
    }
    
    const result = await db.query(query + ' RETURNING id, name, email, role', params);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
