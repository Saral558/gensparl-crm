/**
 * Navigation Component for Dinesh CRM
 * Handles Bottom Nav for Mobile and Sidebar for Desktop
 */

document.addEventListener('DOMContentLoaded', () => {
    // Detect if we are in the ADMIN subdirectory
    const isInAdmin = window.location.pathname.includes('/ADMIN/');
    const prefix = isInAdmin ? '../' : '';
    const adminPrefix = isInAdmin ? '' : 'ADMIN/';

    // Bottom Navigation (Mobile Only)
    const bottomNav = document.createElement('nav');
    bottomNav.className = 'bottom-nav';
    bottomNav.innerHTML = `
        <a href="${prefix}sales.html" class="nav-btn" data-view="sales">
            <i data-lucide="shopping-cart"></i>
            <span>Sales</span>
        </a>
        <a href="${prefix}delivery_boy.html" class="nav-btn" data-view="delivery">
            <i data-lucide="truck"></i>
            <span>Delivery</span>
        </a>
        <a href="${prefix}inventory.html" class="nav-btn" data-view="inventory">
            <i data-lucide="package"></i>
            <span>Stock</span>
        </a>
        <a href="${prefix}gift-box.html" class="nav-btn" data-view="gifts">
            <i data-lucide="gift"></i>
            <span>Gifts</span>
        </a>
    `;

    // Sidebar (Desktop Only)
    const sidebar = document.createElement('aside');
    sidebar.className = 'app-sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-logo">
            <i data-lucide="zap" class="logo-icon"></i>
            <span>Dinesh PRO</span>
        </div>
        <div class="sidebar-links">
            <a href="${prefix}sales.html" class="s-link" data-view="sales"><i data-lucide="shopping-cart"></i> Sales</a>
            <a href="${prefix}inventory.html" class="s-link" data-view="inventory"><i data-lucide="package"></i> Inventory</a>
            <a href="${prefix}delivery_boy.html" class="s-link" data-view="delivery"><i data-lucide="truck"></i> Delivery</a>
            <a href="${prefix}service.html" class="s-link" data-view="service"><i data-lucide="wrench"></i> Service</a>
            <a href="${prefix}finance.html" class="s-link" data-view="finance"><i data-lucide="credit-card"></i> Finance</a>
            <a href="${prefix}expense.html" class="s-link" data-view="expense"><i data-lucide="receipt"></i> Expenses</a>
            <a href="${prefix}gift-box.html" class="s-link" data-view="gifts"><i data-lucide="gift"></i> Gift Box</a>
            <hr class="nav-divider">
            <a href="${prefix}${adminPrefix}index.html" class="s-link admin-link"><i data-lucide="shield-check"></i> Admin Panel</a>
        </div>
        <div class="sidebar-footer">
            <button onclick="logout()" class="btn-logout-sidebar"><i data-lucide="log-out"></i> Logout</button>
        </div>
    `;

    // Inject styles for Navigation
    const navStyles = document.createElement('style');
    navStyles.textContent = `
        /* Bottom Nav */
        .bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 70px;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(10px);
            display: flex;
            justify-content: space-around;
            align-items: center;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            z-index: 9999;
            padding-bottom: env(safe-area-inset-bottom);
        }
        
        @media (min-width: 769px) { .bottom-nav { display: none; } }

        .nav-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            color: #94a3b8;
            text-decoration: none;
            font-size: 10px;
            font-weight: 600;
            transition: 0.2s;
            flex: 1;
        }

        .nav-btn icon-small { width: 22px; height: 22px; }
        .nav-btn.active { color: #6366f1; }
        .nav-btn.active i { filter: drop-shadow(0 0 5px rgba(99, 102, 241, 0.5)); }

        /* Sidebar Styles */
        .app-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: 260px;
            height: 100vh;
            background: #1e293b;
            border-right: 1px solid rgba(255, 255, 255, 0.08);
            display: flex;
            flex-direction: column;
            z-index: 10000;
        }

        @media (max-width: 768px) { .app-sidebar { display: none; } }

        .sidebar-logo {
            padding: 30px;
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: 'Poppins', sans-serif;
            font-size: 20px;
            font-weight: 800;
            color: white;
        }

        .logo-icon { color: #6366f1; }

        .sidebar-links { flex: 1; padding: 15px; display: flex; flex-direction: column; gap: 4px; }
        
        .s-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            border-radius: 10px;
            color: #94a3b8;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }

        .s-link:hover { background: rgba(255, 255, 255, 0.05); color: white; }
        .s-link.active { background: #6366f1; color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }

        .nav-divider { border: none; border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 15px 0; }
        .admin-link { color: #a855f7; }

        .sidebar-footer { padding: 20px; border-top: 1px solid rgba(255, 255, 255, 0.08); }
        .btn-logout-sidebar {
            width: 100%; padding: 12px; border-radius: 10px; border: 1px solid rgba(239, 68, 68, 0.3);
            background: rgba(239, 68, 68, 0.05); color: #ef4444; font-weight: 600; cursor: pointer;
            display: flex; align-items: center; justify-content: center; gap: 8px;
        }
    `;

    document.head.appendChild(navStyles);
    
    // Check current page for active state
    const currentPath = window.location.pathname;
    
    // Inject only if not on login page
    if (!currentPath.includes('login.html')) {
        document.body.appendChild(bottomNav);
        document.body.appendChild(sidebar);
        
        // Mark active
        const links = [...document.querySelectorAll('.nav-btn'), ...document.querySelectorAll('.s-link')];
        links.forEach(link => {
            if (currentPath.includes(link.getAttribute('href'))) {
                link.classList.add('active');
            }
        });
    }

    // Refresh icons
    if (window.lucide) {
        lucide.createIcons();
    }
});
