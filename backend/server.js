require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Basic Route for Health Check
app.get('/', (req, res) => {
  res.json({ message: 'Delivery CRM API v2.0 is running' });
});

// Import Routes
const authRoutes = require('./src/routes/auth');
const deliveryRoutes = require('./src/routes/deliveries');
const userRoutes = require('./src/routes/users');
const inventoryRoutes = require('./src/routes/inventory');

app.use('/api/auth', authRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
