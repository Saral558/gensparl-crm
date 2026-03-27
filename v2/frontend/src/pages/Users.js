window.Users = {
    async render() {
        const app = document.getElementById('app');
        const user = JSON.parse(localStorage.getItem('user'));
        
        try {
            const users = await api.users.list();

            app.innerHTML = `
                ${Dashboard.renderHeader(user)}
                <main>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 32px;">
                        <div>
                            <h2 style="font-size: 24px; font-weight: 700;">User Management</h2>
                            <p style="color:var(--text-muted)">Manage staff accounts and permissions.</p>
                        </div>
                        <button onclick="Users.showAddModal()" class="btn-primary" style="width:auto; display:flex; align-items:center; gap:8px;">
                            <i data-lucide="user-plus" style="width:18px"></i> Create Staff Account
                        </button>
                    </div>

                    <div class="card" style="padding:0; overflow:hidden;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead style="background:#33415533;">
                                <tr style="text-align:left; color:var(--text-muted); font-size:11px; text-transform:uppercase; border-bottom:1px solid var(--border);">
                                    <th style="padding:16px 24px;">Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Created On</th>
                                    <th style="text-align:right; padding:16px 24px;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${users.map(u => `
                                    <tr style="border-bottom:1px solid #33415555; font-size:14px;">
                                        <td style="padding:16px 24px; font-weight:600;">${u.name}</td>
                                        <td>${u.email}</td>
                                        <td>
                                            <span style="padding:4px 10px; border-radius:100px; font-size:10px; font-weight:800; background:${u.role === 'admin' ? 'var(--primary)22' : 'var(--text-muted)22'}; color:${u.role === 'admin' ? 'var(--primary)' : 'var(--text-muted)'};">
                                                ${u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>${new Date(u.created_at).toLocaleDateString()}</td>
                                        <td style="text-align:right; padding:16px 24px;">
                                            <button onclick="Users.delete('${u.id}')" style="background:transparent; border:none; color:var(--danger); cursor:pointer;"><i data-lucide="user-minus" style="width:18px"></i></button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </main>
                
                <div id="userModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:1000; align-items:center; justify-content:center; padding:20px;">
                    <div class="card" style="width:100%; max-width:400px; margin:0 auto;">
                        <h3 style="margin-bottom:24px;">Create Staff Account</h3>
                        <form id="userForm">
                            <input type="text" id="uName" placeholder="Full Name" required>
                            <input type="email" id="uEmail" placeholder="Email Address" required>
                            <input type="password" id="uPassword" placeholder="Initial Password" required>
                            <select id="uRole">
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                            </select>
                            <div style="display:flex; gap:12px;">
                                <button type="button" onclick="Users.hideModal()" class="btn-logout" style="flex:1; border-color:var(--border); color:var(--text-muted)">Cancel</button>
                                <button type="submit" class="btn-primary" style="flex:2">Create Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            refreshIcons();
        } catch (err) {
            app.innerHTML = `<div class="card" style="color:var(--danger)">Error: ${err.message}</div>`;
        }
    },

    showAddModal() {
        document.getElementById('userModal').style.display = 'flex';
        document.getElementById('userForm').onsubmit = async (e) => {
            e.preventDefault();
            try {
                const data = {
                    name: document.getElementById('uName').value,
                    email: document.getElementById('uEmail').value,
                    password: document.getElementById('uPassword').value,
                    role: document.getElementById('uRole').value
                };
                await api.users.create(data);
                this.hideModal();
                this.render();
            } catch (err) { alert(err.message); }
        };
    },

    hideModal() {
        document.getElementById('userModal').style.display = 'none';
        document.getElementById('userForm').reset();
    },

    async delete(id) {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.users.delete(id);
            this.render();
        } catch (err) { alert(err.message); }
    }
};
