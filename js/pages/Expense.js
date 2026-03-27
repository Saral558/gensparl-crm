// ============================================================
// EXPENSE CRM MODULE
// ============================================================

const EXPENSE_CATEGORIES = ['Rent', 'Electricity', 'Salary', 'Stationery', 'Tea/Snacks', 'Marketing', 'Maintenance', 'Other'];

window.ExpenseCRM = () => {
    const { user, isAdmin } = useAuth();
    const { showToast } = useToast();
    const [tab, setTab] = React.useState('list');
    const [records, setRecords] = React.useState([]);
    const [editItem, setEditItem] = React.useState(null);
    const [deleteId, setDeleteId] = React.useState(null);
    const [categoryFilter, setCategoryFilter] = React.useState('');
    const [search, setSearch] = React.useState('');
    const [dateFilter, setDateFilter] = React.useState('month');

    React.useEffect(() => { loadRecords(); }, []);
    const loadRecords = async () => setRecords(await db.get('expenses'));

    // Form
    const defaultForm = {
        title: '', amount: '', category: 'Tea/Snacks', type: 'Debit',
        narration: '', date: todayStr()
    };
    const [form, setForm] = React.useState(defaultForm);
    const [errors, setErrors] = React.useState({});

    const setField = (key, val) => {
        setForm(f => ({ ...f, [key]: val }));
        setErrors(e => ({ ...e, [key]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.title || form.title.length < 2) e.title = 'Title required';
        if (!form.amount || parseFloat(form.amount) <= 0) e.amount = 'Valid amount required';
        if (!form.category) e.category = 'Select category';
        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); showToast('Please fix form errors', 'error'); return; }

        const record = {
            ...form,
            amount: parseFloat(form.amount),
            added_by_id: user.id,
            added_by_name: user.name
        };

        try {
            if (editItem) {
                await db.update('expenses', editItem.id, record);
                showToast('Expense updated ✅', 'success');
            } else {
                await db.insert('expenses', record);
                showToast('Expense added! 💸', 'success');
            }
            setForm(defaultForm); setEditItem(null); await loadRecords(); setTab('list');
        } catch (err) {
            showToast('Error saving expense', 'error');
        }
    };

    const handleDelete = async (id) => {
        await db.delete('expenses', id);
        showToast('Expense removed', 'warning');
        await loadRecords();
        setDeleteId(null);
    };

    // Filters
    const { start, end } = getDateRange(dateFilter);
    let filtered = filterByDateRange(records, 'created_at', start, end);
    if (search) filtered = filtered.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.narration?.toLowerCase().includes(search.toLowerCase()));
    if (categoryFilter) filtered = filtered.filter(r => r.category === categoryFilter);

    // Stats
    const totalDebit = filtered.filter(r => r.type === 'Debit').reduce((s, r) => s + r.amount, 0);
    const totalCredit = filtered.filter(r => r.type === 'Credit').reduce((s, r) => s + r.amount, 0);
    const netBalance = totalCredit - totalDebit;

    // Chart data
    const catMap = {};
    filtered.filter(r => r.type === 'Debit').forEach(r => {
        catMap[r.category] = (catMap[r.category] || 0) + r.amount;
    });
    const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    return React.createElement('div', { className: 'fade-in' },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 } },
            React.createElement('div', null,
                React.createElement('h2', { style: { fontSize: 22, fontWeight: 700, fontFamily: 'Poppins' } }, '💸 Expense Management'),
                React.createElement('p', { style: { fontSize: 13, color: '#64748B' } }, 'Track business spending and other income')
            ),
            React.createElement('button', { className: 'btn btn-accent', onClick: () => { setForm(defaultForm); setEditItem(null); setTab('form'); } }, '+ Add Expense')
        ),

        React.createElement(Tabs, {
            tabs: [
                { value: 'list', label: '📋 Expense List' },
                ...(isAdmin ? [{ value: 'analytics', label: '📊 Stats' }] : [])
            ],
            active: tab, onChange: setTab
        }),

        // LIST
        tab === 'list' && React.createElement('div', null,
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 } },
                React.createElement(StatCard, { icon: '⬇️', label: 'Total Expenses', value: formatCurrency(totalDebit), color: 'red' }),
                React.createElement(StatCard, { icon: '⬆️', label: 'Other Income', value: formatCurrency(totalCredit), color: 'green' }),
                React.createElement(StatCard, { icon: '💰', label: 'Net Impact', value: formatCurrency(netBalance), color: netBalance >= 0 ? 'blue' : 'red' }),
            ),

            React.createElement('div', { style: { background: '#F8FAFC', padding: 16, borderRadius: 8, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' } },
                React.createElement(DateFilterTabs, { active: dateFilter, onChange: setDateFilter }),
                React.createElement(SearchInput, { value: search, onChange: setSearch, placeholder: 'Search title...' }),
                React.createElement('select', {
                    value: categoryFilter, onChange: e => setCategoryFilter(e.target.value),
                    className: 'form-input', style: { width: 160 }
                },
                    React.createElement('option', { value: '' }, 'All Categories'),
                    EXPENSE_CATEGORIES.map(c => React.createElement('option', { key: c, value: c }, c))
                )
            ),

            filtered.length === 0 ? React.createElement(EmptyState, { icon: '💸', title: 'No expenses found' }) :
                React.createElement(Card, null,
                    React.createElement('table', { className: 'data-table' },
                        React.createElement('thead', null,
                            React.createElement('tr', null,
                                ['Title', 'Category', 'Type', 'Amount', 'Date', 'Added By', 'Actions'].map(h => React.createElement('th', { key: h }, h))
                            )
                        ),
                        React.createElement('tbody', null,
                            filtered.map(r =>
                                React.createElement('tr', { key: r.id },
                                    React.createElement('td', null,
                                        React.createElement('div', { style: { fontWeight: 600 } }, r.title),
                                        React.createElement('div', { style: { fontSize: 11, color: '#94A3B8' } }, r.narration)
                                    ),
                                    React.createElement('td', null, React.createElement('span', { style: { fontSize: 12, background: '#F1F5F9', padding: '2px 8px', borderRadius: 4 } }, r.category)),
                                    React.createElement('td', null, React.createElement(StatusBadge, { status: r.type })),
                                    React.createElement('td', null, React.createElement('span', { className: 'mono', style: { fontWeight: 700, color: r.type === 'Debit' ? '#EF4444' : '#10B981' } }, formatCurrency(r.amount))),
                                    React.createElement('td', null, formatDate(r.date || r.created_at)),
                                    React.createElement('td', null, r.added_by_name || 'Admin'),
                                    React.createElement('td', null,
                                        React.createElement('div', { style: { display: 'flex', gap: 8 } },
                                            React.createElement('button', { className: 'btn btn-sm btn-outline', onClick: () => { setForm({ ...r }); setEditItem(r); setTab('form'); } }, '✏️'),
                                            isAdmin && React.createElement('button', { className: 'btn btn-sm btn-danger', onClick: () => setDeleteId(r.id) }, '🗑️')
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
        ),

        // FORM
        tab === 'form' && React.createElement(Card, null,
            React.createElement('h3', { style: { fontSize: 18, fontWeight: 700, marginBottom: 20 } }, editItem ? '✏️ Edit Entry' : '➕ New Entry'),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 } },
                React.createElement(FormField, { label: 'Entry Title', required: true, error: errors.title },
                    React.createElement(Input, { value: form.title, onChange: v => setField('title', v), placeholder: 'e.g. Office Rent Mar 2024', error: errors.title })
                ),
                React.createElement(FormField, { label: 'Amount (₹)', required: true, error: errors.amount },
                    React.createElement(Input, { type: 'number', value: form.amount, onChange: v => setField('amount', v), placeholder: 'Enter amount', error: errors.amount })
                ),
                React.createElement(FormField, { label: 'Category', required: true },
                    React.createElement(Select, { value: form.category, onChange: v => setField('category', v), options: EXPENSE_CATEGORIES })
                ),
                React.createElement(FormField, { label: 'Type' },
                    React.createElement(Select, { value: form.type, onChange: v => setField('type', v), options: [{ value: 'Debit', label: 'Debit (Expense)' }, { value: 'Credit', label: 'Credit (Income)' }] })
                ),
                React.createElement(FormField, { label: 'Date' },
                    React.createElement(Input, { type: 'date', value: form.date, onChange: v => setField('date', v) })
                )
            ),
            React.createElement(FormField, { label: 'Narration / Description' },
                React.createElement(Textarea, { value: form.narration, onChange: v => setField('narration', v), placeholder: 'Add details here...', rows: 3 })
            ),
            React.createElement('div', { style: { display: 'flex', gap: 12 } },
                React.createElement('button', { className: 'btn btn-primary', onClick: handleSubmit }, editItem ? '💾 Update' : '✅ Save Entry'),
                React.createElement('button', { className: 'btn btn-outline', onClick: () => { setTab('list'); setEditItem(null); setForm(defaultForm); } }, 'Cancel')
            )
        ),

        // ANALYTICS
        tab === 'analytics' && isAdmin && React.createElement('div', null,
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 } },
                React.createElement(Card, null,
                    React.createElement('h3', { style: { fontSize: 15, fontWeight: 700, marginBottom: 16 } }, '📊 Expense by Category'),
                    React.createElement(CRMPieChart, { data: pieData, height: 300 })
                ),
                React.createElement(Card, null,
                    React.createElement('h3', { style: { fontSize: 15, fontWeight: 700, marginBottom: 16 } }, '📈 Category-wise Breakdown'),
                    React.createElement(CRMBarChart, {
                        data: pieData, xKey: 'name',
                        bars: [{ key: 'value', name: 'Amount (₹)', color: '#EF4444' }],
                        isCurrency: true
                    })
                )
            )
        ),

        React.createElement(ConfirmModal, {
            isOpen: !!deleteId, onClose: () => setDeleteId(null),
            onConfirm: () => handleDelete(deleteId),
            title: 'Remove Entry', message: 'Delete this entry permanentely?'
        })
    );
};
