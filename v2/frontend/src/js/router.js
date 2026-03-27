const router = {
    routes: {
        '#login': { page: 'Login', auth: false },
        '#dashboard': { page: 'Dashboard', auth: true },
        '#deliveries': { page: 'Deliveries', auth: true },
        '#users': { page: 'Users', adminOnly: true, auth: true }
    },

    async init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    },

    async handleRoute() {
        const hash = window.location.hash || '#dashboard';
        const route = this.routes[hash] || this.routes['#dashboard'];
        const user = JSON.parse(localStorage.getItem('user'));

        // Auth Check
        if (route.auth && !localStorage.getItem('token')) {
            window.location.hash = '#login';
            return;
        }

        // Admin Check
        if (route.adminOnly && (!user || user.role !== 'admin')) {
            window.location.hash = '#dashboard';
            return;
        }

        // Render Page
        this.render(route.page);
    },

    async render(pageName) {
        const app = document.getElementById('app');
        
        // Show Loading
        app.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; height:100vh;"><span class="loader"></span></div>';

        try {
            // In a real modular app, we'd dynamic import here. 
            // For now, we'll assume the page functions are global or provided by pages/
            if (window[pageName]) {
                await window[pageName].render();
            } else {
                app.innerHTML = `<h1>Page ${pageName} not implemented yet</h1>`;
            }
        } catch (err) {
            app.innerHTML = `<div class="card" style="color:var(--danger)">Error loading page: ${err.message}</div>`;
        }
    }
};
