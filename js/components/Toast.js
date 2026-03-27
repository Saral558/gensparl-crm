// ============================================================
// TOAST COMPONENT
// ============================================================

const { useState: useStateT } = React;

window.ToastContainer = ({ toasts }) => {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
    };
    const bgColors = {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
    };

    return React.createElement('div', {
        style: { position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }
    },
        toasts.map(toast =>
            React.createElement('div', {
                key: toast.id,
                className: 'toast',
                style: { background: bgColors[toast.type] || bgColors.info, color: '#fff' }
            },
                React.createElement('span', { style: { fontSize: 18 } }, icons[toast.type] || icons.info),
                React.createElement('span', null, toast.message)
            )
        )
    );
};
