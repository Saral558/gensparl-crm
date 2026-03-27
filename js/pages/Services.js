// ============================================================
// SERVICE CRM MODULE
// ============================================================

window.ServiceCRM = () => {
    const { user, isAdmin } = useAuth();
    const { showToast } = useToast();
    const [tab, setTab] = React.useState('list');
    const [records, setRecords] = React.useState([]);
    const [editItem, setEditItem] = React.useState(null);
    const [deleteId, setDeleteId] = React.useState(null);
    const [search, setSearch] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('');
    const [typeFilter, setTypeFilter] = React.useState('');

    const [allUsers, setAllUsers] = React.useState([]);

    React.useEffect(() => {
        loadRecords();
        const fetchUsers = async () => {
            const users = await db.get('profiles');
            setAllUsers(users.filter(u => u.role === 'service'));
        };
        fetchUsers();
    }, []);

    const loadRecords = async () => {
        const data = await db.get('service');
        setRecords(data);
    };

    const defaultForm = {
        customer_name: '', mobile: '', location: '', product_name: '', serial_no: '',
        type: 'Service', problem: '', login_id: '', assigned_to_id: '', assigned_to_name: '',
        status: 'Pending', resolution_notes: '', narration: ''
    };
    const [form, setForm] = React.useState(defaultForm);
    const [errors, setErrors] = React.useState({});

    const setField = (k, v) => {
        if (k === 'assigned_to_id') {
            const u = allUsers.find(u => u.id === v);
            setForm(f => ({ ...f, assigned_to_id: v, assigned_to_name: u ? u.name : '' }));
        } else {
            setForm(f => ({ ...f, [k]: v }));
            if (k === 'status' && v === 'Done' && !editItem?.resolved_at) {
                setForm(f => ({ ...f, [k]: v, resolved_at: new Date().toISOString() }));
            }
        }
        setErrors(e => ({ ...e, [k]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.customer_name || form.customer_name.length < 2) e.customer_name = 'Required';
        if (!form.mobile || !/^\d{10}$/.test(form.mobile)) e.mobile = 'Enter valid 10-digit mobile';
        if (!form.location) e.location = 'Location required';
        if (!form.product_name) e.product_name = 'Product name required';
        if (!form.serial_no) e.serial_no = 'Serial/model no required';
        if (!form.problem || form.problem.trim().length < 5) e.problem = 'Describe the problem (min 5 chars)';
        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); showToast('Please fix form errors', 'error'); return; }

        const record = {
            customer_name: form.customer_name,
            mobile: form.mobile,
            location: form.location,
            product_name: form.product_name,
            serial_no: form.serial_no,
            type: form.type,
            problem: form.problem,
            login_id: form.login_id,
            assigned_to_id: form.assigned_to_id || null,
            status: form.status,
            resolution_notes: form.resolution_notes,
            narration: form.narration,
            resolved_at: form.status === 'Done' ? (editItem?.resolved_at || new Date().toISOString()) : null
        };

        try {
            if (editItem) {
                await db.update('service', editItem.id, record);
                showToast('Service record updated ✅', 'success');
            } else {
                await db.insert('service', record);
                showToast('Service request created! 🔧', 'success');
            }
            setForm(defaultForm); setEditItem(null); await loadRecords(); setTab('list');
        } catch (err) {
            showToast('Error saving service request', 'error');
        }
    };

    const updateStatus = async (id, status) => {
        const updates = { status };
        if (status === 'Done') updates.resolved_at = new Date().toISOString();
        await db.update('service', id, updates);
        showToast(`Status → ${status}`, 'success');
        await loadRecords();
    };

    const handleDelete = async (id) => { 
        await db.delete('service', id); 
        showToast('Service entry deleted', 'warning'); 
        await loadRecords(); 
        setDeleteId(null); 
    };

    // Filters
    let filtered = [...records];
    if (!isAdmin) filtered = filtered.filter(r => r.assigned_to_id === user.id || !r.assigned_to_id);
    if (search) filtered = filtered.filter(r => r.customer_name?.toLowerCase().includes(search.toLowerCase()) || r.product_name?.toLowerCase().includes(search.toLowerCase()) || r.mobile?.includes(search));
    if (statusFilter) filtered = filtered.filter(r => r.status === statusFilter);
    if (typeFilter) filtered = filtered.filter(r => r.type === typeFilter);

    // Stats
    const pending = records.filter(r => r.status === 'Pending').length;
    const inProgress = records.filter(r => r.status === 'In Progress').length;
    const doneToday = records.filter(r => r.status === 'Done' && r.resolved_at?.startsWith(todayStr())).length;

    // Overdue (pending > 2 days)
    const overdueRecs = filtered.filter(r => {
        if (r.status === 'Done') return false;
        const diffDays = (new Date() - new Date(r.created_at)) / (1000 * 60 * 60 * 24);
        return diffDays > 2;
    });

    // Technician wise jobs
    const techMap = {};
    records.forEach(r => {
        const name = r.assigned_to_name || 'Unassigned';
        if (!techMap[name]) techMap[name] = { name: name.split(' ')[0], Jobs: 0, Done: 0 };
        techMap[name].Jobs += 1;
        if (r.status === 'Done') techMap[name].Done += 1;
    });
    const techData = Object.values(techMap);

    // Type split
    const demoCount = records.filter(r => r.type === 'Demo').length;
    const serviceCount = records.filter(r => r.type === 'Service').length;
    const typePieData = [
        { name: 'Service', value: serviceCount, color: '#1A1F36' },
        { name: 'Demo', value: demoCount, color: '#F59E0B' },
    ].filter(d => d.value > 0);

    // Avg resolution time
    const resolvedRecs = records.filter(r => r.status === 'Done' && r.resolved_at && r.created_at);
    const avgResolutionHours = resolvedRecs.length > 0
        ? resolvedRecs.reduce((s, r) => s + (new Date(r.resolved_at) - new Date(r.created_at)) / (1000 * 60 * 60), 0) / resolvedRecs.length
        : 0;

    const getDaysAgo = (dateStr) => {
        const diff = (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24);
        return Math.floor(diff);
    };

    return React.createElement('div', { className: 'fade-in' },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 } },
            React.createElement('div', null,
                React.createElement('h2', { style: { fontSize: 22, fontWeight: 700, fontFamily: 'Poppins' } }, '🔧 Service CRM'),
                React.createElement('p', { style: { fontSize: 13, color: '#64748B' } }, 'Demo & Service request management')
            ),
            React.createElement('button', { className: 'btn btn-accent', onClick: () => { setForm(defaultForm); setEditItem(null); setTab('form'); } }, '+ New Service Request')
        ),

        React.createElement(Tabs, {
            tabs: [
                { value: 'list', label: '📋 Service List' },
                ...(isAdmin ? [{ value: 'analytics', label: '📊 Analytics' }] : [])
            ],
            active: tab, onChange: setTab
        }),

        // LIST
        tab === 'list' && React.createElement('div', null,
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 } },
                React.createElement(StatCard, { icon: '⏳', label: 'Pending', value: pending, color: 'amber' }),
                React.createElement(StatCard, { icon: '🔄', label: 'In Progress', value: inProgress, color: 'blue' }),
                React.createElement(StatCard, { icon: '✅', label: 'Done Today', value: doneToday, color: 'green' }),
                React.createElement(StatCard, { icon: '⚠️', label: 'Overdue (>2d)', value: overdueRecs.length, color: 'red' }),
            ),

            // Overdue alerts
            overdueRecs.length > 0 && React.createElement('div', { style: { marginBottom: 16 } },
                overdueRecs.map(r =>
                    React.createElement(AlertBox, { key: r.id, type: 'warning' },
                        React.createElement('div', null,
                            React.createElement('strong', null, `⚠️ ${r.customer_name}`),
                            React.createElement('span', { style: { fontSize: 12, marginLeft: 8 } }, `${r.product_name} — ${r.type} — Pending since ${getDaysAgo(r.created_at)} days`)
                        )
                    )
                )
            ),

            React.createElement('div', { style: { background: '#F8FAFC', padding: 12, borderRadius: 8, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' } },
                React.createElement(SearchInput, { value: search, onChange: setSearch, placeholder: 'Search customer, product...' }),
                React.createElement('select', {
                    value: statusFilter, onChange: e => setStatusFilter(e.target.value),
                    className: 'form-input', style: { width: 140 }
                },
                    React.createElement('option', { value: '' }, 'All Status'),
                    ['Pending', 'In Progress', 'Done'].map(s => React.createElement('option', { key: s, value: s }, s))
                ),
                React.createElement('select', {
                    value: typeFilter, onChange: e => setTypeFilter(e.target.value),
                    className: 'form-input', style: { width: 120 }
                },
                    React.createElement('option', { value: '' }, 'All Types'),
                    ['Demo', 'Service'].map(t => React.createElement('option', { key: t, value: t }, t))
                )
            ),

            filtered.length === 0 ? React.createElement(EmptyState, { icon: '🔧', title: 'No service requests', subtitle: 'Create a new service or demo request' }) :
                React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 } },
                    filtered.map(r =>
                        React.createElement(Card, { key: r.id, style: { borderLeft: `4px solid ${statusColors[r.status] || '#94A3B8'}` } },
                            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 } },
                                React.createElement('div', null,
                                    React.createElement('div', { style: { fontWeight: 700, fontSize: 15 } }, r.customer_name),
                                    React.createElement('div', { style: { fontSize: 12, color: '#64748B' } }, '📱 ' + r.mobile + ' • 📍 ' + r.location)
                                ),
                                React.createElement('div', { style: { display: 'flex', gap: 6, flexDirection: 'column', alignItems: 'flex-end' } },
                                    React.createElement('span', {
                                        style: {
                                            padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                                            background: r.type === 'Demo' ? '#FFF7ED' : '#EFF6FF',
                                            color: r.type === 'Demo' ? '#c2410c' : '#1d4ed8'
                                        }
                                    }, r.type),
                                    React.createElement(StatusBadge, { status: r.status })
                                )
                            ),
                            React.createElement('div', { style: { background: '#F8FAFC', borderRadius: 8, padding: 10, marginBottom: 12 } },
                                React.createElement('div', { style: { fontSize: 12, fontWeight: 600, color: '#475569' } }, '📦 ' + r.product_name),
                                React.createElement('div', { style: { fontSize: 11, color: '#94A3B8', marginTop: 2 } }, 'S/N: ' + r.serial_no),
                                React.createElement('div', { style: { fontSize: 12, color: '#1e293b', marginTop: 6 } }, '🔍 ' + r.problem)
                            ),
                            r.assigned_to_name && React.createElement('div', { style: { fontSize: 12, color: '#64748B', marginBottom: 8 } },
                                '👨‍🔧 Assigned: ' + r.assigned_to_name
                            ),
                            getDaysAgo(r.created_at) > 2 && r.status !== 'Done' && React.createElement('div', {
                                style: { background: '#FEF2F2', color: '#dc2626', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, marginBottom: 8 }
                            }, `⚠️ Pending ${getDaysAgo(r.created_at)} days!`),
                            React.createElement('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
                                isAdmin ? React.createElement('select', {
                                    value: r.status,
                                    onChange: e => updateStatus(r.id, e.target.value),
                                    className: 'form-input', style: { padding: '6px 10px', fontSize: 12, flex: 1 }
                                },
                                    ['Pending', 'In Progress', 'Done'].map(s => React.createElement('option', { key: s, value: s }, s))
                                ) : React.createElement('span', null, React.createElement(StatusBadge, { status: r.status })),
                                React.createElement('button', { className: 'btn btn-sm btn-outline', onClick: () => { setForm({ ...r }); setEditItem(r); setTab('form'); } }, '✏️'),
                                isAdmin && React.createElement('button', { className: 'btn btn-sm btn-danger', onClick: () => setDeleteId(r.id) }, '🗑️')
                            )
                        )
                    )
                )
        ),

        // FORM
        tab === 'form' && React.createElement(Card, null,
            React.createElement('h3', { style: { fontSize: 18, fontWeight: 700, marginBottom: 20 } }, editItem ? '✏️ Edit Service Request' : '➕ New Service Request'),

            // Type toggle
            React.createElement('div', { style: { display: 'flex', gap: 12, marginBottom: 20 } },
                ['Demo', 'Service'].map(t =>
                    React.createElement('button', {
                        key: t, type: 'button',
                        onClick: () => setField('type', t),
                        style: {
                            padding: '10px 24px', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
                            border: `2px solid ${form.type === t ? '#1A1F36' : '#E2E8F0'}`,
                            background: form.type === t ? '#1A1F36' : '#fff',
                            color: form.type === t ? '#F59E0B' : '#94A3B8',
                            fontFamily: 'Inter', fontSize: 14, transition: 'all 0.2s'
                        }
                    }, t === 'Demo' ? '📺 Demo' : '🔧 Service')
                )
            ),

            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 } },
                React.createElement(FormField, { label: 'Customer Name', required: true, error: errors.customer_name },
                    React.createElement(Input, { value: form.customer_name, onChange: v => setField('customer_name', v), error: errors.customer_name, placeholder: 'Full name' })
                ),
                React.createElement(FormField, { label: 'Mobile No', required: true, error: errors.mobile },
                    React.createElement(Input, { type: 'tel', value: form.mobile, onChange: v => setField('mobile', v), error: errors.mobile, placeholder: '10-digit mobile' })
                ),
                React.createElement(FormField, { label: 'Location', required: true, error: errors.location },
                    React.createElement(Input, { value: form.location, onChange: v => setField('location', v), error: errors.location, placeholder: 'Area / City' })
                ),
                React.createElement(FormField, { label: 'Product Name', required: true, error: errors.product_name },
                    React.createElement(Input, { value: form.product_name, onChange: v => setField('product_name', v), error: errors.product_name, placeholder: 'e.g. LG 1.5T Split AC' })
                ),
                React.createElement(FormField, { label: 'Serial No / Model No', required: true, error: errors.serial_no },
                    React.createElement(Input, { value: form.serial_no, onChange: v => setField('serial_no', v), error: errors.serial_no, placeholder: 'S/N or Model' })
                ),
                React.createElement(FormField, { label: 'Login ID / Service Ref' },
                    React.createElement(Input, { value: form.login_id, onChange: v => setField('login_id', v), placeholder: 'Optional' })
                ),
                React.createElement(FormField, { label: 'Assigned Technician' },
                    React.createElement(Select, {
                        value: form.assigned_to_id,
                        onChange: v => setField('assigned_to_id', v),
                        options: allUsers.map(u => ({ value: u.id, label: u.name })),
                        placeholder: 'Select technician (optional)'
                    })
                ),
                React.createElement(FormField, { label: 'Status' },
                    React.createElement(Select, { value: form.status, onChange: v => setField('status', v), options: ['Pending', 'In Progress', 'Done'] })
                )
            ),
            React.createElement(FormField, { label: 'Problem Description', required: true, error: errors.problem },
                React.createElement(Textarea, { value: form.problem, onChange: v => setField('problem', v), error: errors.problem, placeholder: 'Describe the issue...', rows: 3 })
            ),
            React.createElement(FormField, { label: 'Resolution Notes' },
                React.createElement(Textarea, { value: form.resolution_notes, onChange: v => setField('resolution_notes', v), placeholder: 'What was done to resolve...', rows: 2 })
            ),
            React.createElement(FormField, { label: 'Narration' },
                React.createElement(Textarea, { value: form.narration, onChange: v => setField('narration', v), placeholder: 'Additional notes...', rows: 2 })
            ),
            React.createElement('div', { style: { display: 'flex', gap: 12 } },
                React.createElement('button', { className: 'btn btn-primary', onClick: handleSubmit }, editItem ? '💾 Update' : '✅ Save Service Request'),
                React.createElement('button', { className: 'btn btn-outline', onClick: () => { setTab('list'); setEditItem(null); setForm(defaultForm); } }, 'Cancel')
            )
        ),

        // ANALYTICS
        tab === 'analytics' && isAdmin && React.createElement('div', null,
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 } },
                React.createElement(StatCard, { icon: '⏱️', label: 'Avg Resolution', value: avgResolutionHours < 24 ? avgResolutionHours.toFixed(1) + 'h' : (avgResolutionHours / 24).toFixed(1) + 'd', color: 'blue' }),
                React.createElement(StatCard, { icon: '✅', label: 'Total Resolved', value: resolvedRecs.length, color: 'green' }),
                React.createElement(StatCard, { icon: '🔧', label: 'Total Service', value: serviceCount, color: 'navy' }),
                React.createElement(StatCard, { icon: '📺', label: 'Total Demo', value: demoCount, color: 'amber' }),
            ),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 } },
                React.createElement(Card, null,
                    React.createElement('h3', { style: { fontSize: 15, fontWeight: 700, marginBottom: 16 } }, '👨‍🔧 Technician Jobs'),
                    React.createElement(CRMBarChart, { data: techData, xKey: 'name', bars: [{ key: 'Jobs', color: '#1A1F36' }, { key: 'Done', color: '#10B981' }] })
                ),
                React.createElement(Card, null,
                    React.createElement('h3', { style: { fontSize: 15, fontWeight: 700, marginBottom: 16 } }, '📊 Demo vs Service'),
                    React.createElement(CRMPieChart, { data: typePieData, height: 280 })
                )
            )
        ),

        React.createElement(ConfirmModal, {
            isOpen: !!deleteId, onClose: () => setDeleteId(null),
            onConfirm: () => handleDelete(deleteId),
            title: 'Delete Service Entry', message: 'Delete this service request?'
        })
    );
};
