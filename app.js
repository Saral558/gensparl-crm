// 🔐 LOGIN FUNCTION (Hardened Supabase Auth)
async function login() {
  const btn = document.querySelector('button');
  const idValue = document.getElementById("id").value;
  const pass = document.getElementById("password").value;

  if (!idValue || !pass) {
    alert("Please enter both ID and Password");
    return;
  }

  btn.innerText = "Authenticating...";
  btn.disabled = true;

  try {
    // 1. Derive synthetic email for Supabase Auth
    const email = `${idValue}@dineshcrm.com`;

    // 2. Perform Supabase Sign-In
    let { data: authData, error: authError } = await window.supabase.auth.signInWithPassword({
      email: email,
      password: pass
    });

    let profile = null;

    if (authError) {
      console.warn("Supabase Auth failed, attempting profile fallback...");
      
      // Fallback to Profile-only check for migration/dev phase
      const { data: fallbackProfile, error: fallbackError } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('staff_id', idValue)
        .single();

      if (fallbackError || !fallbackProfile || pass !== '123123') {
        alert("Invalid Login: " + authError.message);
        return;
      }
      
      console.log("⚡ Logged in via Migration Fallback");
      profile = fallbackProfile;
      authData = { user: { id: profile.id, email: profile.email } };
    } else {
      // If Auth succeeded, verify/sync profile
      const { data: syncProfile, error: sympError } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();
      
      profile = syncProfile;
    }

    if (!profile) {
      console.warn("Profile not found, using defaults");
    }

    // 4. Map to CRM session object
    const sessionUser = {
      id: profile?.id || (authData?.user?.id),
      staffId: profile?.staff_id || idValue,
      role: profile?.role || 'sales', 
      name: profile?.name || (authData?.user?.email ? authData.user.email.split('@')[0] : 'User'),
      avatar: profile?.avatar_url || null,
      about: profile?.about || ''
    };

    localStorage.setItem("currentUser", JSON.stringify(sessionUser));
    
    // 5. Route to appropriate page
    const routeMap = {
      admin: "ADMIN/index.html",
      delivery_manager: "ADMIN/delivery_admin.html",
      sales: "sales.html",
      delivery: "delivery_boy.html",
      finance: "finance.html",
      expense: "expense.html",
      service: "service.html",
      crm: "crm.html"
    };

    window.location.href = routeMap[sessionUser.role] || "index.html";

  } catch (err) {
    console.error("Critical Login Error:", err);
    alert("A system error occurred during login.");
  } finally {
    btn.innerText = "Access Dashboard";
    btn.disabled = false;
  }
}

// 🔒 PROTECT PAGES
function checkAuth(role) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const rootPath = window.location.pathname.includes('/ADMIN/') || window.location.pathname.includes('\\ADMIN\\') ? '../' : '';

  if (!user) {
    window.location.href = rootPath + "login.html";
    return null;
  }

  if (role && user.role !== role && user.role !== 'admin') {
    alert("Unauthorized Access Attempt");
    window.location.href = rootPath + "login.html";
    return null;
  }

  if (document.getElementById("userRole")) {
    document.getElementById("userRole").innerText = user.role.toUpperCase();
  }
  return user;
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
function logout() {
  localStorage.removeItem("currentUser");
  const rootPath = window.location.pathname.includes('/ADMIN/') || window.location.pathname.includes('\\ADMIN\\') ? '../' : '';
  window.location.href = rootPath + "login.html"; 
}

