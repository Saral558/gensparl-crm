document.addEventListener('DOMContentLoaded', async () => {
    // 🛡️ Await Authentication (Zero Error Guard)
    const activeUser = await checkAuth('admin');
    if (!activeUser) return; // checkAuth will handle redirect if needed

    document.getElementById('adminName').textContent = activeUser.name;
    const avatar = document.getElementById('avatarLetter');
    if (avatar) avatar.textContent = activeUser.name.charAt(0).toUpperCase();

    // 🔄 Wait for DataManager to boot
    if (window.DataManager) {
        try {
            await window.DataManager.init();
            navigate('dashboard');
        } catch (err) {
            console.error("DataManager initialization failed:", err);
        }
    }

    const contentArea = document.getElementById('contentArea');
    const navItems = document.querySelectorAll('.nav-item');
    const viewTitle = document.getElementById('viewTitle');

    const routes = {
        dashboard: renderDashboard,
        sales: renderSales,
        inventory: renderInventory,
        verification: renderSalesVerification,
        finance: renderFinance,
        expenses: renderExpenses,
        deliveries: renderDeliveries,
        service: renderService,
        staff: renderStaffPerformance,
        analytics: renderDetailedAnalytics,
        gifts: renderGifts,
        profile: renderProfile
    };

    function navigate(view) {
        if (view === 'logout') { logout(); return; }
        
        console.log('Navigating to:', view);
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.view === view) item.classList.add('active');
        });

        if (viewTitle) viewTitle.textContent = view.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        if (routes[view]) {
            contentArea.innerHTML = `
                <div style="display:flex; justify-content:center; align-items:center; height:300px; flex-direction:column; gap:16px;">
                    <div class="spinner"></div>
                    <span style="color:var(--muted); font-size:14px;">Loading ${view}...</span>
                </div>`;
                
            setTimeout(() => {
                try {
                    routes[view]();
                    lucide.createIcons();
                } catch (err) {
                    console.error('Render Error:', err);
                    contentArea.innerHTML = `<div class="error-state">Error loading module: ${err.message}</div>`;
                }
            }, 50); 
        }
    }

    // --- VIEW RENDERERS ---

    function renderDashboard() {
        const stats = window.DataManager.getStats();
        contentArea.innerHTML = `
            <div class="view-section animate-in">
                <div class="stats-grid">
                    <div class="data-card">
                        <div class="card-icon" style="color:#6366f1;"><i data-lucide="indian-rupee"></i></div>
                        <div class="card-value">₹${stats.todayRevenue.toLocaleString('en-IN')}</div>
                        <div class="card-label">Today's Revenue</div>
                    </div>
                    <div class="data-card">
                        <div class="card-icon" style="color:#10b981;"><i data-lucide="trending-up"></i></div>
                        <div class="card-value">₹${stats.todayProfit.toLocaleString('en-IN')}</div>
                        <div class="card-label">Today's Profit</div>
                    </div>
                    <div class="data-card">
                        <div class="card-icon" style="color:#f59e0b;"><i data-lucide="truck"></i></div>
                        <div class="card-value">${stats.deliveryPending}</div>
                        <div class="card-label">Pending Deliveries</div>
                    </div>
                    <div class="data-card">
                        <div class="card-icon" style="color:#ef4444;"><i data-lucide="tool"></i></div>
                        <div class="card-value">${stats.servicePending}</div>
                        <div class="card-label">Service Tickets</div>
                    </div>
                </div>

                <div class="charts-row">
                    <div class="chart-card">
                        <div class="chart-title">Revenue Trend (7 Days)</div>
                        <div id="revenueChart"></div>
                    </div>
                    <div class="chart-card">
                        <div class="chart-title">Staff Sales Distribution</div>
                        <div id="staffChart"></div>
                    </div>
                </div>
            </div>
        `;
        initDashboardCharts(stats);
    }

    function initDashboardCharts(stats) {
        const sales = window.DataManager.getData('sales');
        const performance = window.DataManager.getSalesByStaff();
        
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const revenueData = last7Days.map(date => {
            return sales.filter(s => s.created_at?.startsWith(date))
                        .reduce((sum, s) => sum + Number(s.amount || 0), 0);
        });

        const optionsLine = {
            series: [{ name: "Revenue", data: revenueData }],
            chart: { height: 320, type: 'area', toolbar: { show: false }, background: 'transparent', animations: { enabled: true } },
            colors: ['#6366f1'],
            stroke: { curve: 'smooth', width: 3 },
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0 } },
            xaxis: { categories: last7Days.map(d => d.slice(5)), labels: { style: { colors: '#64748b' } } },
            yaxis: { labels: { style: { colors: '#64748b' } } },
            grid: { borderColor: 'rgba(255,255,255,0.05)' },
            theme: { mode: 'dark' }
        };

        const optionsDonut = {
            series: performance.data,
            labels: performance.categories,
            chart: { type: 'donut', height: 320 },
            colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
            stroke: { show: false },
            legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
            theme: { mode: 'dark' }
        };

        new ApexCharts(document.querySelector("#revenueChart"), optionsLine).render();
        new ApexCharts(document.querySelector("#staffChart"), optionsDonut).render();
    }

    function renderSales() {
        renderListView('Sales History', 'sales', [
            { label: 'Date', key: 'created_at', fmt: v => new Date(v).toLocaleDateString() },
            { label: 'Customer', key: 'customer_name', bold: true },
            { label: 'Product', key: 'product_name' },
            { label: 'Amount', key: 'amount', fmt: v => `₹${Number(v).toLocaleString()}` },
            { label: 'Staff', key: 'staff_name', alt: 'salesboy_name' },
            { label: 'Payment', key: 'payment_mode', badge: true }
        ]);
    }

    function renderInventory() {
        const inventory = window.DataManager.getData('inventory');
        contentArea.innerHTML = `
            <div class="view-section animate-in">
                <div class="table-container">
                    <div class="table-header"><h3>Product Inventory</h3><button class="btn btn-primary btn-sm">Add Item</button></div>
                    <table>
                        <thead><tr><th>Model/Product</th><th>Stock</th><th>Price</th><th>Category</th></tr></thead>
                        <tbody>
                            ${inventory.map(i => `
                                <tr>
                                    <td><strong>${i.product_name}</strong></td>
                                    <td><span class="status-pill active">${i.quantity || 12} In Stock</span></td>
                                    <td>₹${Number(i.amount).toLocaleString()}</td>
                                    <td><span class="badge sale">Electronics</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function renderSalesVerification() {
        const sales = window.DataManager.getData('sales').filter(s => !s.image_verified);
        contentArea.innerHTML = `
            <div class="view-section animate-in">
                <div class="table-header" style="margin-bottom:20px;">
                    <h3>Pending Sales Verification</h3>
                    <p style="color:var(--muted); font-size:13px;">${sales.length} records awaiting photo proof verification</p>
                </div>
                <div class="grid-2" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
                    ${sales.map(s => `
                        <div class="data-card" style="padding:16px;">
                            ${s.image_url ? `<img src="${s.image_url}" style="width:100%; height:180px; object-fit:cover; border-radius:12px; margin-bottom:12px;">` : `<div style="height:180px; background:#1e2d45; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#475569; margin-bottom:12px;"><i data-lucide="image-off"></i></div>`}
                            <div style="margin-bottom:12px;">
                                <div style="font-weight:700; font-size:15px;">${s.customer_name}</div>
                                <div style="color:var(--muted); font-size:12px;">${s.product_name} · ₹${Number(s.amount).toLocaleString()}</div>
                            </div>
                            <div style="display:flex; gap:8px;">
                                <button class="btn btn-primary" style="flex:1; padding:8px; font-size:12px;">Approve</button>
                                <button class="btn btn-outline" style="flex:1; padding:8px; font-size:12px;">Reject</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    function renderFinance() {
        renderListView('Finance / EMI Ledger', 'finance', [
            { label: 'Customer', key: 'customer_name', bold: true },
            { label: 'Finance Co.', key: 'finance_company' },
            { label: 'Loan Amt', key: 'loan_amount', fmt: v => `₹${Number(v).toLocaleString()}` },
            { label: 'EMI', key: 'emi_amount', fmt: v => `₹${Number(v).toLocaleString()}` },
            { label: 'Due', key: 'due_amount', fmt: v => `₹${Number(v).toLocaleString()}`, color: '#ef4444' },
            { label: 'Status', key: 'status', badge: true }
        ]);
    }

    function renderExpenses() {
        renderListView('Expense History', 'expenses', [
            { label: 'Date', key: 'date', alt: 'created_at', fmt: v => new Date(v).toLocaleDateString() },
            { label: 'Expense Title', key: 'title', bold: true },
            { label: 'Category', key: 'category', badge: true },
            { label: 'Amount', key: 'amount', fmt: v => `₹${Number(v).toLocaleString()}`, color: '#ef4444' },
            { label: 'Added By', key: 'added_by_name' }
        ]);
    }

    function renderDeliveries() {
        renderListView('Delivery Management', 'deliveries', [
            { label: 'Order ID', key: 'order_id', fmt: v => `#${v.slice(0,8).toUpperCase()}` },
            { label: 'Customer', key: 'customer_name', bold: true },
            { label: 'Phone', key: 'phone' },
            { label: 'Status', key: 'status', badge: true },
            { label: 'Assigned To', key: 'delivery_boy_id', fmt: v => v ? 'Agent Assigned' : 'Unassigned' }
        ]);
    }

    function renderService() {
        renderListView('Service & Repairs', 'service', [
            { label: 'Ticket', key: 'id', fmt: v => `#${v.slice(-6).toUpperCase()}` },
            { label: 'Customer', key: 'customer_name', bold: true },
            { label: 'Issue', key: 'problem' },
            { label: 'Staff Assigned', key: 'staff_name' },
            { label: 'Status', key: 'status', badge: true }
        ]);
    }

    function renderGifts() {
        renderListView('Gift Box Distribution', 'gifts', [
            { label: 'Recipient', key: 'customer_name', bold: true },
            { label: 'Gift Item', key: 'gift_item' },
            { label: 'Bill Ref', key: 'bill_no' },
            { label: 'Value', key: 'gift_value', fmt: v => `₹${Number(v).toLocaleString()}` },
            { label: 'Issued By', key: 'given_by_name' }
        ]);
    }

    function renderStaffPerformance() {
        const staff = window.DataManager.getData('staff');
        contentArea.innerHTML = `
            <div class="view-section animate-in">
                <div class="table-container">
                    <table>
                        <thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            ${staff.map(s => `
                                <tr>
                                    <td><strong>${s.name}</strong><br><small>${s.staff_id || ''}</small></td>
                                    <td><span class="badge ${s.role}">${s.role.toUpperCase()}</span></td>
                                    <td><span class="status-pill active">${s.active ? 'Active' : 'Locked'}</span></td>
                                    <td>
                                        <button class="btn btn-outline btn-sm" onclick="editStaffName('${s.id}', '${s.name || ''}')">
                                            <i data-lucide="edit-3" style="width:14px; height:14px; vertical-align:middle; margin-right:4px;"></i> Update Name
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function renderDetailedAnalytics() {
        contentArea.innerHTML = `
            <div class="view-section animate-in">
                <div style="background:var(--card-glass); padding:40px; border-radius:30px; border:1px solid var(--border); text-align:center;">
                    <div style="font-size:40px; margin-bottom:20px;">📈</div>
                    <h3>Dinesh CRM Pro Analytics</h3>
                    <p style="color:var(--muted); max-width:400px; margin: 0 auto 24px;">Advanced revenue forecasting and trend analysis tools are initializing with your historical data.</p>
                    <button class="btn btn-primary" onclick="window.location.href='sales_analytics.html'">Open Classic Analytics</button>
                </div>
            </div>
        `;
    }

    async function renderProfile() {
        const user = checkAuth();
        const profile = await crmUtils.fetchProfile(user.id);
        
        contentArea.innerHTML = `
            <div class="view-section animate-in" style="max-width:600px; margin: 0 auto;">
                <div class="data-card" style="padding:40px; text-align:center;">
                    <div style="position:relative; width:120px; height:120px; margin:0 auto 24px;">
                        <img id="profileAvatar" src="${profile.avatar_url || 'https://via.placeholder.com/120'}" style="width:100%; height:100%; border-radius:50%; object-fit:cover; border:3px solid var(--primary);">
                        <label for="adminAvatarInput" style="position:absolute; bottom:0; right:0; background:var(--primary); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; border:2px solid var(--card-bg);">
                            <i data-lucide="camera" style="width:16px; height:16px; color:white;"></i>
                        </label>
                        <input type="file" id="adminAvatarInput" style="display:none;" onchange="handleAdminAvatar(event)">
                    </div>
                    
                    <h2 style="margin-bottom:8px;">${user.name}</h2>
                    <p style="color:var(--muted); margin-bottom:24px;">${user.role.toUpperCase()} · ID: ${user.staffId}</p>
                    
                    <div style="text-align:left;">
                        <div style="margin-bottom:16px;">
                            <label style="display:block; font-size:12px; color:var(--muted); margin-bottom:4px;">Display Name</label>
                            <input type="text" id="adminDisplayName" class="search-input" style="padding-left:14px;" value="${user.name}">
                        </div>
                        <div style="margin-bottom:24px;">
                            <label style="display:block; font-size:12px; color:var(--muted); margin-bottom:4px;">Professional Bio</label>
                            <textarea id="adminAbout" class="search-input" style="padding-left:14px; height:100px; padding-top:10px; resize:none;">${profile.about || ''}</textarea>
                        </div>
                        <button class="btn btn-primary" style="width:100%;" onclick="saveAdminProfile()">Save Profile Changes</button>
                    </div>
                </div>
            </div>
        `;
        
        // Define global handlers for the injected HTML
        window.handleAdminAvatar = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const preview = document.getElementById('profileAvatar');
                preview.src = URL.createObjectURL(file);
                window._selectedAvatar = file;
            }
        };

        window.saveAdminProfile = async () => {
            const name = document.getElementById('adminDisplayName').value;
            const about = document.getElementById('adminAbout').value;
            const updates = { name, about };
            
            try {
                if (window._selectedAvatar) {
                    const url = await crmUtils.compressAndUpload(window._selectedAvatar, 'crm-delivery-proofs', 'avatar', user);
                    updates.avatar_url = url;
                }
                await crmUtils.updateProfile(user.id, updates);
                alert("Profile Updated Successfully!");
                location.reload();
            } catch (err) {
                alert("Error: " + err.message);
            }
        };
    }

    // Helper for structured lists
    function renderListView(title, dataKey, columns) {
        const data = window.DataManager.getData(dataKey);
        contentArea.innerHTML = `
            <div class="view-section animate-in">
                <div class="table-container">
                    <div class="table-header"><h3>${title}</h3><div class="user-chip">${data.length} Records</div></div>
                    <table>
                        <thead>
                            <tr>${columns.map(c => `<th>${c.label}</th>`).join('')}</tr>
                        </thead>
                        <tbody>
                            ${data.map(row => `
                                <tr>
                                    ${columns.map(col => {
                                        let val = row[col.key];
                                        if (!val && col.alt) val = row[col.alt];
                                        if (col.fmt) val = col.fmt(val);
                                        const style = col.color ? `style="color:${col.color}; font-weight:700;"` : '';
                                        const content = col.bold ? `<strong>${val}</strong>` : val;
                                        
                                        if (col.badge) return `<td><span class="badge ${String(val).toLowerCase()}">${val}</span></td>`;
                                        return `<td ${style}>${content}</td>`;
                                    }).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // Global Search Logic
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('input', () => {
            const term = globalSearch.value.toLowerCase();
            const rows = document.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        });
    }

    // Navigation events for the new sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            if (view) navigate(view);
        });
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }

    // --- GLOBAL ACTIONS ---
    window.editStaffName = async (profileId, currentName) => {
        const newName = prompt("Staff member ka naya naam darj karein (Enter new name for staff):", currentName);
        if (newName && newName.trim() !== "" && newName !== currentName) {
            try {
                const { error } = await window.supabase
                    .from('profiles')
                    .update({ name: newName.trim() })
                    .eq('id', profileId);
                
                if (error) throw error;
                
                alert("✓ Staff name updated successfully in database!");
                
                // Refresh records list
                if (window.DataManager) {
                    await window.DataManager.refreshAll();
                    renderStaffPerformance();
                    lucide.createIcons();
                }
            } catch (err) {
                console.error(err);
                alert("Failed to update staff name: " + err.message);
            }
        }
    };
});
