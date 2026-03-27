// ============================================================
// APP.JS — Main Application Entry Point
// ============================================================

const { useState: useStateApp, useEffect: useEffectApp } = React;

// ---- MAIN APP ROUTER ----
const AppRouter = () => {
    const { user, loading } = useAuth();
    const { currentPage, navigate } = useNav();

    // Set default page based on role
    useEffectApp(() => {
        if (user) {
            if (user.role === 'admin') navigate('dashboard');
            else if (user.role === 'sales') navigate('sales');
            else if (user.role === 'delivery') navigate('delivery');
            else if (user.role === 'service') navigate('service');
        }
    }, [user]);

    if (loading) {
        return React.createElement('div', {
            style: {
                height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#1A1F36', flexDirection: 'column', gap: 16
            }
        },
            React.createElement('div', {
                style: {
                    width: 60, height: 60, background: '#F59E0B', borderRadius: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: 'Poppins'
                }
            }, 'DE'),
            React.createElement('div', { style: { color: 'rgba(255,255,255,0.5)', fontSize: 14 } }, 'Loading CRM...')
        );
    }

    if (!user) {
        return React.createElement(LoginPage);
    }

    // Route pages
    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard': return React.createElement(Dashboard);
            case 'sales': return React.createElement(SalesCRM);
            case 'finance': return React.createElement(FinanceCRM);
            case 'gifts': return React.createElement(GiftBoxCRM);
            case 'expenses': return React.createElement(ExpenseCRM);
            case 'service': return React.createElement(ServiceCRM);
            case 'delivery': return React.createElement(DeliveryCRM);
            case 'transactions': return React.createElement(Transactions);
            case 'staff': return React.createElement(StaffManagement);
            default: return React.createElement(Dashboard);
        }
    };

    // Admin layout
    if (user.role === 'admin') {
        return React.createElement(AdminLayout, null, renderPage());
    }

    // Staff layout (sales, delivery, service)
    return React.createElement(StaffLayout, null, renderPage());
};

// ---- ROOT APP ----
const App = () => {
    return React.createElement(AuthProvider, null,
        React.createElement(ToastProvider, null,
            React.createElement(NavProvider, null,
                React.createElement(AppRouter)
            )
        )
    );
};

// ---- MOUNT ----
const rootElement = document.getElementById('root');
ReactDOM.render(React.createElement(App), rootElement);
