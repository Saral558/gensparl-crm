// ============================================================
// UTILS.JS — Core utility functions
// ============================================================

// Indian currency formatter
window.formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

// Format date
window.formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Format datetime
window.formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });
};

// Today's date string
window.todayStr = () => new Date().toISOString().split('T')[0];

// Generate UUID
window.genId = () => 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

// Get days ago date
window.daysAgo = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
};

// ============================================================
// LOCAL STORAGE DB
// ============================================================

// ============================================================
// DATA LAYER (SUPABASE)
// ============================================================

window.db = {
    get: async (table) => {
        const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
        if (error) { console.error(`Error fetching ${table}:`, error); return []; }
        return data || [];
    },
    set: async (table, data) => {
        // If data is an array, we clean each item
        const cleanData = Array.isArray(data) ? data.map(item => {
            const { id, ...rest } = item;
            // Only keep ID if it looks like a UUID
            if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
                return { id, ...rest };
            }
            return rest;
        }) : data;

        const { error } = await supabase.from(table).upsert(cleanData);
        if (error) console.error(`Error setting ${table}:`, error);
    },
    getOne: async (key) => {
        // For single-value keys (like opening balance), we use a settings table or similar.
        // For now, we'll keep using localStorage for purely local UI settings.
        try {
            return JSON.parse(localStorage.getItem('crm_' + key) || 'null');
        } catch { return null; }
    },
    setOne: async (key, data) => {
        localStorage.setItem('crm_' + key, JSON.stringify(data));
    },

    // CRUD operations
    insert: async (table, record) => {
        // Remove local id if present to let Supabase generate UUID
        const { id, ...cleanRecord } = record;
        const { data, error } = await supabase.from(table).insert([cleanRecord]).select().single();
        if (error) { console.error(`Error inserting into ${table}:`, error); throw error; }
        return data;
    },
    update: async (table, id, updates) => {
        const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single();
        if (error) { console.error(`Error updating ${table}:`, error); throw error; }
        return data;
    },
    delete: async (table, id) => {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) { console.error(`Error deleting from ${table}:`, error); throw error; }
    },
    find: async (table, filterFn) => {
        // Fetch all and filter locally (not ideal, but compatible with existing logic)
        const all = await window.db.get(table);
        return all.filter(filterFn);
    }
};

// ============================================================
// ANALYTICS HELPERS
// ============================================================

window.getDateRange = (filter) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
        case 'today':
            return { start: today, end: new Date() };
        case 'week': {
            const start = new Date(today);
            start.setDate(start.getDate() - 7);
            return { start, end: new Date() };
        }
        case 'month': {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            return { start, end: new Date() };
        }
        default:
            return { start: new Date(0), end: new Date() };
    }
};

window.filterByDateRange = (records, dateField, startDate, endDate) => {
    return records.filter(r => {
        const d = new Date(r[dateField]);
        return d >= startDate && d <= endDate;
    });
};

// Payment mode colors
window.paymentColors = {
    'Cash': '#10B981',
    'UPI': '#3B82F6',
    'Card': '#8B5CF6',
    'Finance': '#F59E0B',
};

// Status colors
window.statusColors = {
    'Pending': '#F59E0B',
    'In Progress': '#3B82F6',
    'Done': '#10B981',
    'Approved': '#10B981',
    'Rejected': '#EF4444',
    'Scheduled': '#3B82F6',
    'Out for Delivery': '#8B5CF6',
    'Delivered': '#10B981',
    'Failed': '#EF4444',
    'Rescheduled': '#F59E0B',
};

window.getStatusBadge = (status) => {
    const colorMap = {
        'Pending': 'bg-amber-100 text-amber-800',
        'In Progress': 'bg-blue-100 text-blue-800',
        'Done': 'bg-green-100 text-green-800',
        'Approved': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800',
        'Scheduled': 'bg-blue-100 text-blue-800',
        'Out for Delivery': 'bg-purple-100 text-purple-800',
        'Delivered': 'bg-green-100 text-green-800',
        'Failed': 'bg-red-100 text-red-800',
        'Rescheduled': 'bg-orange-100 text-orange-800',
        'Credit': 'bg-green-100 text-green-800',
        'Debit': 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
};

window.getPaymentBadge = (mode) => {
    const colorMap = {
        'Cash': 'bg-green-100 text-green-800',
        'UPI': 'bg-blue-100 text-blue-800',
        'Card': 'bg-purple-100 text-purple-800',
        'Finance': 'bg-amber-100 text-amber-800',
    };
    return colorMap[mode] || 'bg-gray-100 text-gray-800';
};

// Deep clone
window.clone = (obj) => JSON.parse(JSON.stringify(obj));

// Truncate text
window.truncate = (str, len = 30) => str && str.length > len ? str.slice(0, len) + '...' : str;
