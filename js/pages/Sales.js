// ============================================================
// SALES CRM MODULE
// ============================================================

const PRODUCTS = ['TV', 'AC - Split', 'AC - Window', 'Refrigerator', 'Washing Machine', 'Laptop', 'Mobile', 'Fan', 'Cooler', 'Microwave', 'Dishwasher', 'Other'];
const PAYMENT_MODES = ['Cash', 'UPI', 'Card', 'Finance'];
const LOCATIONS = ['Patna', 'Danapur', 'Boring Road', 'Kankarbagh', 'Bailey Road', 'Rajendra Nagar', 'Frazer Road', 'Ashok Rajpath', 'Khagaul', 'Patna City', 'Gardanibagh', 'Bankipur', 'Kurji', 'Mithapur', 'Other'];

window.SalesCRM = () => {
    const { user, isAdmin } = useAuth();
    const { showToast } = useToast();
    const { navigate } = useNav();
    const [tab, setTab] = React.useState('list');
    const [sales, setSales] = React.useState([]);
    const [editItem, setEditItem] = React.useState(null);
    const [deleteId, setDeleteId] = React.useState(null);
    const [dateFilter, setDateFilter] = React.useState('today');
    const [search, setSearch] = React.useState('');
    const [paymentFilter, setPaymentFilter] = React.useState('');
    const [salesboyFilter, setSalesboyFilter] = React.useState('');

    React.useEffect(() => {
        loadSales();
    }, []);

    const loadSales = async () => {
        const data = await db.get('sales');
        setSales(data);
    };

    // Form state
    const defaultForm = { customer_name: '', mobile: '', location: '', product_name: '', serial_no: '', quantity: 1, amount: '', payment_mode: 'Cash', narration: '' };
    const [form, setForm] = React.useState(defaultForm);
    const [errors, setErrors] = React.useState({});

    const setField = (key, val) => {
        setForm(f => ({ ...f, [key]: val }));
        setErrors(e => ({ ...e, [key]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.customer_name || form.customer_name.length < 2) e.customer_name = 'Min 2 characters required';
        if (!form.mobile || !/^\d{10}$/.test(form.mobile)) e.mobile = 'Enter valid 10-digit mobile';
        if (!form.location) e.location = 'Location is required';
        if (!form.product_name) e.product_name = 'Product name is required';
        if (!form.serial_no) e.serial_no = 'Serial number is required';
        if (!form.quantity || form.quantity < 1) e.quantity = 'Quantity must be at least 1';
        if (!form.amount || parseFloat(form.amount) <= 0) e.amount = 'Enter valid amount';
        if (!form.payment_mode) e.payment_mode = 'Select payment mode';
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
            quantity: parseInt(form.quantity),
            amount: parseFloat(form.amount),
            payment_mode: form.payment_mode,
            narration: form.narration,
            salesboy_id: user.id
        };

        try {
            if (editItem) {
                await db.update('sales', editItem.id, record);
                showToast('Entry updated successfully ✅', 'success');
            } else {
                await db.insert('sales', record);
                showToast('Entry saved to CRM! 🛒', 'success');
            }
            setForm(defaultForm);
            setEditItem(null);
            await loadSales();
            setTab('list');
        } catch (err) {
            showToast('Error saving sale', 'error');
        }
    };

    const handleEdit = (item) => {
        setForm({ ...item });
        setEditItem(item);
        setTab('form');
    };

    const handleDelete = async (id) => {
        await db.delete('sales', id);
        showToast('Sale deleted', 'warning');
        await loadSales();
        setDeleteId(null);
    };

    // Filter sales
    const { start, end } = getDateRange(dateFilter);
    let filtered = filterByDateRange(sales, 'created_at', start, end);
    if (!isAdmin) filtered = filtered.filter(s => s.salesboy_id === user.id);
    if (search) filtered = filtered.filter(s =>
        s.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.product_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.mobile?.includes(search)
    );
    if (paymentFilter) filtered = filtered.filter(s => s.payment_mode === paymentFilter);
    if (salesboyFilter) filtered = filtered.filter(s => s.salesboy_name === salesboyFilter);

    // Analytics
    const totalRevenue = filtered.reduce((s, r) => s + (r.amount || 0), 0);
    const totalQty = filtered.reduce((s, r) => s + (r.quantity || 0), 0);

    // Salesboy data for chart
    const salesboyMap = {};
    filtered.forEach(s => {
        if (!salesboyMap[s.salesboy_name]) salesboyMap[s.salesboy_name] = { name: s.salesboy_name.split(' ')[0], Revenue: 0, Sales: 0 };
        salesboyMap[s.salesboy_name].Revenue += s.amount || 0;
        salesboyMap[s.salesboy_name].Sales += 1;
    });
    const salesboyData = Object.values(salesboyMap);

    // Payment split
    const paymentMap = {};
    filtered.forEach(s => { paymentMap[s.payment_mode] = (paymentMap[s.payment_mode] || 0) + (s.amount || 0); });
    const paymentPieData = Object.entries(paymentMap).map(([name, value]) => ({ name, value, color: paymentColors[name] }));

    // Product data
    const productMap = {};
    filtered.forEach(s => { productMap[s.product_name] = (productMap[s.product_name] || 0) + (s.amount || 0); });
    const productData = Object.entries(productMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, Revenue]) => ({ name: name.split(' ')[0], Revenue }));

    const allStaff = [...new Set(sales.map(s => s.salesboy_name).filter(Boolean))];

    return React.createElement('div', { className: 'fade-in' },
        // Header
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 } },
            React.createElement('div', null,
                React.createElement('h2', { style: { fontSize: 22, fontWeight: 700, fontFamily: 'Poppins' } }, '🛒 Sales CRM'),
                React.createElement('p', { style: { fontSize: 13, color: '#64748B' } }, 'Manage and track all sales')
            ),
            React.createElement('button', {
                className: 'btn btn-accent',
                onClick: () => { setForm(defaultForm); setEditItem(null); setTab('form'); }
            }, '+ New Sale')
        ),

        // Tabs
        React.createElement(Tabs, {
            tabs: [
                { value: 'list', label: '📋 Sales List' },
                ...(isAdmin ? [{ value: 'analytics', label: '📊 Analytics' }] : [])
            ],
            active: tab,
            onChange: setTab
        }),

        // LIST TAB
        tab === 'list' && React.createElement('div', null,
            // Stats row
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 } },
                React.createElement(StatCard, { icon: '💰', label: 'Total Revenue', value: formatCurrency(totalRevenue), color: 'amber' }),
                React.createElement(StatCard, { icon: '📦', label: 'Total Quantity', value: totalQty, color: 'blue' }),
                React.createElement(StatCard, { icon: '🧾', label: 'Total Entries', value: filtered.length, color: 'navy' }),
            ),

            // Filters
            React.createElement('div', { style: { background: '#F8FAFC', padding: 16, borderRadius: 8, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' } },
                React.createElement(DateFilterTabs, { active: dateFilter, onChange: setDateFilter }),
                React.createElement(SearchInput, { value: search, onChange: setSearch, placeholder: 'Search customer, product...' }),
                React.createElement('select', {
                    value: paymentFilter, onChange: e => setPaymentFilter(e.target.value),
                    className: 'form-input', style: { width: 140 }
                },
                    React.createElement('option', { value: '' }, 'All Payments'),
                    PAYMENT_MODES.map(m => React.createElement('option', { key: m, value: m }, m))
                ),
                isAdmin && React.createElement('select', {
                    value: salesboyFilter, onChange: e => setSalesboyFilter(e.target.value),
                    className: 'form-input', style: { width: 160 }
                },
                    React.createElement('option', { value: '' }, 'All Salesboys'),
                    allStaff.map(s => React.createElement('option', { key: s, value: s }, s))
                ),
                React.createElement('button', {
                    className: 'btn btn-outline btn-sm',
                    onClick: () => exportToCSV(filtered, 'sales_export')
                }, '📥 Export CSV')
            ),

            // Table
            filtered.length === 0 ? React.createElement(EmptyState, { icon: '🛒', title: 'No sales found', subtitle: 'Try adjusting filters or add a new sale' }) :
                React.createElement('div', { style: { overflowX: 'auto' } },
                    React.createElement(Card, null,
                        React.createElement('table', { className: 'data-table' },
                            React.createElement('thead', null,
                                React.createElement('tr', null,
                                    ['#', 'Customer', 'Product', 'Serial No', 'Qty', 'Amount', 'Payment', 'Salesboy', 'Date', 'Actions'].map(h =>
                                        React.createElement('th', { key: h }, h)
                                    )
                                )
                            ),
                            React.createElement('tbody', null,
                                filtered.map((s, i) =>
                                    React.createElement('tr', { key: s.id },
                                        React.createElement('td', null, React.createElement('span', { className: 'mono', style: { fontSize: 11, color: '#94A3B8' } }, i + 1)),
                                        React.createElement('td', null,
                                            React.createElement('div', { style: { fontWeight: 600, fontSize: 13 } }, s.customer_name),
                                            React.createElement('div', { style: { fontSize: 11, color: '#94A3B8' } }, s.mobile),
                                            React.createElement('div', { style: { fontSize: 11, color: '#64748B' } }, '📍 ' + s.location)
                                        ),
                                        React.createElement('td', null,
                                            React.createElement('div', { style: { fontWeight: 500 } }, truncate(s.product_name, 22)),
                                        ),
                                        React.createElement('td', null, React.createElement('span', { className: 'mono', style: { fontSize: 12 } }, s.serial_no)),
                                        React.createElement('td', null, React.createElement('span', { style: { fontWeight: 600 } }, s.quantity)),
                                        React.createElement('td', null,
                                            React.createElement('span', { className: 'mono', style: { fontWeight: 700, color: '#10B981', fontSize: 14 } }, formatCurrency(s.amount))
                                        ),
                                        React.createElement('td', null, React.createElement(PaymentBadge, { mode: s.payment_mode })),
                                        React.createElement('td', null,
                                            React.createElement('span', { style: { fontSize: 12, background: '#F1F5F9', padding: '2px 8px', borderRadius: 4 } }, s.salesboy_name)
                                        ),
                                        React.createElement('td', null, React.createElement('span', { style: { fontSize: 11, color: '#64748B' } }, formatDateTime(s.created_at))),
                                        isAdmin && React.createElement('td', null,
                                            React.createElement('div', { style: { display: 'flex', gap: 6 } },
                                                React.createElement('button', {
                                                    className: 'btn btn-sm btn-outline', onClick: () => handleEdit(s)
                                                }, '✏️'),
                                                React.createElement('button', {
                                                    className: 'btn btn-sm btn-danger', onClick: () => setDeleteId(s.id)
                                                }, '🗑️')
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
        ),

        // FORM TAB
        tab === 'form' && React.createElement(Card, null,
            React.createElement('h3', { style: { fontSize: 18, fontWeight: 700, marginBottom: 20 } },
                editItem ? '✏️ Edit Sale' : '➕ New Sale Entry'
            ),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 } },
                React.createElement(FormField, { label: 'Customer Name', required: true, error: errors.customer_name },
                    React.createElement(Input, { value: form.customer_name, onChange: v => setField('customer_name', v), placeholder: 'Full name', error: errors.customer_name })
                ),
                React.createElement(FormField, { label: 'Mobile Number', required: true, error: errors.mobile },
                    React.createElement(Input, { type: 'tel', value: form.mobile, onChange: v => setField('mobile', v), placeholder: '10-digit mobile', error: errors.mobile })
                ),
                React.createElement(FormField, { label: 'Location', required: true, error: errors.location },
                    React.createElement(Select, { value: form.location, onChange: v => setField('location', v), options: LOCATIONS, placeholder: 'Select area', error: errors.location })
                ),
                React.createElement(FormField, { label: 'Product Name', required: true, error: errors.product_name },
                    React.createElement(Select, { value: form.product_name, onChange: v => setField('product_name', v), options: PRODUCTS, placeholder: 'Select product', error: errors.product_name })
                ),
                React.createElement(FormField, { label: 'Serial Number', required: true, error: errors.serial_no },
                    React.createElement(Input, { value: form.serial_no, onChange: v => setField('serial_no', v), placeholder: 'Product serial no', error: errors.serial_no })
                ),
                React.createElement(FormField, { label: 'Quantity', required: true, error: errors.quantity },
                    React.createElement(Input, { type: 'number', value: form.quantity, onChange: v => setField('quantity', v), error: errors.quantity })
                ),
                React.createElement(FormField, { label: 'Amount (₹)', required: true, error: errors.amount },
                    React.createElement(Input, { type: 'number', value: form.amount, onChange: v => setField('amount', v), placeholder: 'Sale amount', error: errors.amount })
                ),
                React.createElement(FormField, { label: 'Payment Mode', required: true, error: errors.payment_mode },
                    React.createElement(Select, { value: form.payment_mode, onChange: v => setField('payment_mode', v), options: PAYMENT_MODES, error: errors.payment_mode })
                )
            ),
            React.createElement(FormField, { label: 'Narration (Optional)' },
                React.createElement(Textarea, { value: form.narration, onChange: v => setField('narration', v), placeholder: 'Additional notes...' })
            ),
            // Auto fields info
            React.createElement('div', { style: { background: '#F8FAFC', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 12, color: '#64748B' } },
                `📋 Salesboy: ${user.name} | ⏰ Date/Time: Auto-filled on save`
            ),
            React.createElement('div', { style: { display: 'flex', gap: 12 } },
                React.createElement('button', { className: 'btn btn-primary', onClick: handleSubmit },
                    editItem ? '💾 Update Sale' : '✅ Save Sale'
                ),
                React.createElement('button', { className: 'btn btn-outline', onClick: () => { setTab('list'); setEditItem(null); setForm(defaultForm); } }, 'Cancel')
            )
        ),

        // ANALYTICS TAB (Admin only)
        tab === 'analytics' && isAdmin && React.createElement('div', null,
            React.createElement('div', { style: { marginBottom: 16 } },
                React.createElement(DateFilterTabs, { active: dateFilter, onChange: setDateFilter })
            ),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 } },
                React.createElement(Card, null,
                    React.createElement('h3', { style: { fontSize: 15, fontWeight: 700, marginBottom: 16 } }, '👥 Salesboy Performance'),
                    salesboyData.length > 0
                        ? React.createElement(CRMBarChart, { data: salesboyData, xKey: 'name', bars: [{ key: 'Revenue', name: 'Revenue (₹)', color: '#1A1F36' }], isCurrency: true })
                        : React.createElement('p', { style: { color: '#94A3B8', textAlign: 'center', padding: 20 } }, 'No data')
                ),
                React.createElement(Card, null,
                    React.createElement('h3', { style: { fontSize: 15, fontWeight: 700, marginBottom: 16 } }, '💳 Payment Mode Breakdown'),
                    paymentPieData.length > 0
                        ? React.createElement(CRMPieChart, { data: paymentPieData, height: 280, donut: true })
                        : React.createElement('p', { style: { color: '#94A3B8', textAlign: 'center', padding: 20 } }, 'No data')
                ),
                React.createElement(Card, null,
                    React.createElement('h3', { style: { fontSize: 15, fontWeight: 700, marginBottom: 16 } }, '📦 Top Products'),
                    productData.length > 0
                        ? React.createElement(CRMBarChart, { data: productData, xKey: 'name', bars: [{ key: 'Revenue', name: 'Revenue (₹)', color: '#F59E0B' }], isCurrency: true })
                        : React.createElement('p', { style: { color: '#94A3B8', textAlign: 'center', padding: 20 } }, 'No data')
                )
            )
        ),

        // Delete confirm modal
        React.createElement(ConfirmModal, {
            isOpen: !!deleteId, onClose: () => setDeleteId(null),
            onConfirm: () => handleDelete(deleteId),
            title: 'Delete Sale', message: 'Are you sure you want to delete this sale entry? This cannot be undone.'
        })
    );
};
