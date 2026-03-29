/**
 * DATA_MANAGER.JS — Pro Suite Data Layer
 * Refactored to use the global window.supabase client.
 */
const DataManager = {
    _cache: {
        sales: [],
        profiles: [],
        orders: [],
        service: [],
        finance: [],
        expenses: [],
        gifts: []
    },

    async init() {
        try {
            if (window.supabase) {
                console.log("🚀 Pro-DataManager: Supabase Connected");
                await this.refreshAll();
            } else {
                console.error("❌ Pro-DataManager: Supabase Client Missing");
            }
        } catch (e) {
            console.error("❌ Pro-DataManager: Init Failed", e);
        }
    },

    async refreshAll() {
        const client = window.supabase;
        if (!client) return;
        console.log("🔄 Pro-DataManager: Refreshing Cache...");
        try {
            const [s, p, o, sv, f, ex, g] = await Promise.all([
                client.from('sales').select('*').order('created_at', { ascending: false }),
                client.from('profiles').select('*').eq('active', true).order('name'),
                client.from('orders').select('*').order('created_at', { ascending: false }),
                client.from('service').select('*').order('created_at', { ascending: false }),
                client.from('finance').select('*').order('created_at', { ascending: false }),
                client.from('expenses').select('*').order('created_at', { ascending: false }),
                client.from('gifts').select('*').order('created_at', { ascending: false })
            ]);

            this._cache.sales = s.data || [];
            this._cache.profiles = p.data || [];
            this._cache.orders = o.data || [];
            this._cache.service = sv.data || [];
            this._cache.finance = f.data || [];
            this._cache.expenses = ex.data || [];
            this._cache.gifts = g.data || [];
            
            console.log("✅ Pro-DataManager: Cache Updated");
        } catch (e) {
            console.error("❌ Pro-DataManager: Refresh Failed", e);
        }
    },

    getData(key) {
        const map = {
            'sales': 'sales',
            'staff': 'profiles',
            'deliveries': 'orders',
            'service': 'service',
            'finance': 'finance',
            'expenses': 'expenses',
            'gifts': 'gifts',
            'inventory': 'sales' // Using sales products as proxy or separate table if exists
        };
        const cacheKey = map[key] || key;
        return this._cache[cacheKey] || [];
    },

    getStats() {
        const today = new Date().toISOString().split('T')[0];
        const sales = this._cache.sales;
        const totalRevenue = sales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
        const todaySales = sales.filter(s => s.created_at?.startsWith(today)).reduce((sum, s) => sum + Number(s.amount || 0), 0);
        const todayProfit = sales.filter(s => s.created_at?.startsWith(today)).reduce((sum, s) => sum + Number(s.profit_amount || 0), 0);

        return {
            revenue: totalRevenue,
            todayRevenue: todaySales,
            todayProfit: todayProfit,
            salesCount: sales.length,
            staffCount: this._cache.profiles.length,
            deliveryPending: this._cache.orders.filter(d => d.status === 'pending' || d.status === 'assigned').length,
            servicePending: this._cache.service.filter(s => s.status !== 'Done' && s.status !== 'Completed').length,
            financeTotal: this._cache.finance.reduce((sum, f) => sum + Number(f.loan_amount || 0), 0)
        };
    },

    getSalesByStaff() {
        const sales = this._cache.sales;
        const staffMap = {};

        sales.forEach(s => {
            const name = s.staff_name || s.salesboy_name || 'Unknown';
            staffMap[name] = (staffMap[name] || 0) + 1;
        });

        // Convert to arrays for ApexCharts
        return {
            categories: Object.keys(staffMap),
            data: Object.values(staffMap)
        };
    },

    getExpensesByCategory() {
        const expenses = this._cache.expenses;
        const catMap = {};

        expenses.forEach(e => {
            const cat = e.category || 'Other';
            catMap[cat] = (catMap[cat] || 0) + Number(e.amount || 0);
        });

        return {
            categories: Object.keys(catMap),
            data: Object.values(catMap)
        };
    }
};

// Initialized later by app.js to ensure SDK is ready
window.DataManager = DataManager;
