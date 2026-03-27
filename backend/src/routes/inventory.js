// ============================================================
// inventory.js — Express routes for Staff Inventory Management
// ============================================================

const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/inventoryController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// All routes require a valid JWT
router.use(authMiddleware);

// ──────────────────────────────────────────────────────────────
// POST /api/inventory/add-item
// Accessible by: any authenticated staff member
// ──────────────────────────────────────────────────────────────
router.post('/add-item', inventoryController.addItem);

// ──────────────────────────────────────────────────────────────
// GET /api/inventory/staff/:staff_id
// Staff: only sees own items (enforced in controller + RLS)
// Admin: can pass any staff_id or the keyword "all"
// ──────────────────────────────────────────────────────────────
router.get('/staff/:staff_id', inventoryController.getByStaff);

// ──────────────────────────────────────────────────────────────
// PUT /api/inventory/update-stock/:id
// Accessible by: authenticated staff (RLS prevents cross-staff edits)
// ──────────────────────────────────────────────────────────────
router.put('/update-stock/:id', inventoryController.updateStock);

// ──────────────────────────────────────────────────────────────
// GET /api/inventory/low-stock/:staff_id
// Returns only LOW_STOCK items, sorted by most critical first
// Admin: pass staff_id or "all"
// ──────────────────────────────────────────────────────────────
router.get('/low-stock/:staff_id', inventoryController.getLowStock);

module.exports = router;
