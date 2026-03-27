// ============================================================
// MODAL COMPONENT
// ============================================================

window.Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizes = {
        sm: '400px',
        md: '600px',
        lg: '800px',
        xl: '960px',
    };

    return React.createElement('div', {
        className: 'modal-overlay',
        onClick: (e) => e.target === e.currentTarget && onClose()
    },
        React.createElement('div', {
            className: 'modal-box fade-in',
            style: { maxWidth: sizes[size] || sizes.md }
        },
            // Header
            React.createElement('div', {
                style: { padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
            },
                React.createElement('h3', { style: { fontSize: 18, fontWeight: 700, color: '#0F172A' } }, title),
                React.createElement('button', {
                    onClick: onClose,
                    style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#94A3B8', lineHeight: 1 }
                }, '×')
            ),
            // Body
            React.createElement('div', { style: { padding: '24px' } }, children)
        )
    );
};

// Confirm Modal
window.ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    return React.createElement(Modal, { isOpen, onClose, title: title || 'Confirm Action', size: 'sm' },
        React.createElement('div', null,
            React.createElement('p', { style: { color: '#475569', marginBottom: 24, fontSize: 14 } }, message || 'Are you sure?'),
            React.createElement('div', { style: { display: 'flex', gap: 12, justifyContent: 'flex-end' } },
                React.createElement('button', { className: 'btn btn-outline', onClick: onClose }, 'Cancel'),
                React.createElement('button', { className: 'btn btn-danger', onClick: () => { onConfirm(); onClose(); } }, 'Delete')
            )
        )
    );
};
