// ============================================================
// ADMIN MASTER DASHBOARD
// ============================================================

window.Dashboard = () => {
    const { navigate } = useNav();
    const [dateFilter, setDateFilter] = React.useState('today');
    const [loading, setLoading] = React.useState(true);
    const [data, setData] = React.useState({ sales: [], service: [], deliveries: [], finance: [], expenses: [] });

    React.useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            try {
                // Fetch all CRM records from the universal customers table
                const customers = await db.get('customers');
                
                // Partition data for different components
                const sales = customers.filter(c => !c.type || c.type === 'Sale');
                const service = customers.filter(c => c.type === 'Service' || c.type === 'Demo');
                const deliveries = customers.filter(c => c.status && ['Scheduled', 'Out for Delivery', 'Delivered', 'Failed', 'Rescheduled'].includes(c.status));
                const finance = customers.filter(c => c.status === 'Finance' || (c.product_details && c.product_details.toLowerCase().includes('finance')));
                
                // Fetch expenses (if table exists, otherwise empty)
                let expenses = [];
                try { expenses = await db.get('expenses'); } catch(e) { console.warn('Expenses table not yet created'); }

                setData({ sales, service, deliveries, finance, expenses });
            } finally {
                setLoading(false);
            }
        };
        loadAll();
    }, []);

    const { sales: allSales, service: allService, deliveries: allDeliveries, finance: allFinance, expenses: allExpenses } = data;
    if (loading) return React.createElement('div', { className: 'p-8 text-center' }, 'Loading dashboard data...');

    const today = todayStr();

    // Date range
    const { start, end } = getDateRange(dateFilter);

    // Filtered sales
    const filteredSales = filterByDateRange(allSales, 'created_at', start, end);

    // Today's sales
    const todaySales = allSales.filter(s => s.created_at.startsWith(today));
    const todayRevenue = todaySales.reduce((sum, s) => sum + (s.amount || 0), 0);
    const todayQty = todaySales.reduce((sum, s) => sum + (s.quantity || 0), 0);

    // Service stats
    const pendingServices = allService.filter(s => s.status === 'Pending' || s.status === 'In Progress');
    const overdueServices = allService.filter(s => {
        if (s.status === 'Done') return false;
        const created = new Date(s.created_at);
        const diffDays = (new Date() - created) / (1000 * 60 * 60 * 24);
        return diffDays > 2;
    });

    // Delivery stats
    const todayDeliveries = allDeliveries.filter(d => d.delivery_date === today);
    const overdueDeliveries = allDeliveries.filter(d =>
        d.delivery_date < today && d.status !== 'Delivered' && d.status !== 'Failed'
    );

    // Finance stats
    const todayFinance = allFinance.filter(f => f.created_at.startsWith(today));
    const todayDisbursed = todayFinance.reduce((sum, f) => sum + (f.disbursement || 0), 0);
    const pendingFinance = allFinance.filter(f => f.status === 'Pending');

    // Expenses today
    const todayExpenses = allExpenses.filter(e => e.created_at.startsWith(today));
    const todayDebits = todayExpenses.filter(e => e.type === 'Debit').reduce((s, e) => s + e.amount, 0);
    const todayCredits = todayExpenses.filter(e => e.type === 'Credit').reduce((s, e) => s + e.amount, 0);

    // Salesboy leaderboard (today)
    const salesbyLeader = {};
    todaySales.forEach(s => {
        if (!salesbyLeader[s.salesboy_name]) salesbyLeader[s.salesboy_name] = { name: s.salesboy_name, amount: 0, count: 0 };
        salesbyLeader[s.salesboy_name].amount += s.amount || 0;
        salesbyLeader[s.salesboy_name].count += 1;
    });
    const leaderboard = Object.values(salesbyLeader).sort((a, b) => b.amount - a.amount);

    // Payment mode split (filtered)
    const paymentSplit = {};
    filteredSales.forEach(s => {
        paymentSplit[s.payment_mode] = (paymentSplit[s.payment_mode] || 0) + (s.amount || 0);
    });
    const paymentPieData = Object.entries(paymentSplit).map(([name, value]) => ({
        name, value, color: paymentColors[name] || '#94A3B8'
    }));

    // Last 7 days sales trend
    const trendData = Array.from({ length: 7 }, (_, i) => {
        const d = daysAgo(6 - i);
        const daySales = allSales.filter(s => s.created_at.startsWith(d));
        return {
            date: new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
            Sales: daySales.reduce((sum, s) => sum + (s.amount || 0), 0),
            Count: daySales.length
        };
    });

    // Salesboy bar chart data
    const salesboyChartData = leaderboard.slice(0, 5).map(s => ({
        name: s.name.split(' ')[0],
        'Revenue (₹)': s.amount,
        'Sales': s.count
    }));

    // Recent sales (last 8)
    const recentSales = [...allSales].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8);

    const maxAmount = Math.max(...leaderboard.map(l => l.amount), 1);

    return React.createElement('div', { className: 'fade-in' },
        // Date filter
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 } },
            React.createElement('div', null,
                React.createElement('h2', { style: { fontSize: 22, fontWeight: 700, fontFamily: 'Poppins' } }, '📊 Dashboard'),
                React.createElement('p', { style: { color: '#64748B', fontSize: 13 } },
                    new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                )
            ),
            React.createElement(DateFilterTabs, { active: dateFilter, onChange: setDateFilter })
        ),

        // Top 4 stat cards
        React.createElement('div', {
            style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }
        },
            React.createElement(StatCard, {
                icon: '💰', label: "Today's Sales", value: formatCurrency(todayRevenue),
                sub: `${todayQty} items • ${todaySales.length} transactions`,
                color: 'amber', onClick: () => navigate('sales')
            }),
            React.createElement(StatCard, {
                icon: '🔧', label: 'Pending Services', value: pendingServices.length,
                sub: overdueServices.length > 0 ? `⚠️ ${overdueServices.length} overdue (>2 days)` : 'All on track',
                color: pendingServices.length > 0 ? 'red' : 'green', onClick: () => navigate('service')
            }),
            React.createElement(StatCard, {
                icon: '🚚', label: "Today's Deliveries", value: todayDeliveries.length,
                sub: overdueDeliveries.length > 0 ? `🔴 ${overdueDeliveries.length} overdue` : `${todayDeliveries.filter(d => d.status === 'Delivered').length} delivered`,
                color: 'blue', onClick: () => navigate('delivery')
            }),
            React.createElement(StatCard, {
                icon: '💳', label: 'Finance Disbursed', value: formatCurrency(todayDisbursed),
                sub: `${pendingFinance.length} approval${pendingFinance.length !== 1 ? 's' : ''} pending`,
                color: 'purple', onClick: () => navigate('finance')
            })
        ),

        // Row 2: Leaderboard + Payment Split
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 } },
            // Salesboy Leaderboard
            React.createElement(Card, null,
                React.createElement('div', { style: { marginBottom: 16 } },
                    React.createElement('h3', { style: { fontSize: 16, fontWeight: 700 } }, '🏆 Salesboy Leaderboard'),
                    React.createElement('p', { style: { fontSize: 12, color: '#64748B' } }, 'Today\'s performance')
                ),
                leaderboard.length === 0 ? React.createElement('p', { style: { color: '#94A3B8', fontSize: 13, textAlign: 'center', padding: 20 } }, 'No sales today') :
                    React.createElement('div', null,
                        leaderboard.map((s, i) =>
                            React.createElement('div', { key: s.name, style: { marginBottom: 14 } },
                                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 5 } },
                                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                                        React.createElement('span', {
                                            style: {
                                                width: 22, height: 22, background: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : '#CD7F32',
                                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 10, fontWeight: 700, color: '#fff'
                                            }
                                        }, i + 1),
                                        React.createElement('span', { style: { fontSize: 13, fontWeight: 600 } }, s.name)
                                    ),
                                    React.createElement('div', { style: { textAlign: 'right' } },
                                        React.createElement('div', { className: 'mono', style: { fontSize: 13, fontWeight: 700, color: '#10B981' } }, formatCurrency(s.amount)),
                                        React.createElement('div', { style: { fontSize: 11, color: '#94A3B8' } }, `${s.count} sale${s.count !== 1 ? 's' : ''}`)
                                    )
                                ),
                                React.createElement(ProgressBar, { value: s.amount, max: maxAmount, color: i === 0 ? '#F59E0B' : '#1A1F36' })
                            )
                        )
                    )
            ),

            // Payment Mode Split  
            React.createElement(Card, null,
                React.createElement('h3', { style: { fontSize: 16, fontWeight: 700, marginBottom: 4 } }, '💳 Payment Mode Split'),
                React.createElement('p', { style: { fontSize: 12, color: '#64748B', marginBottom: 16 } },
                    dateFilter === 'today' ? "Today's breakdown" : `${dateFilter} breakdown`
                ),
                paymentPieData.length === 0
                    ? React.createElement('p', { style: { color: '#94A3B8', fontSize: 13, textAlign: 'center', padding: 20 } }, 'No data')
                    : React.createElement(CRMPieChart, { data: paymentPieData, height: 220, donut: true })
            )
        ),

        // Row 3: Sales Trend + Pending Alerts
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 } },
            // Sales trend chart
            React.createElement(Card, null,
                React.createElement('h3', { style: { fontSize: 16, fontWeight: 700, marginBottom: 16 } }, '📈 Sales Trend — Last 7 Days'),
                React.createElement(CRMLineChart, {
                    data: trendData, xKey: 'date',
                    lines: [{ key: 'Sales', name: 'Revenue (₹)', color: '#1A1F36' }],
                    height: 240, isCurrency: true, area: true
                })
            ),

            // Pending Alerts
            React.createElement(Card, null,
                React.createElement('h3', { style: { fontSize: 16, fontWeight: 700, marginBottom: 16 } }, '🔔 Pending Alerts'),

                // Overdue deliveries
                overdueDeliveries.length > 0 && React.createElement(AlertBox, { type: 'danger' },
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontWeight: 600, fontSize: 13 } },
                            `🚚 ${overdueDeliveries.length} Overdue Deliveries`
                        ),
                        ...overdueDeliveries.slice(0, 2).map(d =>
                            React.createElement('div', { key: d.id, style: { fontSize: 11, marginTop: 3, opacity: 0.8 } },
                                `• ${d.customer_name} — ${formatDate(d.delivery_date)}`
                            )
                        )
                    )
                ),

                // Service overdue
                overdueServices.length > 0 && React.createElement(AlertBox, { type: 'warning' },
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontWeight: 600, fontSize: 13 } },
                            `🔧 ${overdueServices.length} Service Pending >2 Days`
                        ),
                        ...overdueServices.slice(0, 2).map(s =>
                            React.createElement('div', { key: s.id, style: { fontSize: 11, marginTop: 3, opacity: 0.8 } },
                                `• ${s.customer_name} — ${s.product_name}`
                            )
                        )
                    )
                ),

                // Finance pending
                pendingFinance.length > 0 && React.createElement(AlertBox, { type: 'success' },
                    React.createElement('div', { style: { fontWeight: 600, fontSize: 13 } },
                        `💳 ${pendingFinance.length} Finance Approval Pending`
                    )
                ),

                // Expenses summary
                React.createElement('div', {
                    style: { marginTop: 12, padding: '12px', background: '#F8FAFC', borderRadius: 8 }
                },
                    React.createElement('div', { style: { fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8 } }, "Today's Cash Flow"),
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between' } },
                        React.createElement('span', { style: { color: '#10B981', fontWeight: 600, fontSize: 13 } }, `+${formatCurrency(todayCredits)}`),
                        React.createElement('span', { style: { color: '#EF4444', fontWeight: 600, fontSize: 13 } }, `-${formatCurrency(todayDebits)}`)
                    )
                ),

                overdueDeliveries.length === 0 && overdueServices.length === 0 && pendingFinance.length === 0 &&
                React.createElement('div', { style: { textAlign: 'center', padding: '20px 0', color: '#94A3B8', fontSize: 13 } },
                    '✅ All clear! No pending alerts.'
                )
            )
        ),

        // Row 4: Recent Sales
        React.createElement(Card, null,
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
                React.createElement('h3', { style: { fontSize: 16, fontWeight: 700 } }, '🛒 Recent Sales'),
                React.createElement('button', { className: 'btn btn-sm btn-outline', onClick: () => navigate('sales') }, 'View All →')
            ),
            React.createElement('div', { style: { overflowX: 'auto' } },
                React.createElement('table', { className: 'data-table' },
                    React.createElement('thead', null,
                        React.createElement('tr', null,
                            ['Customer', 'Product', 'Amount', 'Payment', 'Salesboy', 'Time'].map(h =>
                                React.createElement('th', { key: h }, h)
                            )
                        )
                    ),
                    React.createElement('tbody', null,
                        recentSales.map(s =>
                            React.createElement('tr', { key: s.id },
                                React.createElement('td', null,
                                    React.createElement('div', { style: { fontWeight: 600 } }, s.customer_name),
                                    React.createElement('div', { style: { fontSize: 11, color: '#94A3B8' } }, s.mobile)
                                ),
                                React.createElement('td', null, truncate(s.product_name, 25)),
                                React.createElement('td', null,
                                    React.createElement('span', { className: 'mono', style: { fontWeight: 700, color: '#10B981' } }, formatCurrency(s.amount))
                                ),
                                React.createElement('td', null, React.createElement(PaymentBadge, { mode: s.payment_mode })),
                                React.createElement('td', null, s.salesboy_name),
                                React.createElement('td', null,
                                    React.createElement('span', { style: { fontSize: 12, color: '#64748B' } },
                                        formatDateTime(s.created_at)
                                    )
                                )
                            )
                        )
                    )
                )
            )
        )
    );
};
