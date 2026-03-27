window.Dashboard = {
    async render() {
        const app = document.getElementById('app');
        const user = JSON.parse(localStorage.getItem('user'));
        
        try {
            const deliveries = await api.deliveries.list();
            const stats = this.calculateStats(deliveries, user.role);

            app.innerHTML = `
                ${this.renderHeader(user)}
                <main>
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom: 32px;">
                        <div>
                            <h2 style="font-size: 24px; font-weight: 700;">Welcome back, ${user.name}</h2>
                            <p style="color:var(--text-muted)">Here is what is happening with deliveries today.</p>
                        </div>
                        <a href="#deliveries" class="btn-primary" style="width:auto; display:flex; align-items:center; gap:8px;">
                            <i data-lucide="plus-circle" style="width:18px"></i> New Delivery
                        </a>
                    </div>

                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 32px;">
                        ${this.renderStatCard('Total Deliveries', stats.total, 'package', 'var(--primary)')}
                        ${this.renderStatCard('Pending', stats.pending, 'clock', 'var(--warning)')}
                        ${this.renderStatCard('Delivered', stats.delivered, 'check-circle', 'var(--success)')}
                        ${user.role === 'admin' ? this.renderStatCard('Cancelled', stats.cancelled, 'x-circle', 'var(--danger)') : ''}
                    </div>

                    <div class="card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                            <h3 style="font-size: 18px; font-weight: 600;">Recent Deliveries</h3>
                            <a href="#deliveries" style="color:var(--primary); text-decoration:none; font-size:14px; font-weight:500;">View All</a>
                        </div>
                        <table style="width:100%; border-collapse:collapse;">
                            <thead>
                                <tr style="text-align:left; color:var(--text-muted); font-size:12px; text-transform:uppercase; border-bottom:1px solid var(--border);">
                                    <th style="padding:12px 0;">Customer</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th style="text-align:right;">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${deliveries.slice(0, 5).map(d => `
                                    <tr style="border-bottom:1px solid #33415555; font-size:14px;">
                                        <td style="padding:16px 0;">
                                            <div style="font-weight:600">${d.customer_name}</div>
                                            <div style="font-size:12px; color:var(--text-muted)">${d.mobile_no}</div>
                                        </td>
                                        <td>
                                            <span style="padding:4px 10px; border-radius:100px; font-size:11px; font-weight:700; background:${this.getStatusColor(d.status)}22; color:${this.getStatusColor(d.status)};">
                                                ${d.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>${new Date(d.delivery_date).toLocaleDateString()}</td>
                                        <td style="text-align:right; color:var(--text-muted)">${d.product_details.slice(0, 20)}...</td>
                                    </tr>
                                `).join('') || '<tr><td colspan="4" style="padding:20px; text-align:center; color:var(--text-muted)">No deliveries found</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </main>
            `;
            refreshIcons();
        } catch (err) {
            app.innerHTML = `<div class="card" style="color:var(--danger)">Error: ${err.message}</div>`;
        }
    },

    renderHeader(user) {
        return `
            <header>
                <div class="brand"><i data-lucide="truck"></i> Delivery CRM</div>
                <nav class="user-nav">
                    <a href="#dashboard" class="nav-link active">Dashboard</a>
                    <a href="#deliveries" class="nav-link">Deliveries</a>
                    ${user.role === 'admin' ? '<a href="#users" class="nav-link">Users</a>' : ''}
                    <div style="width:1px; height:24px; background:var(--border); margin: 0 8px;"></div>
                    <span style="font-size:12px; font-weight:600; color:var(--text-muted)">${user.name} (${user.role.toUpperCase()})</span>
                    <button class="btn-logout" onclick="logout()">Logout</button>
                </nav>
            </header>
        `;
    },

    renderStatCard(label, value, icon, color) {
        return `
            <div class="card" style="padding: 20px; display:flex; align-items:center; gap:20px;">
                <div style="width:48px; height:48px; border-radius:12px; background:${color}22; color:${color}; display:flex; align-items:center; justify-content:center;">
                    <i data-lucide="${icon}"></i>
                </div>
                <div>
                    <div style="font-size:12px; color:var(--text-muted); font-weight:600; text-transform:uppercase;">${label}</div>
                    <div style="font-size:24px; font-weight:700;">${value}</div>
                </div>
            </div>
        `;
    },

    calculateStats(deliveries, role) {
        return {
            total: deliveries.length,
            pending: deliveries.filter(d => d.status === 'pending').length,
            delivered: deliveries.filter(d => d.status === 'delivered').length,
            cancelled: deliveries.filter(d => d.status === 'cancelled').length
        };
    },

    getStatusColor(status) {
        switch(status) {
            case 'delivered': return 'var(--success)';
            case 'pending': return 'var(--warning)';
            case 'cancelled': return 'var(--danger)';
            default: return 'var(--text-muted)';
        }
    }
};
