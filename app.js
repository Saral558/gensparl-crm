// 🌐 GLOBAL URL MASKING (Cosmetic removal of .html)
if (window.location.pathname.endsWith('.html') && !window.location.pathname.endsWith('index.html')) {
    window.history.replaceState(null, '', window.location.pathname.replace('.html', ''));
}

// 🛡️ ROLE-BASED ACCESS CONTROL (RBAC) CONFIG
const ROLE_PERMISSIONS = {
  admin: ['sales', 'inventory', 'delivery', 'service', 'finance', 'expense', 'gifts', 'admin', 'delivery_manager'],
  sales: ['sales'],
  service: ['service'],
  delivery: ['delivery'],
  finance: ['finance'],
  expense: ['expense'],
  inventory: ['inventory'],
  delivery_manager: ['delivery_manager'],
  gift_box: ['gift_box']
};

const ROLE_DEFAULT_ROUTES = {
  admin: 'ADMIN/index.html',
  sales: 'sales.html',
  service: 'service.html',
  delivery: 'delivery_boy.html',
  finance: 'finance.html',
  expense: 'expense.html',
  inventory: 'inventory.html',
  delivery_manager: 'ADMIN/delivery_admin.html',
  gift_box: 'gift-box.html'
};

window.ROLE_PERMISSIONS = ROLE_PERMISSIONS;
window.ROLE_DEFAULT_ROUTES = ROLE_DEFAULT_ROUTES;

// 🔐 LOGIN FUNCTION (Hardened Supabase Auth)
async function login() {
    const btn = document.querySelector('button');
    const idValue = document.getElementById("id").value.trim();
    const pass = document.getElementById("password").value;

    if (!idValue || !pass) {
        alert("Please enter both ID and Password");
        return;
    }

    btn.innerText = "Authenticating...";
    btn.disabled = true;

    try {
        const email = `${idValue}@dineshcrm.com`;

        // 1. Perform Supabase Sign-In (Direct Auth Only)
        let { data: authData, error: authError } = await window.supabase.auth.signInWithPassword({
            email: email,
            password: pass
        });

        if (authError) {
            console.error("Auth Error:", authError.message);
            alert("Login Failed: Invalid credentials.");
            return;
        }

        // 2. Fetch Verified Profile
        const { data: profile, error: profileError } = await window.supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profileError || !profile) {
            await window.supabase.auth.signOut();
            alert("Error: Profile not found. Access denied.");
            return;
        }

        // 3. Map to CRM session object
        const sessionUser = {
            id: profile.id,
            staffId: profile.staff_id,
            role: profile.role || 'sales',
            name: profile.name,
            avatar: profile.avatar_url || null
        };

        localStorage.setItem("currentUser", JSON.stringify(sessionUser));

        // 4. Route strictly
        redirectByRole(sessionUser);

    } catch (err) {
        console.error("Critical Login Error:", err);
        alert("A system error occurred. Access restricted.");
    } finally {
        btn.innerText = "Access Dashboard";
        btn.disabled = false;
    }
}

// 📐 ROUTE HELPER
function redirectByRole(user) {
    const rootPath = window.location.pathname.includes('/ADMIN/') || window.location.pathname.includes('\\ADMIN\\') ? '../' : '';
    const route = ROLE_DEFAULT_ROUTES[user.role] || "index.html";
    window.location.href = rootPath + route;
}

// 🔒 PROTECT PAGES (Asynchronous and Database Verified)
async function checkAuth(requiredModule) {
    const rootPath = window.location.pathname.includes('/ADMIN/') || window.location.pathname.includes('\\ADMIN\\') ? '../' : '';
    
    // 1. Check if token exists
    const { data: { user: authUser }, error: authError } = await window.supabase.auth.getUser();
    
    if (authError || !authUser) {
        console.warn("No active session or session expired.");
        logout();
        return null;
    }

    // 2. Fetch role from source of truth (Database)
    const { data: profile, error: profileError } = await window.supabase
        .from('profiles')
        .select('role, name, staff_id, avatar_url')
        .eq('id', authUser.id)
        .single();

    if (profileError || !profile) {
        console.error("Security breach: No profile found for authenticated user.");
        logout();
        return null;
    }

    // 3. Verify Permissions
    const authorizedModules = ROLE_PERMISSIONS[profile.role] || [];
    if (requiredModule && !authorizedModules.includes(requiredModule)) {
        console.warn(`Access denied for ${profile.role} on ${requiredModule}`);
        // If user is logged in but on the wrong page, redirect them to THEIR correct home
        redirectByRole(profile);
        return null;
    }

    // 4. Update UI Components
    if (document.getElementById("userRole")) {
        document.getElementById("userRole").innerText = profile.role.toUpperCase();
    }
    
    if (document.querySelector(".online-badge")) {
        const badge = document.querySelector(".online-badge");
        const formatRole = profile.role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        badge.innerHTML = `<div class="status-dot"></div> Online &nbsp;•&nbsp; <span style="color:var(--primary); font-weight:800; letter-spacing:0.5px;">[ ${formatRole} ]</span>`;
    }

    // Sync localStorage for UI display purposes (Name, Avatar)
    localStorage.setItem("currentUser", JSON.stringify({
        id: profile.id,
        staffId: profile.staff_id,
        role: profile.role,
        name: profile.name,
        avatar: profile.avatar_url
    }));
    
    return profile;
}
window.checkAuth = checkAuth;
window.login = login;
window.logout = logout;

// 📸 COMMON IMAGE UTILS
const crmUtils = {
  async compressAndUpload(file, bucket, prefix, user) {
    if (!file) throw new Error("Please capture or select an image proof first.");
    
    // 1. Simple Validation
    if (file.size > 5 * 1024 * 1024) throw new Error("Image size too large. Max 5MB allowed.");
    
    // 2. Rename File: {prefix}_{timestamp}_{staffId}.jpg
    const ext = file.name.split('.').pop();
    const fileName = `${prefix}_${Date.now()}_${user.staffId || 'anon'}.${ext}`;
    const filePath = `${fileName}`;

    // 3. Upload to Supabase Storage
    const { data, error } = await window.supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;

    // 4. Get Public URL
    const { data: { publicUrl } } = window.supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async updateProfile(userId, updates) {
    const { data, error } = await window.supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    
    // Update local session
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) {
      const newUser = { ...user, ...updates };
      if (updates.avatar_url) newUser.avatar = updates.avatar_url;
      localStorage.setItem("currentUser", JSON.stringify(newUser));
    }
    return data;
  },

  async fetchProfile(userId) {
    const { data, error } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};

window.crmUtils = crmUtils;
window.utils = crmUtils;

// 🚪 LOGOUT
async function logout() {
    const rootPath = window.location.pathname.includes('/ADMIN/') || window.location.pathname.includes('\\ADMIN\\') ? '../' : '';
    try {
        await window.supabase.auth.signOut();
    } catch (e) {
        console.warn("Sign out err:", e);
    }
    localStorage.clear();
    window.location.href = rootPath + "index.html"; 
}

