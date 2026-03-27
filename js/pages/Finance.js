// ============================================================
// FINANCE CRM MODULE
// ============================================================

const FINANCE_COMPANIES = ['Bajaj Finance', 'HDB Financial', 'HDFC', 'Tata Capital', 'TVS Credit', 'IDFC First', 'Other'];
const EMI_TENURES = [3, 6, 9, 12, 18, 24, 36];

window.FinanceCRM = () => {
    const { user, isAdmin } = useAuth();
    const { showToast } = useToast();
    const [tab, setTab] = React.useState('list');
    const [records, setRecords] = React.useState([]);
    const [editItem, setEditItem] = React.useState(null);
    const [deleteId, setDeleteId] = React.useState(null);
    const [statusFilter, setStatusFilter] = React.useState('');
    const [search, setSearch] = React.useState('');
    const [dateFilter, setDateFilter] = React.useState('month');

    const [allUsers, setAllUsers] = React.useState([]);

    React.useEffect(() => {
        loadRecords();
        const fetchUsers = async () => {
            const users = await db.get('profiles');
            setAllUsers(users.filter(u => u.role === 'sales' && u.active !== false));
        };
        fetchUsers();
    }, []);

    const loadRecords = async () => {
        const data = await db.get('finance');
        setRecords(data);
    };

    // Form
    const defaultForm = {
        customer_name: '', mobile: '', finance_company: '',
        salesboy_id: '', salesboy_name: '',
        mop: '', dp: '', emi: '', tenure: 12,
        dbd_charges: '', application_no: '', status: 'Pending'
    };
    const [form, setForm] = React.useState(defaultForm);
    const [errors, setErrors] = React.useState({});

    // Auto calcs
    const disbursement = (parseFloat(form.mop) || 0) - (parseFloat(form.dp) || 0);
    const totalEmi = (parseFloat(form.emi) || 0) * (parseInt(form.tenure) || 0);
    const netFinanceCost = totalEmi - disbursement;

    const setField = (key, val) => {
        if (key === 'salesboy_id') {
            const u = allUsers.find(u => u.id === val);
            setForm(f => ({ ...f, salesboy_id: val, salesboy_name: u ? u.name : '' }));
        } else {
            setForm(f => ({ ...f, [key]: val }));
        }
        setErrors(e => ({ ...e, [key]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.customer_name || form.customer_name.length < 2) e.customer_name = 'Required (min 2 chars)';
        if (!form.mobile || !/^\d{10}$/.test(form.mobile)) e.mobile = 'Enter valid 10-digit mobile';
        if (!form.finance_company) e.finance_company = 'Select finance company';
        if (!form.salesboy_id) e.salesboy_id = 'Select lead salesboy';
        if (!form.mop || parseFloat(form.mop) <= 0) e.mop = 'Enter MOP amount';
        if (!form.dp && form.dp !== 0) { e.dp = 'Enter down payment (0 if none)'; }
        else if (parseFloat(form.dp) > parseFloat(form.mop)) e.dp = 'DP cannot exceed MOP';
        if (!form.emi || parseFloat(form.emi) <= 0) e.emi = 'Enter EMI amount';
        if (!form.tenure) e.tenure = 'Select tenure';
        if (!form.status) e.status = 'Select status';
        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); showToast('Please fix form errors', 'error'); return; }

        const record = {
            ...form,
            mop: parseFloat(form.mop),
            dp: parseFloat(form.dp) || 0,
            disbursement,
            emi: parseFloat(form.emi),
            tenure: parseInt(form.tenure),
            total_emi: totalEmi,
            net_finance_cost: netFinanceCost,
            dbd_charges: parseFloat(form.dbd_charges) || 0,
        };

        try {
            if (editItem) {
                await db.update('finance', editItem.id, record);
                showToast('Finance record updated ✅', 'success');
            } else {
                await db.insert('finance', record);
                showToast('Finance entry saved! 💳', 'success');
            }
            setForm(defaultForm);
            setEditItem(null);
            await loadRecords();
            setTab('list');
        } catch (err) {
            showToast('Error saving finance entry', 'error');
        }
    };

    const handleEdit = (item) => {
        setForm({ ...item, mop: item.mop || '', dp: item.dp || '', emi: item.emi || '' });
        setEditItem(item);
        setTab('form');
    };

    const handleDelete = async (id) => {
        await db.delete('finance', id);
        showToast('Finance record deleted', 'warning');
        await loadRecords();
        setDeleteId(null);
    };

    // Status update
    const updateStatus = async (id, status) => {
        await db.update('finance', id, { status });
        showToast(`Status updated to ${status}`, 'success');
        await loadRecords();
    };

    // Filters
    const { start, end } = getDateRange(dateFilter);
    let filtered = filterByDateRange(records, 'created_at', start, end);
    if (search) filtered = filtered.filter(r =>
        r.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.mobile?.includes(search) || r.application_no?.includes(search)
    );
    if (statusFilter) filtered = filtered.filter(r => r.status === statusFilter);

    // Analytics
    const totalDisbursed = filtered.reduce((s, r) => s + (r.disbursement || 0), 0);
    const approved = filtered.filter(r => r.status === 'Approved');
    const pending = filtered.filter(r => r.status === 'Pending');
    const rejected = filtered.filter(r => r.status === 'Rejected');

    // Company chart data
    const companyMap = {};
    filtered.forEach(r => {
        companyMap[r.finance_company] = (companyMap[r.finance_company] || 0) + (r.disbursement || 0);
    });
    const companyData = Object.entries(companyMap).map(([name, Disbursed]) => ({
        name: name.split(' ')[0], Disbursed
    }));

    const statusPieData = [
        { name: 'Approved', value: approved.length, color: '#10B981' },
        { name: 'Pending', value: pending.length, color: '#F59E0B' },
        { name: 'Rejected', value: rejected.length, color: '#EF4444' },
    ].filter(d => d.value > 0);

    return React.createElement('div', { className: 'fade-in' },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 } },
            React.createElement('div', null,
                React.createElement('h2', { style: { fontSize: 22, fontWeight: 700, fontFamily: 'Poppins' } }, '💳 Finance CRM'),
                React.createElement('p', { style: { fontSize: 13, color: '#64748B' } }, 'EMI & Finance management')
            ),
            React.createElement('button', { className: 'btn btn-accent', onClick: () => { setForm(defaultForm); setEditItem(null); setTab('form'); } }, '+ New Finance Entry')
        ),

        React.createElement(Tabs, {
            tabs: [
                { value: 'list', label: '📋 Finance List' },
                ...(isAdmin ? [{ value: 'analytics', label: '📊 Analytics' }] : [])
            ],
            active: tab, onChange: setTab
        }),

        // LIST
        tab === 'list' && React.createElement('div', null,
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 } },
                React.createElement(StatCard, { icon: '💰', label: 'Total Disbursed', value: formatCurrency(totalDisbursed), color: 'amber' }),
                React.createElement(StatCard, { icon: '✅', label: 'Approved', value: approved.length, color: 'green' }),
                React.createElement(StatCard, { icon: '⏳', label: 'Pending', value: pending.length, color: 'amber' }),
                React.createElement(StatCard, { icon: '❌', label: 'Rejected', value: rejected.length, color: 'red' }),
            ),
            React.createElement('div', { style: { background: '#F8FAFC', padding: 16, borderRadius: 8, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' } },
                React.createElement(DateFilterTabs, { active: dateFilter, onChange: setDateFilter }),
                React.createElement(SearchInput, { value: search, onChange: setSearch, placeholder: 'Search customer, app no...' }),
                React.createElement('select', {
                    value: statusFilter, onChange: e => setStatusFilter(e.target.value),
                    className: 'form-input', style: { width: 140 }
                },
                    React.createElement('option', { value: '' }, 'All Status'),
                    ['Pending', 'Approved', 'Rejected'].map(s => React.createElement('option', { key: s, value: s }, s))
                )
            ),
            filtered.length === 0 ? React.createElement(EmptyState, { icon: '💳', title: 'No finance entries', subtitle: 'Add a new finance application' }) :
                React.createElement(Card, null,
                    React.createElement('div', { style: { overflowX: 'auto' } },
                        React.createElement('table', { className: 'data-table' },
                            React.createElement('thead', null,
                                React.createElement('tr', null,
                                    ['Customer', 'Company', 'MOP', 'DP', 'Disbursement', 'EMI', 'Tenure', 'Salesboy', 'Status', 'Actions'].map(h =>
                                        React.createElement('th', { key: h }, h)
                                    )
                                )
                            ),
                            React.createElement('tbody', null,
                                filtered.map(r =>
                                    React.createElement('tr', { key: r.id },
                                        React.createElement('td', null,
                                            React.createElement('div', { style: { fontWeight: 600 } }, r.customer_name),
                                            React.createElement('div', { style: { fontSize: 11, color: '#94A3B8' } }, r.mobile),
                                            r.application_no && React.createElement('div', { style: { fontSize: 10, color: '#64748B' } }, '# ' + r.application_no)
                                        ),
                                        React.createElement('td', null, React.createElement('span', { style: { fontSize: 12, background: '#EFF6FF', color: '#1d4ed8', padding: '2px 8px', borderRadius: 4 } }, r.finance_company)),
                                        React.createElement('td', null, React.createElement('span', { className: 'mono', style: { fontWeight: 600 } }, formatCurrency(r.mop))),
                                        React.createElement('td', null, React.createElement('span', { className: 'mono' }, formatCurrency(r.dp))),
                                        React.createElement('td', null, React.createElement('span', { className: 'mono', style: { fontWeight: 700, color: '#10B981' } }, formatCurrency(r.disbursement))),
                                        React.createElement('td', null, React.createElement('span', { className: 'mono' }, formatCurrency(r.emi) + '/mo')),
                                        React.createElement('td', null, React.createElement('span', { style: { fontSize: 12 } }, r.tenure + ' mo')),
                                        React.createElement('td', null, r.salesboy_name),
                                        React.createElement('td', null,
                                            isAdmin ? React.createElement('select', {
                                                value: r.status,
                                                onChange: e => updateStatus(r.id, e.target.value),
                                                className: 'form-input', style: { padding: '4px 8px', fontSize: 12, width: 110 }
                                            },
                                                ['Pending', 'Approved', 'Rejected'].map(s => React.createElement('option', { key: s, value: s }, s))
                                            ) : React.createElement(StatusBadge, { status: r.status })
                                        ),
                                        isAdmin && React.createElement('td', null,
                                            React.createElement('div', { style: { display: 'flex', gap: 6 } },
                                                React.createElement('button', { className: 'btn btn-sm btn-outline', onClick: () => handleEdit(r) }, '✏️'),
                                                React.createElement('button', { className: 'btn btn-sm btn-danger', onClick: () => setDeleteId(r.id) }, '🗑️')
                                            )
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
            React.createElement('h3', { style: { fontSize: 18, fontWeight: 700, marginBottom: 20 } }, editItem ? '✏️ Edit Finance Entry' : '➕ New Finance Entry'),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 } },
                React.createElement(FormField, { label: 'Customer Name', required: true, error: errors.customer_name },
                    React.createElement(Input, { value: form.customer_name, onChange: v => setField('customer_name', v), placeholder: 'Full name', error: errors.customer_name })
                ),
                React.createElement(FormField, { label: 'Mobile Number', required: true, error: errors.mobile },
                    React.createElement(Input, { type: 'tel', value: form.mobile, onChange: v => setField('mobile', v), placeholder: '10-digit mobile', error: errors.mobile })
                ),
                React.createElement(FormField, { label: 'Finance Company', required: true, error: errors.finance_company },
                    React.createElement(Select, { value: form.finance_company, onChange: v => setField('finance_company', v), options: FINANCE_COMPANIES, placeholder: 'Select company', error: errors.finance_company })
                ),
                React.createElement(FormField, { label: 'Lead Salesboy', required: true, error: errors.salesboy_id },
                    React.createElement(Select, {
                        value: form.salesboy_id,
                        onChange: v => setField('salesboy_id', v),
                        options: allUsers.map(u => ({ value: u.id, label: u.name })),
                        placeholder: 'Select salesboy',
                        error: errors.salesboy_id
                    })
                ),
                React.createElement(FormField, { label: 'MOP - Market Operating Price (₹)', required: true, error: errors.mop },
                    React.createElement(Input, { type: 'number', value: form.mop, onChange: v => setField('mop', v), placeholder: 'Product MOP', error: errors.mop })
                ),
                React.createElement(FormField, { label: 'Down Payment (₹)', required: true, error: errors.dp },
                    React.createElement(Input, { type: 'number', value: form.dp, onChange: v => setField('dp', v), placeholder: '0 if none', error: errors.dp })
                ),
                React.createElement(FormField, { label: 'EMI Amount (₹/month)', required: true, error: errors.emi },
                    React.createElement(Input, { type: 'number', value: form.emi, onChange: v => setField('emi', v), placeholder: 'Monthly EMI', error: errors.emi })
                ),
                React.createElement(FormField, { label: 'EMI Tenure (Months)', required: true, error: errors.tenure },
                    React.createElement(Select, { value: form.tenure, onChange: v => setField('tenure', v), options: EMI_TENURES.map(t => ({ value: t, label: `${t} Months` })) })
                ),
                React.createElement(FormField, { label: 'DBD Charges (₹)', required: false },
                    React.createElement(Input, { type: 'number', value: form.dbd_charges, onChange: v => setField('dbd_charges', v), placeholder: 'Optional' })
                ),
                React.createElement(FormField, { label: 'Application No', required: false },
                    React.createElement(Input, { value: form.application_no, onChange: v => setField('application_no', v), placeholder: 'Finance ref number' })
                ),
                React.createElement(FormField, { label: 'Status', required: true, error: errors.status },
                    React.createElement(Select, { value: form.status, onChange: v => setField('status', v), options: ['Pending', 'Approved', 'Rejected'] })
                )
            ),

            // Finance Summary Card
            (form.mop || form.dp || form.emi) && React.createElement('div', {
                style: { background: 'linear-gradient(135deg, #1A1F36, #2d3561)', borderRadius: 12, padding: 20, marginTop: 8, marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }
            },
                React.createElement('div', { style: { textAlign: 'center' } },
                    React.createElement('div', { style: { color: 'rgba(255,255,255,0.6)', fontSize: 12 } }, 'Disbursement Amount'),
                    React.createElement('div', { className: 'mono', style: { color: '#10B981', fontWeight: 700, fontSize: 20, marginTop: 4 } }, formatCurrency(disbursement))
                ),
                React.createElement('div', { style: { textAlign: 'center' } },
                    React.createElement('div', { style: { color: 'rgba(255,255,255,0.6)', fontSize: 12 } }, 'Total EMI Payable'),
                    React.createElement('div', { className: 'mono', style: { color: '#F59E0B', fontWeight: 700, fontSize: 20, marginTop: 4 } }, formatCurrency(totalEmi))
                ),
                React.createElement('div', { style: { textAlign: 'center' } },
                    React.createElement('div', { style: { color: 'rgba(255,255,255,0.6)', fontSize: 12 } }, 'Net Finance Cost'),
                    React.createElement('div', { className: 'mono', style: { color: netFinanceCost > 0 ? '#EF4444' : '#10B981', fontWeight: 700, fontSize: 20, marginTop: 4 } }, formatCurrency(netFinanceCost))
                )
            ),

            React.createElement('div', { style: { display: 'flex', gap: 12 } },
                React.createElement('button', { className: 'btn btn-primary', onClick: handleSubmit }, editItem ? '💾 Update' : '✅ Save Finance Entry'),
                React.createElement('button', { className: 'btn btn-outline', onClick: () => { setTab('list'); setEditItem(null); setForm(defaultForm); } }, 'Cancel')
            )
        ),

        // ANALYTICS
        tab === 'analytics' && isAdmin && React.createElement('div', null,
            React.createElement(DateFilterTabs, { active: dateFilter, onChange: setDateFilter }),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 16 } },
                React.createElement(Card, null,
                    React.createElement('h3', { style: { fontSize: 15, fontWeight: 700, marginBottom: 16 } }, '🏦 Company Wise Disbursement'),
                    React.createElement(CRMBarChart, { data: companyData, xKey: 'name', bars: [{ key: 'Disbursed', color: '#1A1F36' }], isCurrency: true })
                ),
                React.createElement(Card, null,
                    React.createElement('h3', { style: { fontSize: 15, fontWeight: 700, marginBottom: 16 } }, '📊 Application Status'),
                    React.createElement(CRMPieChart, { data: statusPieData, height: 280 })
                )
            )
        ),

        React.createElement(ConfirmModal, {
            isOpen: !!deleteId, onClose: () => setDeleteId(null),
            onConfirm: () => handleDelete(deleteId),
            title: 'Delete Finance Record', message: 'Delete this finance entry? This cannot be undone.'
        })
    );
};
