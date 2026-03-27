// ============================================================
// GIFT BOX CRM MODULE
// ============================================================

const GIFT_ITEMS = ['Bluetooth Speaker', 'LED Bulb Pack', 'Laptop Bag', 'Earphones', 'Power Bank', 'Phone Case', 'Smart Watch', 'Pen Drive', 'Extension Cord', 'Other'];

window.GiftBoxCRM = () => {
    const { user, isAdmin } = useAuth();
    const { showToast } = useToast();
    const [tab, setTab] = React.useState('list');
    const [records, setRecords] = React.useState([]);
    const [editItem, setEditItem] = React.useState(null);
    const [deleteId, setDeleteId] = React.useState(null);
    const [search, setSearch] = React.useState('');

    React.useEffect(() => { loadRecords(); }, []);
    const loadRecords = async () => setRecords(await db.get('gifts'));

    const defaultForm = { customer_name: '', bill_no: '', gift_item: '', gift_value: '', remarks: '' };
    const [form, setForm] = React.useState(defaultForm);
    const [errors, setErrors] = React.useState({});

    const setField = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

    const validate = () => {
        const e = {};
        if (!form.customer_name || form.customer_name.length < 2) e.customer_name = 'Required';
        if (!form.bill_no) e.bill_no = 'Bill number required';
        if (!form.gift_item) e.gift_item = 'Select or enter gift item';
        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); showToast('Please fix form errors', 'error'); return; }
        const record = { ...form, gift_value: parseFloat(form.gift_value) || 0, given_by_id: user.id, given_by_name: user.name };
        
        try {
            if (editItem) {
                await db.update('gifts', editItem.id, record);
                showToast('Gift record updated ✅', 'success');
            } else {
                await db.insert('gifts', record);
                showToast('Gift entry saved! 🎁', 'success');
            }
            setForm(defaultForm); setEditItem(null); await loadRecords(); setTab('list');
        } catch (err) {
            showToast('Error saving gift record', 'error');
        }
    };

    const handleDelete = async (id) => { 
        await db.delete('gifts', id); 
        showToast('Gift entry deleted', 'warning'); 
        await loadRecords(); 
        setDeleteId(null); 
    };

    let filtered = records;
    if (search) filtered = filtered.filter(r =>
        r.customer_name?.toLowerCase().includes(search.toLowerCase()) || r.bill_no?.includes(search)
    );

    const totalGifts = filtered.length;
    const totalValue = filtered.reduce((s, r) => s + (r.gift_value || 0), 0);

    return React.createElement('div', { className: 'fade-in' },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 } },
            React.createElement('div', null,
                React.createElement('h2', { style: { fontSize: 22, fontWeight: 700, fontFamily: 'Poppins' } }, '🎁 Gift Box CRM'),
                React.createElement('p', { style: { fontSize: 13, color: '#64748B' } }, 'Track gifts given to customers')
            ),
            React.createElement('button', { className: 'btn btn-accent', onClick: () => { setForm(defaultForm); setEditItem(null); setTab('form'); } }, '+ New Gift Entry')
        ),

        React.createElement(Tabs, {
            tabs: [{ value: 'list', label: '📋 Gift List' }, { value: 'form', label: editItem ? '✏️ Edit' : '➕ Add Gift' }],
            active: tab, onChange: setTab
        }),

        tab === 'list' && React.createElement('div', null,
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 } },
                React.createElement(StatCard, { icon: '🎁', label: 'Total Gifts Given', value: totalGifts, color: 'amber' }),
                React.createElement(StatCard, { icon: '💰', label: 'Total Gift Value', value: formatCurrency(totalValue), color: 'green' }),
            ),
            React.createElement('div', { style: { background: '#F8FAFC', padding: 12, borderRadius: 8, marginBottom: 16, display: 'flex', gap: 12 } },
                React.createElement(SearchInput, { value: search, onChange: setSearch, placeholder: 'Search customer or bill no...' }),
                React.createElement('button', { className: 'btn btn-outline btn-sm', onClick: () => exportToCSV(filtered, 'gifts_export') }, '📥 Export CSV')
            ),
            filtered.length === 0 ? React.createElement(EmptyState, { icon: '🎁', title: 'No gift entries', subtitle: 'Record gifts given to customers for audit trail' }) :
                React.createElement(Card, null,
                    React.createElement('table', { className: 'data-table' },
                        React.createElement('thead', null,
                            React.createElement('tr', null,
                                ['Customer', 'Bill No', 'Gift Item', 'Value', 'Given By', 'Date', 'Remarks', 'Actions'].map(h => React.createElement('th', { key: h }, h))
                            )
                        ),
                        React.createElement('tbody', null,
                            filtered.map(r =>
                                React.createElement('tr', { key: r.id },
                                    React.createElement('td', null, React.createElement('div', { style: { fontWeight: 600 } }, r.customer_name)),
                                    React.createElement('td', null, React.createElement('span', { className: 'mono', style: { fontSize: 12, background: '#F1F5F9', padding: '2px 8px', borderRadius: 4 } }, r.bill_no)),
                                    React.createElement('td', null,
                                        React.createElement('span', { style: { background: '#FFF7ED', color: '#c2410c', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500 } },
                                            '🎁 ' + r.gift_item
                                        )
                                    ),
                                    React.createElement('td', null, r.gift_value ? React.createElement('span', { className: 'mono', style: { color: '#10B981', fontWeight: 600 } }, formatCurrency(r.gift_value)) : '—'),
                                    React.createElement('td', null, r.given_by_name),
                                    React.createElement('td', null, formatDateTime(r.created_at)),
                                    React.createElement('td', null, React.createElement('span', { style: { fontSize: 12, color: '#64748B' } }, r.remarks || '—')),
                                    React.createElement('td', null,
                                        React.createElement('div', { style: { display: 'flex', gap: 6 } },
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

        tab === 'form' && React.createElement(Card, null,
            React.createElement('h3', { style: { fontSize: 18, fontWeight: 700, marginBottom: 20 } }, editItem ? '✏️ Edit Gift Entry' : '➕ New Gift Entry'),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 } },
                React.createElement(FormField, { label: 'Customer Name', required: true, error: errors.customer_name },
                    React.createElement(Input, { value: form.customer_name, onChange: v => setField('customer_name', v), placeholder: 'Customer full name', error: errors.customer_name })
                ),
                React.createElement(FormField, { label: 'Bill No / Sale ID', required: true, error: errors.bill_no, hint: 'Link to sale entry number' },
                    React.createElement(Input, { value: form.bill_no, onChange: v => setField('bill_no', v), placeholder: 'e.g. s1, INV-001', error: errors.bill_no })
                ),
                React.createElement(FormField, { label: 'Gift Item', required: true, error: errors.gift_item },
                    React.createElement(Select, { value: form.gift_item, onChange: v => setField('gift_item', v), options: GIFT_ITEMS, placeholder: 'Select gift item', error: errors.gift_item })
                ),
                React.createElement(FormField, { label: 'Gift Value (₹)', required: false, hint: 'Optional — for audit purposes' },
                    React.createElement(Input, { type: 'number', value: form.gift_value, onChange: v => setField('gift_value', v), placeholder: 'Approximate value' })
                )
            ),
            React.createElement(FormField, { label: 'Remarks' },
                React.createElement(Textarea, { value: form.remarks, onChange: v => setField('remarks', v), placeholder: 'Additional notes...' })
            ),
            React.createElement('div', { style: { background: '#F8FAFC', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 12, color: '#64748B' } },
                `🎁 Given by: ${user.name} | ⏰ Date: Auto-filled`
            ),
            React.createElement('div', { style: { display: 'flex', gap: 12 } },
                React.createElement('button', { className: 'btn btn-accent', onClick: handleSubmit }, editItem ? '💾 Update' : '🎁 Save Gift Entry'),
                React.createElement('button', { className: 'btn btn-outline', onClick: () => { setTab('list'); setEditItem(null); setForm(defaultForm); } }, 'Cancel')
            )
        ),

        React.createElement(ConfirmModal, {
            isOpen: !!deleteId, onClose: () => setDeleteId(null),
            onConfirm: () => handleDelete(deleteId),
            title: 'Delete Gift Entry', message: 'Delete this gift entry?'
        })
    );
};
