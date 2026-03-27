const db = require('../models/db');

exports.getAllDeliveries = async (req, res) => {
  try {
    let query = 'SELECT * FROM deliveries';
    let params = [];
    
    // Role-based filtering
    if (req.user.role === 'staff') {
      query += ' WHERE created_by = $1';
      params.push(req.user.id);
    }
    
    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createDelivery = async (req, res) => {
  const { customer_name, mobile_no, location, delivery_date, product_details, status } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO deliveries (customer_name, mobile_no, location, delivery_date, product_details, status, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [customer_name, mobile_no, location, delivery_date, product_details, status || 'pending', req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDelivery = async (req, res) => {
  const { id } = req.params;
  const { customer_name, mobile_no, location, delivery_date, product_details, status } = req.body;
  try {
    // Verify ownership or check if admin
    const check = await db.query('SELECT created_by FROM deliveries WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Delivery not found' });
    
    if (req.user.role === 'staff' && check.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(
      'UPDATE deliveries SET customer_name=$1, mobile_no=$2, location=$3, delivery_date=$4, product_details=$5, status=$6 WHERE id=$7 RETURNING *',
      [customer_name, mobile_no, location, delivery_date, product_details, status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDelivery = async (req, res) => {
  const { id } = req.params;
  try {
    const check = await db.query('SELECT created_by FROM deliveries WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Delivery not found' });

    if (req.user.role === 'staff' && check.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await db.query('DELETE FROM deliveries WHERE id = $1', [id]);
    res.json({ message: 'Delivery deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
