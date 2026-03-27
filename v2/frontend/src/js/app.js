document.addEventListener('DOMContentLoaded', () => {
    router.init();
    
    // Global Lucide Icon Refresh
    window.refreshIcons = () => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    };
});

window.logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.hash = '#login';
};
