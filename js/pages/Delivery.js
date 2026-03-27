// ============================================================
// DELIVERY CRM MODULE
// ============================================================

const DELIVERY_STATUSES = ['Scheduled', 'Out for Delivery', 'Delivered', 'Failed', 'Rescheduled'];

window.DeliveryCRM = () => {
    const { user, isAdmin } = useAuth();
    const { showToast } = useToast();
    const [tab, setTab] = React.useState('dashboard');
    const [records, setRecords] = React.useState([]);
    const [editItem, setEditItem] = React.useState(null);
    const [deleteId, setDeleteId] = React.useState(null);
    const [search, setSearch] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('');
    const [viewPhoto, setViewPhoto] = React.useState(null);

    const [allDeliveryBoys, setAllDeliveryBoys] = React.useState([]);

    React.useEffect(() => {
        loadRecords();
        const fetchBoys = async () => {
            const users = await db.get('profiles');
            setAllDeliveryBoys(users.filter(u => u.role === 'delivery'));
        };
        fetchBoys();
    }, []);

    const loadRecords = async () => {
        const data = await db.get('deliveries');
        setRecords(data);
    };

    const defaultForm = {
        customer_name: '', mobile: '', location: '', delivery_date: todayStr(),
        product_details: '', total_amount: '', due_amount: '0',
        delivery_boy_id: '', delivery_boy_name: '', before_photo: null, after_photo: null,
        status: 'Scheduled', narration: ''
    };
    const [form, setForm] = React.useState(defaultForm);
    const [errors, setErrors] = React.useState({});

    const paidAmount = (parseFloat(form.total_amount) || 0) - (parseFloat(form.due_amount) || 0);

    const setField = (k, v) => {
        if (k === 'delivery_boy_id') {
            const u = allDeliveryBoys.find(u => u.id === v);
            setForm(f => ({ ...f, delivery_boy_id: v, delivery_boy_name: u ? u.name : '' }));
        } else {
            setForm(f => ({ ...f, [k]: v }));
        }
        setErrors(e => ({ ...e, [k]: '' }));
    };

    const handlePhotoUpload = (key, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            setForm(f => ({ ...f, [key]: e.target.result }));
            showToast('Photo uploaded ✅', 'success');
        };
        reader.readAsDataURL(file);
    };

    const validate = () => {
        const e = {};
        if (!form.customer_name || form.customer_name.length < 2) e.customer_name = 'Required';
        if (!form.mobile || !/^\d{10}$/.test(form.mobile)) e.mobile = 'Enter valid 10-digit mobile';
        if (!form.location) e.location = 'Address required';
        if (!form.delivery_date) e.delivery_date = 'Select delivery date';
        if (!form.product_details) e.product_details = 'Product details required';
        if (!form.total_amount || parseFloat(form.total_amount) <= 0) e.total_amount = 'Enter total amount';
        if (!form.delivery_boy_id) e.delivery_boy_id = 'Assign delivery boy';
        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); showToast('Please fix form errors', 'error'); return; }
        const record = {
            customer_name: form.customer_name,
            mobile: form.mobile,
            location: form.location,
            delivery_date: form.delivery_date,
            product_details: form.product_details,
            total_amount: parseFloat(form.total_amount),
            due_amount: parseFloat(form.due_amount) || 0,
            paid_amount: paidAmount,
            delivery_boy_id: form.delivery_boy_id,
            status: form.status || 'Scheduled',
            narration: form.narration,
            before_photo: form.before_photo,
            after_photo: form.after_photo
        };

        try {
            if (editItem) {
                await db.update('deliveries', editItem.id, record);
                showToast('Delivery record updated ✅', 'success');
            } else {
                await db.insert('deliveries', record);
                showToast('Delivery scheduled! 🚚', 'success');
            }
            setForm(defaultForm); setEditItem(null); await loadRecords(); setTab('list');
        } catch (err) {
            showToast('Error saving delivery', 'error');
        }
    };

    const updateStatus = async (id, status) => {
        await db.update('deliveries', id, { status });
        showToast(`Status → ${status}`, 'success');
        await loadRecords();
    };

    const handleDelete = async (id) => { 
        await db.delete('deliveries', id); 
        showToast('Delivery deleted', 'warning'); 
        await loadRecords(); 
        setDeleteId(null); 
    };

    const today = todayStr();
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];

    // Dashboard data
    const overdue = records.filter(d => d.delivery_date < today && d.status !== 'Delivered' && d.status !== 'Failed');
    const todayDeliveries = records.filter(d => d.delivery_date === today);
    const todayCompleted = todayDeliveries.filter(d => d.status === 'Delivered');
    const upcoming = records.filter(d => d.delivery_date > today && d.status === 'Scheduled');

    // Filters for list
    let filtered = [...records];
    if (!isAdmin) filtered = filtered.filter(d => d.delivery_boy_id === user.id);
    if (search) filtered = filtered.filter(d => d.customer_name?.toLowerCase().includes(search.toLowerCase()) || d.mobile?.includes(search));
    if (statusFilter) filtered = filtered.filter(d => d.status === statusFilter);

    // Due amount collection
    const totalDue = records.reduce((s, d) => s + (d.due_amount || 0), 0);
    const collectedDue = records.filter(d => d.status === 'Delivered').reduce((s, d) => s + (d.due_amount || 0), 0);

    // Delivery boy performance
    const dboyMap = {};
    records.forEach(d => {
        const name = d.delivery_boy_name || 'Unassigned';
        if (!dboyMap[name]) dboyMap[name] = { name: name.split(' ')[0], Total: 0, Delivered: 0 };
        dboyMap[name].Total += 1;
        if (d.status === 'Delivered') dboyMap[name].Delivered += 1;
    });
    const dboyData = Object.values(dboyMap);

    return React.createElement('div', { className: 'fade-in' },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 } },
            React.createElement('div', null,
                React.createElement('h2', { style: { fontSize: 22, fontWeight: 700, fontFamily: 'Poppins' } }, '🚚 Delivery CRM'),
                React.createElement('p', { style: { fontSize: 13, color: '#64748B' } }, 'Schedule and track deliveries')
            ),
            React.createElement('button', { className: 'btn btn-accent', onClick: () => { setForm(defaultForm); setEditItem(null); setTab('form'); } }, '+ Schedule Delivery')
        ),

        React.createElement(Tabs, {
            tabs: [
                { value: 'dashboard', label: '📊 Dashboard' },
                { value: 'list', label: '📋 All Deliveries' },
                { value: 'form', label: editItem ? '✏️ Edit' : '➕ New' }
            ],
            active: tab, onChange: setTab
        }),

        // DASHBOARD
        tab === 'dashboard' && React.createElement('div', null,
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 } },
                React.createElement(StatCard, { icon: '🔴', label: 'Overdue', value: overdue.length, sub: 'Not delivered', color: 'red' }),
                React.createElement(StatCard, { icon: '📅', label: "Today's Deliveries", value: todayDeliveries.length, sub: `${todayCompleted.length} done`, color: 'blue' }),
                React.createElement(StatCard, { icon: '✅', label: 'Delivered Today', value: todayCompleted.length, color: 'green' }),
                React.createElement(StatCard, { icon: '🔵', label: 'Upcoming (3 days)', value: upcoming.length, color: 'navy' }),
            ),

            // Due amount summary
            React.createElement(Card, { style: { marginBottom: 20 } },
                React.createElement('h3', { style: { fontSize: 15, fontWeight: 700, marginBottom: 16 } }, '💰 Due Amount Collection'),
                React.createElement('div', { style: { display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12 } },
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontSize: 12, color: '#64748B' } }, 'Total Due'),
                        React.createElement('div', { className: 'mono', style: { fontSize: 22, fontWeight: 700, color: '#EF4444' } }, formatCurrency(totalDue))
                    ),
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontSize: 12, color: '#64748B' } }, 'Collected (Delivered)'),
                        React.createElement('div', { className: 'mono', style: { fontSize: 22, fontWeight: 700, color: '#10B981' } }, formatCurrency(collectedDue))
                    ),
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontSize: 12, color: '#64748B' } }, 'Pending Collection'),
                        React.createElement('div', { className: 'mono', style: { fontSize: 22, fontWeight: 700, color: '#F59E0B' } }, formatCurrency(totalDue - collectedDue))
                    )
                ),
                React.createElement(ProgressBar, { value: collectedDue, max: totalDue, color: '#10B981' })
            ),

            // Overdue list
            overdue.length > 0 && React.createElement(Card, { style: { marginBottom: 20, borderLeft: '4px solid #EF4444' } },
                React.createElement('h3', { style: { fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#EF4444' } }, '🔴 Overdue Deliveries'),
                overdue.map(d =>
                    React.createElement('div', { key: d.id, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #FEE2E2' } },
                        React.createElement('div', null,
                            React.createElement('div', { style: { fontWeight: 600 } }, d.customer_name),
                            React.createElement('div', { style: { fontSize: 12, color: '#94A3B8' } }, d.product_details),
                            React.createElement('div', { style: { fontSize: 11, color: '#EF4444' } }, 'Was: ' + formatDate(d.delivery_date))
                        ),
                        React.createElement('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
                            isAdmin && React.createElement('select', {
                                value: d.status,
                                onChange: e => updateStatus(d.id, e.target.value),
                                className: 'form-input', style: { padding: '4px 8px', fontSize: 12, width: 140 }
                            },
                                DELIVERY_STATUSES.map(s => React.createElement('option', { key: s, value: s }, s))
                            ),
                            d.due_amount > 0 && React.createElement('span', { className: 'mono', style: { color: '#EF4444', fontWeight: 600, fontSize: 13 } }, 'Due: ' + formatCurrency(d.due_amount))
                        )
                    )
                )
            ),

            // Today's + Upcoming
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 } },
                React.createElement(Card, null,
                    React.createElement('h3', { style: { fontSize: 15, fontWeight: 700, marginBottom: 12 } }, "📅 Today's Schedule"),
                    todayDeliveries.length === 0 ? React.createElement('p', { style: { color: '#94A3B8', fontSize: 13 } }, 'No deliveries today') :
                        todayDeliveries.map(d =>
                            React.createElement('div', { key: d.id, style: { padding: '8px 0', borderBottom: '1px solid #F1F5F9' } },
                                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between' } },
                                    React.createElement('span', { style: { fontWeight: 600, fontSize: 13 } }, d.customer_name),
                                    React.createElement(StatusBadge, { status: d.status })
                                ),
                                React.createElement('div', { style: { fontSize: 11, color: '#64748B' } }, truncate(d.product_details, 40))
                            )
                        )
                ),
                React.createElement(Card, null,
                    React.createElement('h3', { style: { fontSize: 15, fontWeight: 700, marginBottom: 12 } }, '🔵 Upcoming (3 Days)'),
                    upcoming.length === 0 ? React.createElement('p', { style: { color: '#94A3B8', fontSize: 13 } }, 'No upcoming deliveries') :
                        upcoming.slice(0, 5).map(d =>
                            React.createElement('div', { key: d.id, style: { padding: '8px 0', borderBottom: '1px solid #F1F5F9' } },
                                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between' } },
                                    React.createElement('span', { style: { fontWeight: 600, fontSize: 13 } }, d.customer_name),
                                    React.createElement('span', { style: { fontSize: 12, color: '#3B82F6' } }, formatDate(d.delivery_date))
                                ),
                                React.createElement('div', { style: { fontSize: 11, color: '#64748B' } }, truncate(d.product_details, 40))
                            )
                        )
                )
            ),

            // Delivery boy performance
            dboyData.length > 0 && React.createElement(Card, { style: { marginTop: 20 } },
                React.createElement('h3', { style: { fontSize: 15, fontWeight: 700, marginBottom: 16 } }, '🏆 Delivery Boy Performance'),
                React.createElement(CRMBarChart, { data: dboyData, xKey: 'name', bars: [{ key: 'Total', color: '#1A1F36' }, { key: 'Delivered', color: '#10B981' }] })
            )
        ),

        // LIST
        tab === 'list' && React.createElement('div', null,
            React.createElement('div', { style: { background: '#F8FAFC', padding: 12, borderRadius: 8, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' } },
                React.createElement(SearchInput, { value: search, onChange: setSearch, placeholder: 'Search customer...' }),
                React.createElement('select', {
                    value: statusFilter, onChange: e => setStatusFilter(e.target.value),
                    className: 'form-input', style: { width: 160 }
                },
                    React.createElement('option', { value: '' }, 'All Status'),
                    DELIVERY_STATUSES.map(s => React.createElement('option', { key: s, value: s }, s))
                )
            ),
            filtered.length === 0 ? React.createElement(EmptyState, { icon: '🚚', title: 'No deliveries', subtitle: 'Schedule a new delivery' }) :
                React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 } },
                    filtered.map(d =>
                        React.createElement(Card, { key: d.id, style: { borderLeft: `4px solid ${statusColors[d.status] || '#94A3B8'}` } },
                            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 } },
                                React.createElement('div', null,
                                    React.createElement('div', { style: { fontWeight: 700, fontSize: 15 } }, d.customer_name),
                                    React.createElement('div', { style: { fontSize: 12, color: '#64748B' } }, '📱 ' + d.mobile)
                                ),
                                React.createElement(StatusBadge, { status: d.status })
                            ),
                            React.createElement('div', { style: { fontSize: 12, color: '#475569', marginBottom: 6 } }, '📍 ' + truncate(d.location, 50)),
                            React.createElement('div', { style: { fontSize: 12, color: '#475569', marginBottom: 6 } }, '📦 ' + truncate(d.product_details, 50)),
                            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 } },
                                React.createElement('div', { style: { fontSize: 12 } },
                                    React.createElement('span', { style: { color: '#64748B' } }, '📅 '),
                                    React.createElement('strong', null, formatDate(d.delivery_date))
                                ),
                                React.createElement('div', null,
                                    React.createElement('span', { className: 'mono', style: { fontWeight: 700, color: '#1A1F36' } }, formatCurrency(d.total_amount)),
                                    d.due_amount > 0 && React.createElement('span', { className: 'mono', style: { color: '#EF4444', fontSize: 12 } }, ' • Due: ' + formatCurrency(d.due_amount))
                                )
                            ),
                            d.delivery_boy_name && React.createElement('div', { style: { fontSize: 12, color: '#64748B', marginBottom: 8 } }, '🚚 ' + d.delivery_boy_name),

                            // Photos
                            (d.before_photo || d.after_photo) && React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 10 } },
                                d.before_photo && React.createElement('div', { style: { textAlign: 'center' } },
                                    React.createElement('img', { src: d.before_photo, alt: 'Before', className: 'photo-preview', onClick: () => setViewPhoto(d.before_photo) }),
                                    React.createElement('div', { style: { fontSize: 10, color: '#94A3B8' } }, 'Before')
                                ),
                                d.after_photo && React.createElement('div', { style: { textAlign: 'center' } },
                                    React.createElement('img', { src: d.after_photo, alt: 'After', className: 'photo-preview', onClick: () => setViewPhoto(d.after_photo) }),
                                    React.createElement('div', { style: { fontSize: 10, color: '#94A3B8' } }, 'After')
                                )
                            ),

                            React.createElement('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
                                isAdmin && React.createElement('select', {
                                    value: d.status,
                                    onChange: e => updateStatus(d.id, e.target.value),
                                    className: 'form-input', style: { padding: '6px 8px', fontSize: 12, flex: 1 }
                                },
                                    DELIVERY_STATUSES.map(s => React.createElement('option', { key: s, value: s }, s))
                                ),
                                React.createElement('button', { className: 'btn btn-sm btn-outline', onClick: () => { setForm({ ...d, total_amount: d.total_amount?.toString(), due_amount: d.due_amount?.toString() }); setEditItem(d); setTab('form'); } }, '✏️'),
                                isAdmin && React.createElement('button', { className: 'btn btn-sm btn-danger', onClick: () => setDeleteId(d.id) }, '🗑️')
                            )
                        )
                    )
                )
        ),

        // FORM
        tab === 'form' && React.createElement(Card, null,
            React.createElement('h3', { style: { fontSize: 18, fontWeight: 700, marginBottom: 20 } }, editItem ? '✏️ Edit Delivery' : '➕ Schedule Delivery'),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 } },
                React.createElement(FormField, { label: 'Customer Name', required: true, error: errors.customer_name },
                    React.createElement(Input, { value: form.customer_name, onChange: v => setField('customer_name', v), error: errors.customer_name, placeholder: 'Full name' })
                ),
                React.createElement(FormField, { label: 'Mobile Number', required: true, error: errors.mobile },
                    React.createElement(Input, { type: 'tel', value: form.mobile, onChange: v => setField('mobile', v), error: errors.mobile, placeholder: '10-digit' })
                ),
                React.createElement(FormField, { label: 'Delivery Date', required: true, error: errors.delivery_date },
                    React.createElement(Input, { type: 'date', value: form.delivery_date, onChange: v => setField('delivery_date', v), error: errors.delivery_date })
                ),
                React.createElement(FormField, { label: 'Total Amount (₹)', required: true, error: errors.total_amount },
                    React.createElement(Input, { type: 'number', value: form.total_amount, onChange: v => setField('total_amount', v), error: errors.total_amount })
                ),
                React.createElement(FormField, { label: 'Due Amount (₹)', required: false },
                    React.createElement(Input, { type: 'number', value: form.due_amount, onChange: v => setField('due_amount', v) })
                ),
                React.createElement(FormField, { label: 'Paid Amount (₹)', hint: 'Auto-calculated = Total − Due' },
                    React.createElement(Input, { value: formatCurrency(paidAmount), readOnly: true })
                ),
                React.createElement(FormField, { label: 'Delivery Boy', required: true, error: errors.delivery_boy_id },
                    React.createElement(Select, {
                        value: form.delivery_boy_id, onChange: v => setField('delivery_boy_id', v),
                        options: allDeliveryBoys.map(u => ({ value: u.id, label: u.name })),
                        placeholder: 'Assign delivery boy', error: errors.delivery_boy_id
                    })
                ),
                React.createElement(FormField, { label: 'Status' },
                    React.createElement(Select, { value: form.status, onChange: v => setField('status', v), options: DELIVERY_STATUSES })
                )
            ),
            React.createElement(FormField, { label: 'Delivery Address', required: true, error: errors.location },
                React.createElement(Textarea, { value: form.location, onChange: v => setField('location', v), error: errors.location, placeholder: 'Full delivery address...', rows: 2 })
            ),
            React.createElement(FormField, { label: 'Product Details', required: true, error: errors.product_details },
                React.createElement(Textarea, { value: form.product_details, onChange: v => setField('product_details', v), error: errors.product_details, placeholder: 'Product name, serial no, qty...', rows: 2 })
            ),
            React.createElement(FormField, { label: 'Narration' },
                React.createElement(Textarea, { value: form.narration, onChange: v => setField('narration', v), placeholder: 'Additional notes...' })
            ),

            // Photo uploads
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 } },
                React.createElement('div', null,
                    React.createElement('label', { className: 'form-label' }, '📷 Before Delivery Photo'),
                    React.createElement('input', {
                        type: 'file', accept: 'image/*',
                        onChange: e => handlePhotoUpload('before_photo', e.target.files[0]),
                        className: 'form-input', style: { padding: 8 }
                    }),
                    form.before_photo && React.createElement('img', { src: form.before_photo, alt: 'Before', style: { marginTop: 8, width: 100, height: 80, objectFit: 'cover', borderRadius: 8 } })
                ),
                React.createElement('div', null,
                    React.createElement('label', { className: 'form-label' }, '📷 After Delivery Photo'),
                    React.createElement('input', {
                        type: 'file', accept: 'image/*',
                        onChange: e => handlePhotoUpload('after_photo', e.target.files[0]),
                        className: 'form-input', style: { padding: 8 }
                    }),
                    form.after_photo && React.createElement('img', { src: form.after_photo, alt: 'After', style: { marginTop: 8, width: 100, height: 80, objectFit: 'cover', borderRadius: 8 } })
                )
            ),

            React.createElement('div', { style: { display: 'flex', gap: 12 } },
                React.createElement('button', { className: 'btn btn-primary', onClick: handleSubmit }, editItem ? '💾 Update' : '🚚 Schedule Delivery'),
                React.createElement('button', { className: 'btn btn-outline', onClick: () => { setTab('dashboard'); setEditItem(null); setForm(defaultForm); } }, 'Cancel')
            )
        ),

        // Photo viewer modal
        viewPhoto && React.createElement('div', {
            className: 'modal-overlay', onClick: () => setViewPhoto(null)
        },
            React.createElement('img', { src: viewPhoto, style: { maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' } })
        ),

        React.createElement(ConfirmModal, {
            isOpen: !!deleteId, onClose: () => setDeleteId(null),
            onConfirm: () => handleDelete(deleteId),
            title: 'Delete Delivery', message: 'Delete this delivery record?'
        })
    );
};
