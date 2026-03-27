// ============================================================
// COMMON COMPONENTS — Reusable UI pieces
// ============================================================

const { useState: useStateC, useEffect: useEffectC } = React;

// ---- STAT CARD ----
window.StatCard = ({ icon, label, value, sub, color, onClick, trend }) => {
    const colorMap = {
        blue: { bg: '#EFF6FF', icon: '#3B82F6', border: '#BFDBFE' },
        green: { bg: '#F0FDF4', icon: '#10B981', border: '#BBF7D0' },
        amber: { bg: '#FFFBEB', icon: '#F59E0B', border: '#FDE68A' },
        red: { bg: '#FEF2F2', icon: '#EF4444', border: '#FECACA' },
        purple: { bg: '#FAF5FF', icon: '#8B5CF6', border: '#DDD6FE' },
        navy: { bg: '#EEF2FF', icon: '#1A1F36', border: '#C7D2FE' },
    };
    const c = colorMap[color] || colorMap.blue;

    return React.createElement('div', {
        className: 'stat-card',
        onClick,
        style: { borderTop: `3px solid ${c.icon}` }
    },
        React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 } },
            React.createElement('div', { style: { fontSize: 24 } }, icon),
            trend && React.createElement('span', {
                style: { fontSize: 11, fontWeight: 600, color: trend > 0 ? '#10B981' : '#EF4444', background: trend > 0 ? '#F0FDF4' : '#FEF2F2', padding: '2px 8px', borderRadius: 999 }
            }, trend > 0 ? `↑ ${trend}%` : `↓ ${Math.abs(trend)}%`)
        ),
        React.createElement('div', { className: 'mono', style: { fontSize: 26, fontWeight: 700, color: '#0F172A', marginBottom: 4 } }, value),
        React.createElement('div', { style: { fontSize: 13, color: '#64748B', fontWeight: 500 } }, label),
        sub && React.createElement('div', { style: { fontSize: 11, color: '#94A3B8', marginTop: 4 } }, sub)
    );
};

// ---- SECTION HEADER ----
window.SectionHeader = ({ title, subtitle, actions }) => {
    return React.createElement('div', { className: 'section-header' },
        React.createElement('div', null,
            React.createElement('h2', { className: 'section-title' }, title),
            subtitle && React.createElement('p', { className: 'section-subtitle' }, subtitle)
        ),
        actions && React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'center' } }, ...actions)
    );
};

// ---- FORM FIELD ----
window.FormField = ({ label, required, error, children, hint }) => {
    return React.createElement('div', { className: 'input-group' },
        label && React.createElement('label', { className: 'form-label' },
            label,
            required && React.createElement('span', { className: 'required' }, ' *')
        ),
        children,
        error && React.createElement('p', { style: { fontSize: 12, color: '#EF4444', marginTop: 4 } }, error),
        hint && React.createElement('p', { style: { fontSize: 11, color: '#94A3B8', marginTop: 4 } }, hint)
    );
};

// ---- INPUT ----
window.Input = ({ type = 'text', value, onChange, placeholder, error, readOnly, className = '' }) => {
    return React.createElement('input', {
        type,
        value: value || '',
        onChange: e => onChange && onChange(e.target.value),
        placeholder,
        readOnly,
        className: `form-input ${error ? 'error' : ''} ${readOnly ? 'calc-field' : ''} ${className}`
    });
};

// ---- SELECT ----
window.Select = ({ value, onChange, options, placeholder, error }) => {
    return React.createElement('select', {
        value: value || '',
        onChange: e => onChange && onChange(e.target.value),
        className: `form-input ${error ? 'error' : ''}`
    },
        placeholder && React.createElement('option', { value: '' }, placeholder),
        options.map(opt =>
            typeof opt === 'string'
                ? React.createElement('option', { key: opt, value: opt }, opt)
                : React.createElement('option', { key: opt.value, value: opt.value }, opt.label)
        )
    );
};

// ---- TEXTAREA ----
window.Textarea = ({ value, onChange, placeholder, rows = 3, error }) => {
    return React.createElement('textarea', {
        value: value || '',
        onChange: e => onChange && onChange(e.target.value),
        placeholder,
        rows,
        className: `form-input ${error ? 'error' : ''}`,
        style: { resize: 'vertical' }
    });
};

// ---- STATUS BADGE ----
window.StatusBadge = ({ status }) => {
    return React.createElement('span', {
        className: `badge ${getStatusBadge(status)}`
    }, status);
};

// ---- PAYMENT BADGE ----
window.PaymentBadge = ({ mode }) => {
    return React.createElement('span', {
        className: `badge ${getPaymentBadge(mode)}`
    }, mode);
};

