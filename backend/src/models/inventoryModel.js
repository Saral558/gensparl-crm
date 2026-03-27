// ============================================================
// inventoryModel.js — Supabase data layer for staff_inventory
// ============================================================

const { createClient } = require('@supabase/supabase-js');

// Use Service Role Key so admin endpoints bypass RLS
const adminSupabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Staff client: uses the user's JWT so RLS enforces ownership automatically
function staffClient(token) {
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } }
    });
}

// ── Sort helper: LOW_STOCK first, then newest updated_at
const SORT = { column: 'updated_at', ascending: false };

/**
 * Add a new inventory item.
 * Status is auto-computed by the DB trigger (no need to pass it).
 */
async function addItem(data, token) {
    const client = staffClient(token);
    const { data: row, error } = await client
        .from('staff_inventory')
        .insert([{
            item_name:     data.item_name,
            buying_price:  data.buying_price,
            selling_price: data.selling_price ?? null,
            stock_quantity: data.stock_quantity,
            category:      data.category ?? null,
            staff_id:      data.staff_id
            // status is computed by DB trigger
        }])
        .select()
        .single();

    if (error) throw error;
    return row;
}

/**
 * Fetch all items for a specific staff member.
 * Sorted: LOW_STOCK first, then latest updated.
 */
async function getByStaff(staff_id, isAdmin, token) {
    const client = isAdmin ? adminSupabase : staffClient(token);

    let query = client
        .from('staff_inventory')
        .select('*')
        .order('status', { ascending: true })   // LOW_STOCK < NORMAL alphabetically
        .order('updated_at', { ascending: false });

    if (!isAdmin) {
        query = query.eq('staff_id', staff_id);
    } else {
        // Admin explicitly passes staff_id, or pass 'all' to see everyone
        if (staff_id !== 'all') {
            query = query.eq('staff_id', staff_id);
        }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

/**
 * Update stock quantity for one item.
 * DB trigger auto-recalculates status.
 */
async function updateStock(id, stock_quantity, token) {
    const client = staffClient(token);
    const { data: row, error } = await client
        .from('staff_inventory')
        .update({ stock_quantity })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return row;
}

/**
 * Get only LOW_STOCK items for a staff member.
 */
async function getLowStock(staff_id, isAdmin, token) {
    const client = isAdmin ? adminSupabase : staffClient(token);

    let query = client
        .from('staff_inventory')
        .select('*')
        .eq('status', 'LOW_STOCK')
        .order('stock_quantity', { ascending: true });   // most critical first

    if (!isAdmin || staff_id !== 'all') {
        query = query.eq('staff_id', staff_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

module.exports = { addItem, getByStaff, updateStock, getLowStock };
