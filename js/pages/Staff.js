// ============================================================
// STAFF MANAGEMENT MODULE (Admin only)
// ============================================================

const ROLES = ['admin', 'sales', 'delivery', 'service', 'finance', 'expense', 'inventory', 'gift_box', 'delivery_manager'];
const ROLE_COLORS = {
    admin: { bg: '#EEF2FF', color: '#4338CA', label: '👑 Admin' },
    sales: { bg: '#FFF7ED', color: '#c2410c', label: '🛒 Sales' },
    delivery: { bg: '#F0FDF4', color: '#15803d', label: '🚚 Delivery' },
    service: { bg: '#EFF6FF', color: '#1d4ed8', label: '🔧 Service' },
    finance: { bg: '#FEFCE8', color: '#854d0e', label: '💸 Finance' },
    expense: { bg: '#FEF2F2', color: '#991b1b', label: '📉 Expense' },
    inventory: { bg: '#F8FAFC', color: '#334155', label: '📦 Inventory' },
    gift_box: { bg: '#FAF5FF', color: '#6b21a8', label: '🎁 Gift Box' },
    delivery_manager: { bg: '#ECFEFF', color: '#0e7490', label: '🚚 Logistics Admin' },
};

window.StaffManagement = () => {
    const { user, isAdmin } = useAuth();
    const { showToast } = useToast();
    const [staff, setStaff] = React.useState([]);
    const [showForm, setShowForm] = React.useState(false);
    const [editItem, setEditItem] = React.useState(null);
    const [deleteId, setDeleteId] = React.useState(null);
    const [search, setSearch] = React.useState('');

    React.useEffect(() => { loadStaff(); }, []);
    const loadStaff = async () => {
        const { data, error } = await window.supabase.from('profiles').select('*').eq('active', true);
        if (error) {
            console.error("Database error loading users:", error);
            showToast('Failed to load users', 'error');
            setStaff([]);
        } else {
            setStaff(data || []);
        }
    };

    const defaultForm = { name: '', username: '', mobile: '', role: 'sales', password: '', active: true };
    const [form, setForm] = React.useState(defaultForm);
    const [errors, setErrors] = React.useState({});
    const [allSales, setAllSales] = React.useState([]);

    React.useEffect(() => {
        const fetchSales = async () => {
            const data = await db.get('sales');
            setAllSales(data);
        };
        fetchSales();
    }, []);

    const setField = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

    const validate = () => {
        const e = {};
        if (!form.name || form.name.length < 2) e.name = 'Name required (min 2 chars)';
        if (!form.username || form.username.length < 3) e.username = 'Username required (min 3 chars)';
        if (!form.mobile || !/^\d{10}$/.test(form.mobile)) e.mobile = 'Enter valid 10-digit mobile';
        if (!form.role) e.role = 'Select role';
        if (!editItem && (!form.password || form.password.length < 4)) e.password = 'Password required (min 4 chars)';
        // Check username uniqueness
        if (!editItem) {
            const existing = staff.find(s => s.username === form.username.toLowerCase().trim());
            if (existing) e.username = 'Username already exists';
        }
        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); showToast('Please fix form errors', 'error'); return; }
        const record = {
            ...form,
            username: form.username.toLowerCase().trim(),
            active: form.active !== false
        };
        
        try {
            if (editItem) {
                // Don't overwrite password if empty
                if (!form.password) delete record.password;
                await db.update('profiles', editItem.id, record);
                showToast('Staff updated ✅', 'success');
            } else {
                if (!record.password) { showToast('Password required', 'error'); return; }
                await db.insert('profiles', record);
                showToast('Staff added! 👤', 'success');
            }
            setForm(defaultForm); setEditItem(null); setShowForm(false); await loadStaff();
        } catch (err) {
            showToast('Error saving staff', 'error');
        }
    };

    const toggleActive = async (id, active) => {
        await db.update('profiles', id, { active: !active });
        showToast(!active ? 'Staff activated ✅' : 'Staff deactivated ⚠️', !active ? 'success' : 'warning');
        await loadStaff();
    };

    const handleDelete = async (userId) => {
        if (!isAdmin) {
            showToast('Access Denied', 'error');
            return;
        }
        
        try {
            const { error } = await window.supabase
                .from('profiles')
                .update({ active: false })
                .eq('id', userId);
                
            if (error) {
                console.error("Supabase update error:", error);
                showToast('Deactivation failed: ' + error.message, 'error');
                return;
            }
            showToast('User deactivated', 'success');
            await loadStaff();
        } catch (err) {
            console.error("Unexpected error during soft delete:", err);
            showToast('Failed to deactivate user: ' + err.message, 'error');
        } finally {
            setDeleteId(null);
        }
    };

    let filtered = staff.filter(s => s.id !== 'u1' || isAdmin); // always show all
    if (search) filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.username?.toLowerCase().includes(search.toLowerCase()) ||
        s.role?.toLowerCase().includes(search.toLowerCase())
    );

    // Stats
    const activeCount = staff.filter(s => s.active !== false).length;
    const salesCount = staff.filter(s => s.role === 'sales').length;
    const deliveryCount = staff.filter(s => s.role === 'delivery').length;
    const serviceCount = staff.filter(s => s.role === 'service').length;

    // Activity: recent sales per user
    const salesByUser = {};
    if (allSales) {
        allSales.forEach(s => { salesByUser[s.salesboy_id] = (salesByUser[s.salesboy_id] || 0) + 1; });
    }

    return React.createElement('div', { className: 'fade-in' },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 } },
            React.createElement('div', null,
                React.createElement('h2', { style: { fontSize: 22, fontWeight: 700, fontFamily: 'Poppins' } }, '👥 Staff Management'),
                React.createElement('p', { style: { fontSize: 13, color: '#64748B' } }, 'Manage team members and access')
            ),
            React.createElement('button', {
                className: 'btn btn-accent',
                onClick: () => { setForm(defaultForm); setEditItem(null); setShowForm(true); }
            }, '+ Add Staff')
        ),

        // Stats
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 20 } },
            React.createElement(StatCard, { icon: '👥', label: 'Total Staff', value: staff.length, color: 'navy' }),
            React.createElement(StatCard, { icon: '✅', label: 'Active', value: activeCount, color: 'green' }),
            React.createElement(StatCard, { icon: '🛒', label: 'Sales Team', value: salesCount, color: 'amber' }),
            React.createElement(StatCard, { icon: '🚚', label: 'Delivery', value: deliveryCount, color: 'blue' }),
            React.createElement(StatCard, { icon: '🔧', label: 'Service', value: serviceCount, color: 'purple' }),
        ),

        // Search
        React.createElement('div', { style: { marginBottom: 16 } },
            React.createElement(SearchInput, { value: search, onChange: setSearch, placeholder: 'Search staff by name, username, role...' })
        ),

        // Staff cards grid
        filtered.length === 0 ? React.createElement(EmptyState, { icon: '👥', title: 'No staff found' }) :
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 } },
                filtered.map(s => {
                    const roleStyle = ROLE_COLORS[s.role] || { bg: '#F1F5F9', color: '#475569', label: s.role };
                    const totalSales = salesByUser[s.id] || 0;
                    const isInactive = s.active === false;

                    return React.createElement(Card, { key: s.id, style: { opacity: isInactive ? 0.65 : 1, position: 'relative' } },
                        // Active indicator
                        React.createElement('div', {
                            style: {
                                position: 'absolute', top: 16, right: 16, width: 10, height: 10,
                                borderRadius: '50%', background: isInactive ? '#EF4444' : '#10B981'
                            }
                        }),

                        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 } },
                            React.createElement('div', {
                                style: {
                                    width: 52, height: 52, background: '#1A1F36', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 20, fontWeight: 700, color: '#F59E0B', flexShrink: 0
                                }
                            }, s.name?.[0]?.toUpperCase() || '?'),
                            React.createElement('div', null,
                                React.createElement('div', { style: { fontWeight: 700, fontSize: 15 } }, s.name),
                                React.createElement('div', { style: { fontSize: 12, color: '#64748B' } }, '@' + s.username),
                                React.createElement('div', { style: { fontSize: 12, color: '#64748B' } }, '📱 ' + s.mobile)
                            )
                        ),

                        React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 } },
                            React.createElement('span', {
                                style: { background: roleStyle.bg, color: roleStyle.color, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }
                            }, roleStyle.label),
                            isInactive && React.createElement('span', { style: { background: '#FEE2E2', color: '#dc2626', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600 } }, 'Inactive')
                        ),

                        // Stats row
                        React.createElement('div', { style: { background: '#F8FAFC', borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between' } },
                            React.createElement('div', { style: { textAlign: 'center' } },
                                React.createElement('div', { style: { fontSize: 16, fontWeight: 700, color: '#1A1F36' } }, totalSales),
                                React.createElement('div', { style: { fontSize: 10, color: '#94A3B8' } }, 'Total Sales')
                            ),
                            React.createElement('div', { style: { textAlign: 'center' } },
                                React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: '#64748B' } }, s.role.charAt(0).toUpperCase() + s.role.slice(1)),
                                React.createElement('div', { style: { fontSize: 10, color: '#94A3B8' } }, 'Role')
                            ),
                            React.createElement('div', { style: { textAlign: 'center' } },
                                React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: s.active !== false ? '#10B981' : '#EF4444' } }, s.active !== false ? 'Active' : 'Inactive'),
                                React.createElement('div', { style: { fontSize: 10, color: '#94A3B8' } }, 'Status')
                            )
                        ),

                        // Actions
                        React.createElement('div', { style: { display: 'flex', gap: 8 } },
                            React.createElement('button', {
                                className: 'btn btn-sm btn-outline',
                                onClick: () => {
                                    setForm({ ...s, password: '' });
                                    setEditItem(s);
                                    setShowForm(true);
                                },
                                style: { flex: 1, justifyContent: 'center' }
                            }, '✏️ Edit'),
                            React.createElement('button', {
                                className: `btn btn-sm ${isInactive ? 'btn-success' : 'btn-outline'}`,
                                onClick: () => toggleActive(s.id, s.active !== false),
                                style: { flex: 1, justifyContent: 'center' }
                            }, isInactive ? '✅ Activate' : '⏸ Deactivate'),
                            (s.id !== user.id && isAdmin) && React.createElement('button', {
                                className: 'btn btn-sm btn-danger',
                                onClick: () => setDeleteId(s.id)
                            }, '🗑️')
                        )
                    );
                })
            ),

        // Add/Edit Modal
        React.createElement(Modal, {
            isOpen: showForm,
            onClose: () => { setShowForm(false); setEditItem(null); setForm(defaultForm); },
            title: editItem ? '✏️ Edit Staff' : '➕ Add New Staff',
            size: 'md'
        },
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } },
                React.createElement(FormField, { label: 'Full Name', required: true, error: errors.name },
                    React.createElement(Input, { value: form.name, onChange: v => setField('name', v), placeholder: 'Full name', error: errors.name })
                ),
                React.createElement(FormField, { label: 'Username', required: true, error: errors.username },
                    React.createElement(Input, { value: form.username, onChange: v => setField('username', v), placeholder: 'Login username', error: errors.username })
                ),
                React.createElement(FormField, { label: 'Mobile No', required: true, error: errors.mobile },
                    React.createElement(Input, { type: 'tel', value: form.mobile, onChange: v => setField('mobile', v), placeholder: '10-digit mobile', error: errors.mobile })
                ),
                React.createElement(FormField, { label: 'Role', required: true, error: errors.role },
                    React.createElement(Select, { value: form.role, onChange: v => setField('role', v), options: ROLES.map(r => ({ value: r, label: ROLE_COLORS[r]?.label || r })) })
                ),
                React.createElement(FormField, { label: editItem ? 'New Password (leave blank to keep)' : 'Password', required: !editItem, error: errors.password },
                    React.createElement(Input, { type: 'password', value: form.password, onChange: v => setField('password', v), placeholder: editItem ? 'Leave blank to keep current' : 'Min 4 chars', error: errors.password })
                ),
                React.createElement(FormField, { label: 'Status' },
                    React.createElement('div', { style: { display: 'flex', gap: 12, paddingTop: 8 } },
                        ['Active', 'Inactive'].map(s =>
                            React.createElement('label', { key: s, style: { display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 } },
                                React.createElement('input', {
                                    type: 'radio', name: 'active_status',
                                    checked: s === 'Active' ? form.active !== false : form.active === false,
                                    onChange: () => setField('active', s === 'Active'),
                                    style: { width: 16, height: 16, accentColor: '#1A1F36' }
                                }),
                                s
                            )
                        )
                    )
                )
            ),
            React.createElement('div', { style: { display: 'flex', gap: 12, marginTop: 8 } },
                React.createElement('button', { className: 'btn btn-primary', onClick: handleSubmit }, editItem ? '💾 Update Staff' : '👤 Add Staff'),
                React.createElement('button', { className: 'btn btn-outline', onClick: () => { setShowForm(false); setEditItem(null); setForm(defaultForm); } }, 'Cancel')
            )
        ),

        React.createElement(ConfirmModal, {
            isOpen: !!deleteId, onClose: () => setDeleteId(null),
            onConfirm: () => handleDelete(deleteId),
            title: 'Remove Staff', message: 'Are you sure you want to remove this staff member? This cannot be undone.'
        })
    );
};
