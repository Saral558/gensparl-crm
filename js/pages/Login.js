// ============================================================
// LOGIN PAGE
// ============================================================

window.LoginPage = () => {
    const { login } = useAuth();
    const { showToast } = useToast();
    const [staffId, setStaffId] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!staffId.trim() || !password.trim()) {
            setError('Please enter Staff ID and password');
            return;
        }
        if (staffId.length < 4 || staffId.length > 5) {
            setError('Staff ID must be 4 digits');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await login(staffId.trim(), password);
            showToast('Welcome back! 👋', 'success');
        } catch (err) {
            setError(err.message || 'Login failed');
            showToast(err.message || 'Invalid credentials', 'error');
        } finally {
            setLoading(false);
        }
    };

    const quickLogin = async (id, p) => {
        setStaffId(id);
        setPassword(p);
        setLoading(true);
        try {
            await login(id, p);
            showToast('Logged in as Demo User', 'success');
        } catch (err) {
            setError(err.message);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return React.createElement('div', {
        style: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', fontFamily: 'Inter, sans-serif'
        }
    },
        React.createElement('div', { style: { width: '100%', maxWidth: 440 } },
            // Logo & Title
            React.createElement('div', { style: { textAlign: 'center', marginBottom: 36 } },
                React.createElement('div', {
                    style: {
                        width: 80, height: 80, background: '#6366F1', borderRadius: 20,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 16, boxShadow: '0 8px 24px rgba(99,102,241,0.4)'
                    }
                },
                    React.createElement('span', { style: { fontSize: 32 } }, '🔧')
                ),
                React.createElement('h1', { style: { color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 6 } }, 'Dinesh Electronics'),
                React.createElement('p', { style: { color: 'rgba(255,255,255,0.6)', fontSize: 14 } }, 'Production CRM System')
            ),

            // Login Card
            React.createElement('div', { style: { background: '#fff', borderRadius: 24, padding: 40, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' } },
                React.createElement('h2', { style: { fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 24 } }, 'Sign In'),

                React.createElement('form', { onSubmit: handleSubmit },
                    React.createElement('div', { style: { marginBottom: 20 } },
                        React.createElement('label', { style: { display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 } }, 'Staff ID (4 Digits)'),
                        React.createElement('input', {
                            type: 'text', value: staffId,
                            onChange: e => setStaffId(e.target.value.replace(/\D/g, '').slice(0, 6)),
                            placeholder: 'ID (e.g. 1001)',
                            style: { width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #E2E8F0', outline: 'none', transition: 'border-color 0.2s' },
                            className: 'focus-indigo'
                        })
                    ),
                    React.createElement('div', { style: { marginBottom: 24 } },
                        React.createElement('label', { style: { display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 } }, 'Password'),
                        React.createElement('input', {
                            type: 'password', value: password,
                            onChange: e => setPassword(e.target.value),
                            placeholder: '••••••••',
                            style: { width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #E2E8F0', outline: 'none' }
                        })
                    ),
                    error && React.createElement('div', { style: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px', marginBottom: 20 } },
                        React.createElement('p', { style: { color: '#EF4444', fontSize: 13, textAlign: 'center' } }, '⚠️ ' + error)
                    ),
                    React.createElement('button', {
                        type: 'submit', disabled: loading,
                        style: {
                            width: '100%', padding: '14px', borderRadius: 12, background: '#6366F1',
                            color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            boxShadow: '0 4px 12px rgba(99,102,241,0.2)'
                        }
                    }, loading ? 'Authenticating...' : 'Sign In Now')
                ),

                // Divider
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' } },
                    React.createElement('div', { style: { flex: 1, height: 1, background: '#F1F5F9' } }),
                    React.createElement('span', { style: { color: '#94A3B8', fontSize: 12, fontWeight: 500 } }, 'DEMO LOGINS'),
                    React.createElement('div', { style: { flex: 1, height: 1, background: '#F1F5F9' } })
                ),

                // Demo buttons
                React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 } },
                    [
                        { label: '👨‍💼 Admin', id: '1001', p: '123654' },
                        { label: '💼 Sales', id: '1005', p: '123654' },
                        { label: '🚚 Delivery', id: '1002', p: '123654' },
                        { label: '🔧 Service', id: '1003', p: '123654' }
                    ].map(u => 
                        React.createElement('button', {
                            key: u.id, onClick: () => quickLogin(u.id, u.p),
                            style: { padding: '10px', borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 12, color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }
                        }, u.label)
                    )
                ),

                React.createElement('p', { style: { textAlign: 'center', color: '#94A3B8', fontSize: 11, marginTop: 24 } },
                    '© 2026 Dinesh Electronics — Personnel only'
                )
            ),

            // Seeding Tool
            React.createElement('div', { style: { marginTop: 32, textAlign: 'center' } },
                React.createElement('p', { style: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 8 } }, 'First time setup?'),
                React.createElement('button', {
                    onClick: () => window.runSeed(),
                    style: { 
                        background: 'rgba(99,102,241,0.1)', 
                        border: '1px solid rgba(99,102,241,0.3)', 
                        color: '#818CF8', 
                        padding: '8px 16px',
                        borderRadius: 8,
                        fontSize: 12, 
                        fontWeight: 600,
                        cursor: 'pointer', 
                        transition: 'all 0.2s'
                    },
                    onMouseOver: e => e.target.style.background = 'rgba(99,102,241,0.2)',
                    onMouseOut: e => e.target.style.background = 'rgba(99,102,241,0.1)'
                }, '🚀 Initialize Production Backend')
            )
        )
    );
};
