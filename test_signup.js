const SUPABASE_URL = 'https://gyqficxgcbtbtvabfgqt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_T_i4I8IubnQKJM0zo9lrbA_gdpOVtil';

async function test() {
    const email = 'tester' + Math.floor(Math.random() * 1000000) + '@dineshcrm.com';
    const password = '123654';
    console.log(`Trying to register: ${email}...`);
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    console.log(JSON.stringify(data));
}
test();
