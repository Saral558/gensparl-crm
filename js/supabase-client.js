// ============================================================
// SUPABASE-CLIENT.JS — Supabase Initialization
// ============================================================

// These are our production credentials
const SUPABASE_URL = 'https://idtisrnhmivrvgzilxyo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_BNL9AQlF8tkW2TCH4_CFdQ_NYk_rVnV';

// Initialize the Supabase client globally
// In a real production app, we would fetch these from a secure config or env
try {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('⚡ Production Supabase Client Initialized');
} catch (err) {
    console.error('❌ Failed to initialize Supabase:', err);
}
