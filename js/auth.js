// ============================================================
// AUTH.JS — Authentication Context & Provider
// ============================================================

const _AuthReact = React;
const _createContext = _AuthReact.createContext;
const _useContext = _AuthReact.useContext;
const _useStateAuth = _AuthReact.useState;
const _useEffectAuth = _AuthReact.useEffect;

// Auth Context
window.AuthContext = _createContext(null);

window.AuthProvider = ({ children }) => {
    const [user, setUser] = _useStateAuth(null);
    const [error, setError] = _useStateAuth(null);
    const [loading, setLoading] = _useStateAuth(true);

    _useEffectAuth(() => {
        // Check active sessions and subscribe to auth changes
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Fetch profile data
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                setUser(profile || { id: session.user.id, name: session.user.email, role: 'sales' });
            }
            setLoading(false);
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                setUser(profile || { id: session.user.id, name: session.user.email, role: 'sales' });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (staffId, password) => {
        setLoading(true);
        setError(null);
        try {
            // Map 6-digit ID to synthetic email
            const email = `${staffId}@dineshcrm.com`;
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            
            // Fetch profile data
            const { data: profile, error: pError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
            
            if (pError) console.error('Error fetching profile:', pError);
            
            const userData = { ...data.user, ...profile };
            setUser(userData);
            return userData;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (email, password, metadata) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: metadata }
            });
            if (error) throw error;
            showToast('Account created! Please check your email.', 'success');
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return React.createElement(AuthContext.Provider, {
        value: { user, login, logout, loading, error, register, isAdmin: user?.role === 'admin' } // Updated value prop
    }, children);
};

window.useAuth = () => _useContext(AuthContext);

// Toast Context
window.ToastContext = _createContext(null);

window.ToastProvider = ({ children }) => {
    const [toasts, setToasts] = _useStateAuth([]);

    const showToast = (message, type = 'success') => {
        const id = genId();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    };

    return React.createElement(ToastContext.Provider, { value: { showToast } },
        children,
        React.createElement(ToastContainer, { toasts })
    );
};

window.useToast = () => _useContext(ToastContext);

// Navigation Context
window.NavContext = _createContext(null);

window.NavProvider = ({ children }) => {
    const [currentPage, setCurrentPage] = _useStateAuth('dashboard');
    const [sidebarOpen, setSidebarOpen] = _useStateAuth(true);

    const navigate = (page) => setCurrentPage(page);

    return React.createElement(NavContext.Provider, {
        value: { currentPage, navigate, sidebarOpen, setSidebarOpen }
    }, children);
};

window.useNav = () => _useContext(NavContext);
