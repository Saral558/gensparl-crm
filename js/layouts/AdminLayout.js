// ============================================================
// ADMIN LAYOUT
// ============================================================

window.AdminLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { currentPage, navigate, sidebarOpen, setSidebarOpen } = useNav();

    const menu = [
        { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
        { id: 'sales', label: '🛒 Sales CRM', icon: '🛒' },
        { id: 'finance', label: '💳 Finance', icon: '💳' },
        { id: 'delivery', label: '🚚 Delivery', icon: '🚚' },
        { id: 'service', label: '🔧 Service', icon: '🔧' },
        { id: 'gifts', label: '🎁 Gift Box', icon: '🎁' },
        { id: 'expenses', label: '💸 Expenses', icon: '💸' },
        { id: 'transactions', label: '💰 Transactions', icon: '💰' },
        { id: 'staff', label: '👥 Staff', icon: '👥' },
    ];

    return React.createElement('div', { style: { display: 'flex', minHeight: '100vh', background: '#F8FAFC' } },
        // Sidebar
        React.createElement('aside', {
            className: 'sidebar sidebar-transition',
            style: {
                width: sidebarOpen ? 260 : 0,
                background: '#1A1F36',
                color: '#fff',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0, bottom: 0, left: 0,
                zIndex: 100,
                boxShadow: '4px 0 10px rgba(0,0,0,0.1)'
            }
        },
            // Logo
            React.createElement('div', { style: { padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' } },
                React.createElement('div', {
                    style: {
                        width: 40, height: 40, background: '#F59E0B', borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0
                    }
                }, 'DE'),
                React.createElement('div', { style: { whiteSpace: 'nowrap' } },
                    React.createElement('div', { style: { fontWeight: 700, fontSize: 16 } }, 'Dinesh Electronics'),
                    React.createElement('div', { style: { fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 } }, 'INTERNAL CRM')
                )
            ),

            // Navigation
            React.createElement('nav', { style: { padding: '20px 12px', flex: 1, overflowY: 'auto' } },
                menu.map(item =>
                    React.createElement('div', {
                        key: item.id,
                        className: `sidebar-link ${currentPage === item.id ? 'active' : ''}`,
                        onClick: () => navigate(item.id)
                    }, item.label)
                )
            ),

            // Profile
            React.createElement('div', { style: { padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' } },
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 } },
                    React.createElement('div', {
                        style: { width: 36, height: 36, background: '#F59E0B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }
                    }, user?.name?.[0] || 'A'),
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontSize: 14, fontWeight: 600 } }, user?.name || 'Admin'),
                        React.createElement('div', { style: { fontSize: 11, color: 'rgba(255,255,255,0.5)' } }, 'System Administrator')
                    )
                ),
                React.createElement('button', {
                    onClick: logout,
                    className: 'btn btn-sm btn-outline',
                    style: { width: '100%', justifyContent: 'center', borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }
                }, '🚪 Logout')
            )
        ),

        // Main Content
        React.createElement('main', {
            className: 'main-content',
            style: {
                marginLeft: sidebarOpen ? 260 : 0,
                flex: 1,
                padding: '24px',
                transition: 'all 0.3s ease',
                minWidth: 0
            }
        },
            // Top Header
            React.createElement('header', {
                style: {
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 24, padding: '0 4px'
                }
            },
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 16 } },
                    React.createElement('button', {
                        onClick: () => setSidebarOpen(!sidebarOpen),
                        style: { background: '#fff', border: '1px solid #E2E8F0', padding: 8, borderRadius: 8, cursor: 'pointer' }
                    }, sidebarOpen ? '◀️' : '▶️'),
                    React.createElement('div', { style: { fontWeight: 600, color: '#64748B', fontSize: 14 } },
                        'Pages / ' + (currentPage.charAt(0).toUpperCase() + currentPage.slice(1))
                    )
                ),
                React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'center' } },
                    React.createElement('div', { style: { textAlign: 'right', className: 'desktop-only' } },
                        React.createElement('div', { style: { fontSize: 14, fontWeight: 600 } }, new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })),
                        React.createElement('div', { style: { fontSize: 11, color: '#94A3B8' } }, 'Server Status: Online ✅')
                    )
                )
            ),

            children
        )
    );
};
