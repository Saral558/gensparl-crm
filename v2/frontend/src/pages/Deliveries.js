window.Deliveries = {
    async render() {
        const app = document.getElementById('app');
        const user = JSON.parse(localStorage.getItem('user'));
        
        try {
            const deliveries = await api.deliveries.list();

            app.innerHTML = `
                ${Dashboard.renderHeader(user)}
                <main>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 32px;">
                        <div>
                            <h2 style="font-size: 24px; font-weight: 700;">Delivery Management</h2>
                            <p style="color:var(--text-muted)">Manage and track all customer shipments.</p>
                        </div>
                        <button onclick="Deliveries.showAddModal()" class="btn-primary" style="width:auto; display:flex; align-items:center; gap:8px;">
                            <i data-lucide="plus" style="width:18px"></i> Add New Delivery
                        </button>
                    </div>

                    <div class="card" style="padding:0; overflow:hidden;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead style="background:#33415533;">
                                <tr style="text-align:left; color:var(--text-muted); font-size:11px; text-transform:uppercase; border-bottom:1px solid var(--border);">
                                    <th style="padding:16px 24px;">Customer Info</th>
                                    <th>Location</th>
                                    <th>Product</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th style="text-align:right; padding:16px 24px;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${deliveries.map(d => `
                                    <tr style="border-bottom:1px solid #33415555; font-size:14px;">
                                        <td style="padding:16px 24px;">
                                            <div style="font-weight:600">${d.customer_name}</div>
                                            <div style="font-size:12px; color:var(--text-muted)">${d.mobile_no}</div>
                                        </td>
                                        <td>${d.location}</td>
                                        <td>${d.product_details}</td>
                                        <td>${new Date(d.delivery_date).toLocaleDateString()}</td>
                                        <td>
                                            <select onchange="Deliveries.updateStatus('${d.id}', this.value)" style="margin:0; padding:4px 8px; font-size:11px; width:auto; background:${Dashboard.getStatusColor(d.status)}11; border-color:${Dashboard.getStatusColor(d.status)}55; color:${Dashboard.getStatusColor(d.status)}; font-weight:700;">
                                                <option value="pending" ${d.status === 'pending' ? 'selected' : ''}>PENDING</option>
                                                <option value="delivered" ${d.status === 'delivered' ? 'selected' : ''}>DELIVERED</option>
                                                <option value="cancelled" ${d.status === 'cancelled' ? 'selected' : ''}>CANCELLED</option>
                                            </select>
                                        </td>
                                        <td style="text-align:right; padding:16px 24px;">
                                            <button onclick="Deliveries.delete('${d.id}')" style="background:transparent; border:none; color:var(--danger); cursor:pointer;"><i data-lucide="trash-2" style="width:18px"></i></button>
                                        </td>
                                    </tr>
                                `).join('') || '<tr><td colspan="6" style="padding:40px; text-align:center; color:var(--text-muted)">No active deliveries found</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </main>
                
                <!-- Simple Modal for adding/editing -->
                <div id="modalBackdrop" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:1000; align-items:center; justify-content:center; padding:20px;">
                    <div class="card" style="width:100%; max-width:500px; margin:0 auto;">
                        <h3 id="modalTitle" style="margin-bottom:24px;">New Delivery</h3>
                        <form id="deliveryForm">
                            <input type="text" id="dCustomer" placeholder="Customer Name" required>
                            <input type="text" id="dMobile" placeholder="Mobile Number" required>
                            <input type="text" id="dLocation" placeholder="Location/Address" required>
                            <input type="date" id="dDate" required>
                            <textarea id="dDetails" placeholder="Product Details" rows="3" style="width:100%; padding:10px; background:#0f172a; border:1px solid var(--border); border-radius:8px; color:white; margin-bottom:20px;"></textarea>
                            <div style="display:flex; gap:12px;">
                                <button type="button" onclick="Deliveries.hideModal()" class="btn-logout" style="flex:1; border-color:var(--border); color:var(--text-muted)">Cancel</button>
                                <button type="submit" class="btn-primary" style="flex:2">Save Delivery</button>
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
        document.getElementById('modalBackdrop').style.display = 'flex';
        document.getElementById('deliveryForm').onsubmit = async (e) => {
            e.preventDefault();
            try {
                const data = {
                    customer_name: document.getElementById('dCustomer').value,
                    mobile_no: document.getElementById('dMobile').value,
                    location: document.getElementById('dLocation').value,
                    delivery_date: document.getElementById('dDate').value,
                    product_details: document.getElementById('dDetails').value,
                    status: 'pending'
                };
                await api.deliveries.create(data);
                this.hideModal();
                this.render();
            } catch (err) { alert(err.message); }
        };
    },

    hideModal() {
        document.getElementById('modalBackdrop').style.display = 'none';
        document.getElementById('deliveryForm').reset();
    },

    async updateStatus(id, status) {
        try {
            // We need full object for update if implementation is simple
            const deliveries = await api.deliveries.list();
            const original = deliveries.find(d => d.id === id);
            await api.deliveries.update(id, { ...original, status });
            this.render();
        } catch (err) { alert(err.message); }
    },

    async delete(id) {
        if (!confirm('Are you sure you want to delete this delivery?')) return;
        try {
            await api.deliveries.delete(id);
            this.render();
        } catch (err) { alert(err.message); }
    }
};
