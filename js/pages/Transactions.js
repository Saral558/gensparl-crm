// ============================================================
// TRANSACTIONS MODULE
// ============================================================

window.Transactions = () => {
    const { user, isAdmin } = useAuth();
    const { showToast } = useToast();
    const [tab, setTab] = React.useState('dashboard');
    const [loading, setLoading] = React.useState(true);
    const [allData, setAllData] = React.useState({ transactions: [], sales: [], expenses: [], finance: [] });
    const [dateFilter, setDateFilter] = React.useState('today');
    const [selectedDate, setSelectedDate] = React.useState(todayStr());
    const [showManualEntry, setShowManualEntry] = React.useState(false);
    const [visibleSources, setVisibleSources] = React.useState({ Cash: true, UPI: true, Card: true, Finance: true, Expense: true });
    const [search, setSearch] = React.useState('');

    React.useEffect(() => { loadData(); }, []);
    
    const loadData = async () => {
        setLoading(true);
        try {
            const [transactions, sales, expenses, finance] = await Promise.all([
                db.get('transactions'),
                db.get('sales'),
                db.get('expenses'),
                db.get('finance')
            ]);
            setAllData({ transactions, sales, expenses, finance });
        } finally {
            setLoading(false);
        }
    };

    // Manual entry form
    const [txForm, setTxForm] = React.useState({ source: 'Cash', type: 'Credit', amount: '', narration: '' });

    const saveTx = async () => {
        if (!txForm.amount || parseFloat(txForm.amount) <= 0) { showToast('Enter valid amount', 'error'); return; }
        await db.insert('transactions', {
            ...txForm, amount: parseFloat(txForm.amount),
            added_by_id: user.id, added_by_name: user.name, date: selectedDate
        });
        setTxForm({ source: 'Cash', type: 'Credit', amount: '', narration: '' });
        setShowManualEntry(false);
        await loadData();
        showToast('Transaction added ✅', 'success');
    };

    if (loading) return React.createElement('div', { className: 'p-8 text-center' }, 'Loading transaction data...');

    const { transactions, sales: allSalesAll, expenses: allExpensesAll, finance: allFinanceAll } = allData;

    // Auto-aggregate from CRM data
    const { start, end } = getDateRange(dateFilter);
    const sales = filterByDateRange(allSalesAll, 'created_at', start, end);
    const expenses = filterByDateRange(allExpensesAll, 'created_at', start, end);
    const finance = filterByDateRange(allFinanceAll, 'created_at', start, end);

    // Calculate from CRM
    const cashSales = sales.filter(s => s.payment_mode === 'Cash').reduce((s, r) => s + r.amount, 0);
    const upiSales = sales.filter(s => s.payment_mode === 'UPI').reduce((s, r) => s + r.amount, 0);
    const cardSales = sales.filter(s => s.payment_mode === 'Card').reduce((s, r) => s + r.amount, 0);
    const financeDisb = finance.filter(f => f.status === 'Approved').reduce((s, r) => s + r.disbursement, 0);
    const totalExpenses = expenses.filter(e => e.type === 'Debit').reduce((s, r) => s + r.amount, 0);
    const totalIncomes = expenses.filter(e => e.type === 'Credit').reduce((s, r) => s + r.amount, 0);

    // Manual transactions
    const manualTx = filterByDateRange(transactions, 'created_at', start, end);

    // Summary logic remains same...
    const summary = [
        { source: 'Cash', label: 'Cash Collected', amount: cashSales, type: 'Credit', icon: '💵', color: '#10B981' },
        { source: 'UPI', label: 'UPI / Google Pay', amount: upiSales, type: 'Credit', icon: '📱', color: '#3B82F6' },
        { source: 'Card', label: 'Card / POS', amount: cardSales, type: 'Credit', icon: '💳', color: '#8B5CF6' },
        { source: 'Finance', label: 'Finance Disbursed', amount: financeDisb, type: 'Credit', icon: '🏦', color: '#F59E0B' },
        { source: 'Expense', label: 'Total Expenses', amount: totalExpenses, type: 'Debit', icon: '💸', color: '#EF4444' },
        { source: 'Expense', label: 'Other Income', amount: totalIncomes, type: 'Credit', icon: '⬆️', color: '#10B981' },
    ];

    const activeSummary = summary.filter(s => visibleSources[s.source]);
    const totalInflow = activeSummary.filter(s => s.type === 'Credit').reduce((s, r) => s + r.amount, 0);
    const totalOutflow = activeSummary.filter(s => s.type === 'Debit').reduce((s, r) => s + r.amount, 0);
    const netBalance = totalInflow - totalOutflow;

    // Chart data
    const chartData = activeSummary.map(s => ({ name: s.source, Amount: s.amount, fill: s.color }));

    // Trend (last 7 days)
    const trendData = Array.from({ length: 7 }, (_, i) => {
        const d = daysAgo(6 - i);
        const daySales = allSalesAll.filter(s => s.created_at.startsWith(d));
        const dayExp = allExpensesAll.filter(e => e.created_at.startsWith(d));
        return {
            date: new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
            Inflow: daySales.reduce((s, r) => s + r.amount, 0),
            Outflow: dayExp.filter(e => e.type === 'Debit').reduce((s, r) => s + r.amount, 0),
        };
    });

    // Filter manual tx
    let filteredTx = [...manualTx];
    if (search) filteredTx = filteredTx.filter(t => t.narration?.toLowerCase().includes(search.toLowerCase()) || t.source?.toLowerCase().includes(search.toLowerCase()));

    return React.createElement('div', { className: 'fade-in' },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 } },
            React.createElement('div', null,
                React.createElement('h2', { style: { fontSize: 22, fontWeight: 700, fontFamily: 'Poppins' } }, '💰 Transaction Section'),
                React.createElement('p', { style: { fontSize: 13, color: '#64748B' } }, 'Centralized payment reconciliation')
            ),
            React.createElement('button', { className: 'btn btn-accent', onClick: () => setShowManualEntry(true) }, '+ Manual Entry')
        ),

        React.createElement(Tabs, {
            tabs: [
                { value: 'dashboard', label: '📊 Summary' },
                { value: 'transactions', label: '📋 Transactions' },
                { value: 'trend', label: '📈 Trend' }
            ],
            active: tab, onChange: setTab
        }),

        // Date filter
        React.createElement('div', { style: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' } },
            React.createElement(DateFilterTabs, { active: dateFilter, onChange: setDateFilter }),
            React.createElement('input', { type: 'date', value: selectedDate, onChange: e => setSelectedDate(e.target.value), className: 'form-input', style: { width: 160 } })
        ),

        // DASHBOARD/SUMMARY
        tab === 'dashboard' && React.createElement('div', null,
            // Source toggles
            React.createElement(Card, { style: { marginBottom: 20 } },
                React.createElement('h3', { style: { fontSize: 15, fontWeight: 700, marginBottom: 12 } }, '⚙️ Visible Sources'),
                React.createElement('div', { style: { display: 'flex', gap: 12, flexWrap: 'wrap' } },
                    Object.keys(visibleSources).map(src =>
                        React.createElement('label', { key: src, style: { display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 } },
                            React.createElement('input', {
                                type: 'checkbox', checked: visibleSources[src],
                                onChange: e => setVisibleSources(v => ({ ...v, [src]: e.target.checked })),
                                style: { width: 16, height: 16, accentColor: '#1A1F36' }
                            }),
                            src
                        )
                    )
                )
            ),

            // Main summary card
            React.createElement('div', {
                style: { background: 'linear-gradient(135deg, #1A1F36, #2d3561)', borderRadius: 16, padding: 28, marginBottom: 20, color: '#fff' }
            },
                React.createElement('div', { style: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16, fontWeight: 600 } },
                    '📅 DAILY TRANSACTION SUMMARY — ' + new Date(selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                ),
                React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 20 } },
                    summary.filter(s => visibleSources[s.source] !== false).map(s =>
                        React.createElement('div', { key: s.label, style: { background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 16 } },
                            React.createElement('div', { style: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 } }, s.icon + ' ' + s.label),
                            React.createElement('div', { className: 'mono', style: { fontSize: 20, fontWeight: 700, color: s.type === 'Credit' ? '#10B981' : '#EF4444' } }, formatCurrency(s.amount))
                        )
                    )
                ),
                React.createElement('div', { style: { borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 16, display: 'flex', gap: 24, flexWrap: 'wrap' } },
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontSize: 12, color: 'rgba(255,255,255,0.6)' } }, '⬆️ TOTAL INFLOW'),
                        React.createElement('div', { className: 'mono', style: { fontSize: 28, fontWeight: 700, color: '#10B981' } }, formatCurrency(totalInflow))
                    ),
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontSize: 12, color: 'rgba(255,255,255,0.6)' } }, '⬇️ TOTAL OUTFLOW'),
                        React.createElement('div', { className: 'mono', style: { fontSize: 28, fontWeight: 700, color: '#EF4444' } }, formatCurrency(totalOutflow))
                    ),
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontSize: 12, color: 'rgba(255,255,255,0.6)' } }, '💰 NET BALANCE'),
                        React.createElement('div', { className: 'mono', style: { fontSize: 28, fontWeight: 700, color: netBalance >= 0 ? '#F59E0B' : '#EF4444' } }, formatCurrency(netBalance))
                    )
                )
            ),

            // Bar chart
            React.createElement(Card, null,
                React.createElement('h3', { style: { fontSize: 15, fontWeight: 700, marginBottom: 16 } }, '📊 Source-wise Breakdown'),
                React.createElement(CRMBarChart, {
                    data: chartData, xKey: 'name',
                    bars: [{ key: 'Amount', name: 'Amount (₹)', color: '#1A1F36' }],
                    isCurrency: true
                })
            )
        ),

        // TRANSACTIONS LIST
        tab === 'transactions' && React.createElement('div', null,
            React.createElement('div', { style: { marginBottom: 16 } },
                React.createElement(SearchInput, { value: search, onChange: setSearch, placeholder: 'Search narration...' })
            ),
            React.createElement(Card, null,
                React.createElement('h3', { style: { fontSize: 15, fontWeight: 700, marginBottom: 16 } }, '📋 Manual Transactions'),
                filteredTx.length === 0 ? React.createElement(EmptyState, { icon: '💳', title: 'No manual transactions', subtitle: 'Add a manual adjustment entry' }) :
                    React.createElement('table', { className: 'data-table' },
                        React.createElement('thead', null,
                            React.createElement('tr', null,
                                ['Source', 'Type', 'Amount', 'Narration', 'Added By', 'Date'].map(h => React.createElement('th', { key: h }, h))
                            )
                        ),
                        React.createElement('tbody', null,
                            filteredTx.map(t =>
                                React.createElement('tr', { key: t.id },
                                    React.createElement('td', null, React.createElement('span', { style: { background: '#F1F5F9', padding: '3px 8px', borderRadius: 4, fontSize: 12 } }, t.source)),
                                    React.createElement('td', null, React.createElement(StatusBadge, { status: t.type })),
                                    React.createElement('td', null,
                                        React.createElement('span', { className: 'mono', style: { fontWeight: 700, color: t.type === 'Credit' ? '#10B981' : '#EF4444', fontSize: 15 } },
                                            (t.type === 'Credit' ? '+' : '-') + formatCurrency(t.amount)
                                        )
                                    ),
                                    React.createElement('td', null, t.narration),
                                    React.createElement('td', null, t.added_by_name),
                                    React.createElement('td', null, formatDateTime(t.created_at))
                                )
                            )
                        )
                    )
            )
        ),

        // TREND
        tab === 'trend' && React.createElement(Card, null,
            React.createElement('h3', { style: { fontSize: 16, fontWeight: 700, marginBottom: 16 } }, '📈 Inflow vs Outflow — Last 7 Days'),
            React.createElement(CRMLineChart, {
                data: trendData, xKey: 'date',
                lines: [
                    { key: 'Inflow', color: '#10B981' },
                    { key: 'Outflow', color: '#EF4444' }
                ],
                height: 320, isCurrency: true, area: true
            })
        ),

        // Manual entry modal
        React.createElement(Modal, { isOpen: showManualEntry, onClose: () => setShowManualEntry(false), title: '➕ Add Manual Transaction', size: 'sm' },
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
                React.createElement(FormField, { label: 'Source' },
                    React.createElement(Select, { value: txForm.source, onChange: v => setTxForm(f => ({ ...f, source: v })), options: ['Cash', 'UPI', 'Card', 'Finance', 'Expense', 'Other'] })
                ),
                React.createElement(FormField, { label: 'Type' },
                    React.createElement(Select, { value: txForm.type, onChange: v => setTxForm(f => ({ ...f, type: v })), options: ['Credit', 'Debit'] })
                ),
                React.createElement(FormField, { label: 'Amount (₹)', required: true },
                    React.createElement(Input, { type: 'number', value: txForm.amount, onChange: v => setTxForm(f => ({ ...f, amount: v })), placeholder: 'Enter amount' })
                ),
                React.createElement(FormField, { label: 'Narration' },
                    React.createElement(Textarea, { value: txForm.narration, onChange: v => setTxForm(f => ({ ...f, narration: v })), placeholder: 'Description', rows: 2 })
                ),
                React.createElement('div', { style: { display: 'flex', gap: 12 } },
                    React.createElement('button', { className: 'btn btn-primary', onClick: saveTx }, '✅ Save'),
                    React.createElement('button', { className: 'btn btn-outline', onClick: () => setShowManualEntry(false) }, 'Cancel')
                )
            )
        )
    );
};