// ---- EMPTY STATE ----
window.EmptyState = ({ icon, title, subtitle, action }) => {
    return React.createElement('div', {
        style: { textAlign: 'center', padding: '60px 20px' }
    },
        React.createElement('div', { style: { fontSize: 48, marginBottom: 16 } }, icon || '📭'),
        React.createElement('h3', { style: { fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 8 } }, title || 'No data found'),
        subtitle && React.createElement('p', { style: { fontSize: 14, color: '#64748B', marginBottom: 20 } }, subtitle),
        action && React.createElement('button', {
            className: 'btn btn-primary',
            onClick: action.onClick
        }, action.label)
    );
};

// ---- SEARCH INPUT ----
window.SearchInput = ({ value, onChange, placeholder }) => {
    return React.createElement('div', { style: { position: 'relative' } },
        React.createElement('input', {
            type: 'text',
            value: value || '',
            onChange: e => onChange(e.target.value),
            placeholder: placeholder || 'Search...',
            className: 'form-input',
            style: { paddingLeft: 36 }
        }),
        React.createElement('span', {
            style: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 14 }
        }, '🔍')
    );
};

// ---- FILTER BAR ----
window.FilterBar = ({ filters, children }) => {
    return React.createElement('div', {
        style: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', padding: '16px', background: '#F8FAFC', borderRadius: 8, marginBottom: 16 }
    }, children);
};

// ---- DATE FILTER TABS ----
window.DateFilterTabs = ({ active, onChange }) => {
    const tabs = [
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'all', label: 'All Time' },
    ];

    return React.createElement('div', { style: { display: 'flex', gap: 6 } },
        tabs.map(tab =>
            React.createElement('button', {
                key: tab.value,
                className: `btn btn-sm ${active === tab.value ? 'btn-primary' : 'btn-outline'}`,
                onClick: () => onChange(tab.value)
            }, tab.label)
        )
    );
};

// ---- CARD ----
window.Card = ({ children, style, className }) => {
    return React.createElement('div', { className: `card ${className || ''}`, style }, children);
};

// ---- LOADING SPINNER ----
window.Spinner = () => {
    return React.createElement('div', {
        style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }
    },
        React.createElement('div', {
            style: { width: 36, height: 36, border: '3px solid #E2E8F0', borderTopColor: '#1A1F36', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }
        })
    );
};

// Inject spin animation
const spinStyle = document.createElement('style');
spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(spinStyle);

// ---- TABS ----
window.Tabs = ({ tabs, active, onChange }) => {
    return React.createElement('div', { style: { display: 'flex', borderBottom: '2px solid #E2E8F0', marginBottom: 20 } },
        tabs.map(tab =>
            React.createElement('button', {
                key: tab.value,
                onClick: () => onChange(tab.value),
                style: {
                    padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: 600, fontFamily: 'Inter, sans-serif',
                    color: active === tab.value ? '#1A1F36' : '#94A3B8',
                    borderBottom: active === tab.value ? '2px solid #F59E0B' : '2px solid transparent',
                    marginBottom: -2, transition: 'all 0.2s ease'
                }
            }, tab.label)
        )
    );
};

// ---- PROGRESS BAR ----
window.ProgressBar = ({ value, max, color }) => {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return React.createElement('div', { className: 'progress-bar' },
        React.createElement('div', {
            className: 'progress-fill',
            style: { width: pct + '%', background: color || '#1A1F36' }
        })
    );
};

// ---- GRID ----
window.Grid = ({ cols = 4, gap = 16, children }) => {
    return React.createElement('div', {
        style: {
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gap,
            '@media(max-width:768px)': { gridTemplateColumns: '1fr 1fr' }
        }
    }, children);
};

// ---- ALERT BOX ----
window.AlertBox = ({ type, children }) => {
    const styles = {
        danger: { bg: '#FEF2F2', border: '#EF4444', color: '#7f1d1d' },
        warning: { bg: '#FFFBEB', border: '#F59E0B', color: '#78350f' },
        success: { bg: '#F0FDF4', border: '#10B981', color: '#14532d' },
        info: { bg: '#EFF6FF', border: '#3B82F6', color: '#1e3a5f' },
    };
    const s = styles[type] || styles.info;
    return React.createElement('div', {
        className: 'alert-item',
        style: { background: s.bg, borderLeftColor: s.border, color: s.color }
    }, children);
};

// Export CSV helper
window.exportToCSV = (data, filename) => {
    if (!data || !data.length) return;
    const keys = Object.keys(data[0]);
    const csvContent = [
        keys.join(','),
        ...data.map(row => keys.map(k => JSON.stringify(row[k] || '')).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename + '.csv'; a.click();
    URL.revokeObjectURL(url);
};
