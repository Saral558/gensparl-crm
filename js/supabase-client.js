// ============================================================
// SUPABASE-CLIENT.JS — Supabase Initialization
// ============================================================

// These are our production credentials
const SUPABASE_URL = 'https://gyqficxgcbtbtvabfgqt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_T_i4I8IubnQKJM0zo9lrbA_gdpOVtil';

// Initialize the Supabase client globally
// In a real production app, we would fetch these from a secure config or env
try {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('⚡ Production Supabase Client Initialized');
} catch (err) {
    console.error('❌ Failed to initialize Supabase:', err);
}
