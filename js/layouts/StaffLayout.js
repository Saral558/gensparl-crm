// ============================================================
// STAFF LAYOUT (Mobile-first)
// ============================================================

window.StaffLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { currentPage, navigate } = useNav();

    const roleLinks = {
        sales: [
            { id: 'sales', label: '🛒 Sales', icon: '🛒' },
            { id: 'dashboard', label: '📊 Stats', icon: '📊' },
            { id: 'gifts', label: '🎁 Gifts', icon: '🎁' },
        ],
        delivery: [
            { id: 'delivery', label: '🚚 Delivery', icon: '🚚' },
            { id: 'dashboard', label: '📊 Stats', icon: '📊' },
        ],
        service: [
            { id: 'service', label: '🔧 Service', icon: '🔧' },
            { id: 'dashboard', label: '📊 Stats', icon: '📊' },
        ],
    };

    const links = roleLinks[user.role] || [{ id: 'dashboard', label: '📊 Home', icon: '🏠' }];

    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8FAFC' } },
        // Top Header
        React.createElement('header', {
            style: {
                padding: '16px 20px', background: '#1A1F36', color: '#fff',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100
            }
        },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                React.createElement('div', {
                    style: {
                        width: 32, height: 32, background: '#F59E0B', borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, fontWeight: 700, color: '#fff'
                    }
                }, 'DE'),
                React.createElement('div', { style: { fontWeight: 700, fontSize: 16 } }, 'Dinesh Electronics')
            ),
            React.createElement('button', {
                onClick: logout,
                style: { background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600 }
            }, '🚪 Logout')
        ),

        // Main Content
        React.createElement('main', {
            style: { flex: 1, padding: '20px', paddingBottom: '90px' }
        },
            // User Greeting
            React.createElement('div', { style: { marginBottom: 20 } },
                React.createElement('h2', { style: { fontSize: 20, fontWeight: 700, fontFamily: 'Poppins' } }, `👋 Hi, ${user.name.split(' ')[0]}`),
                React.createElement('p', { style: { fontSize: 13, color: '#64748B' } }, `Logged in as ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`)
            ),

            children
        ),

        // Bottom Navigation
        React.createElement('nav', { className: 'bottom-nav' },
            links.map(link =>
                React.createElement('div', {
                    key: link.id,
                    className: `bottom-nav-item ${currentPage === link.id ? 'active' : ''}`,
                    onClick: () => navigate(link.id)
                },
                    React.createElement('span', { style: { fontSize: 20 } }, link.icon),
                    React.createElement('span', null, link.label)
                )
            )
        )
    );
};
