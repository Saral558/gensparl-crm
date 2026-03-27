// ============================================================
// inventoryController.js — Business logic for inventory routes
// ============================================================

const InventoryModel = require('../models/inventoryModel');

/**
 * Helper: attach low_stock flag + message to each item.
 */
function annotate(items) {
    return items.map(item => ({
        ...item,
        low_stock: item.stock_quantity < 20,
        alert_message: item.stock_quantity < 20 ? 'Low Stock — Refill Required' : null
    }));
}

// ──────────────────────────────────────────────────────────────
// POST /api/inventory/add-item
// Body: { item_name, buying_price, selling_price?, stock_quantity, category? }
// ──────────────────────────────────────────────────────────────
exports.addItem = async (req, res) => {
    try {
        const { item_name, buying_price, selling_price, stock_quantity, category } = req.body;

        // Validation
        if (!item_name || buying_price == null || stock_quantity == null) {
            return res.status(400).json({
                success: false,
                error: 'item_name, buying_price, and stock_quantity are required.'
            });
        }
        if (stock_quantity < 0) {
            return res.status(400).json({ success: false, error: 'stock_quantity cannot be negative.' });
        }
        if (buying_price < 0 || (selling_price != null && selling_price < 0)) {
            return res.status(400).json({ success: false, error: 'Prices cannot be negative.' });
        }

        const token = req.headers.authorization?.replace('Bearer ', '');
        const staff_id = req.user.id;   // from JWT (set by authMiddleware)

        const item = await InventoryModel.addItem(
            { item_name, buying_price, selling_price, stock_quantity, category, staff_id },
            token
        );

        const [annotated] = annotate([item]);

        return res.status(201).json({
            success: true,
            message: 'Item added successfully.',
            data: annotated,
            low_stock: annotated.low_stock,
            alert_message: annotated.alert_message
        });
    } catch (err) {
        console.error('[addItem]', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
};

// ──────────────────────────────────────────────────────────────
// GET /api/inventory/staff/:staff_id
// Returns all items for staff. Admin can pass any staff_id or 'all'.
// ──────────────────────────────────────────────────────────────
exports.getByStaff = async (req, res) => {
    try {
        const { staff_id } = req.params;
        const isAdmin = req.user.role === 'admin';
        const token = req.headers.authorization?.replace('Bearer ', '');

        // Staff can only fetch their own items
        if (!isAdmin && staff_id !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Access denied.' });
        }

        const items = await InventoryModel.getByStaff(staff_id, isAdmin, token);
        const annotated = annotate(items);
        const lowStockCount = annotated.filter(i => i.low_stock).length;

        return res.json({
            success: true,
            total: annotated.length,
            low_stock_count: lowStockCount,
            data: annotated
        });
    } catch (err) {
        console.error('[getByStaff]', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
};

// ──────────────────────────────────────────────────────────────
// PUT /api/inventory/update-stock/:id
// Body: { stock_quantity }
// ──────────────────────────────────────────────────────────────
exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock_quantity } = req.body;
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (stock_quantity == null || stock_quantity < 0) {
            return res.status(400).json({
                success: false,
                error: 'stock_quantity is required and must be >= 0.'
            });
        }

        // RLS will reject if staff tries to update another person's item
        const updated = await InventoryModel.updateStock(id, stock_quantity, token);
        const [annotated] = annotate([updated]);

        return res.json({
            success: true,
            message: annotated.low_stock
                ? 'Stock updated. ⚠️ Low Stock — Refill Required.'
                : 'Stock updated successfully.',
            data: annotated,
            low_stock: annotated.low_stock,
            alert_message: annotated.alert_message
        });
    } catch (err) {
        console.error('[updateStock]', err.message);
        // Supabase returns no rows when RLS blocks the update
        if (err.code === 'PGRST116') {
            return res.status(403).json({ success: false, error: 'Item not found or access denied.' });
        }
        return res.status(500).json({ success: false, error: err.message });
    }
};

// ──────────────────────────────────────────────────────────────
// GET /api/inventory/low-stock/:staff_id
// Returns only items with stock_quantity < 20.
// ──────────────────────────────────────────────────────────────
exports.getLowStock = async (req, res) => {
    try {
        const { staff_id } = req.params;
        const isAdmin = req.user.role === 'admin';
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!isAdmin && staff_id !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Access denied.' });
        }

        const items = await InventoryModel.getLowStock(staff_id, isAdmin, token);
        const annotated = annotate(items);

        return res.json({
            success: true,
            total_low_stock: annotated.length,
            alert_message: annotated.length > 0
                ? `${annotated.length} item(s) — Low Stock. Refill Required.`
                : 'All items are sufficiently stocked.',
            data: annotated
        });
    } catch (err) {
        console.error('[getLowStock]', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
};
