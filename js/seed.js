// ============================================================
// SEED.JS — Migrate Mock Data to Supabase
// ============================================================

window.runSeed = async () => {
    console.log('🌱 Starting Supabase Seeding (ID-based)...');
    showToast('Starting migration to Supabase...', 'info');

    // 1. USERS (Auth & Profiles)
    const usersToCreate = [
        { staffId: '10001', name: 'Admin', role: 'admin', password: '123123' },
        { staffId: '10002', name: 'Bijay', role: 'sales', password: '123123' },
        { staffId: '10003', name: 'Deepak', role: 'delivery', password: '123123' },
        { staffId: '10004', name: 'Sunil', role: 'service', password: '123123' },
        { staffId: '10005', name: 'Ramesh', role: 'finance', password: '123123' },
        { staffId: '10006', name: 'Mohan', role: 'expense', password: '123123' },
        { staffId: '10007', name: 'Rajesh', role: 'crm', password: '123123' },
        { staffId: '10008', name: 'Vikram', role: 'delivery_manager', password: '123123' }
    ];

    for (const u of usersToCreate) {
        console.log(`Checking user ID: ${u.staffId}...`);
        const email = `${u.staffId}@dineshcrm.com`;
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: u.password,
                options: {
                    data: {
                        name: u.name,
                        role: u.role,
                        staff_id: u.staffId
                    }
                }
            });

            if (error) {
                if (error.message.includes('already registered')) {
                    console.log(`ID ${u.staffId} already exists.`);
                } else {
                    console.warn(`Error signing up ID ${u.staffId}:`, error.message);
                }
            } else if (data.user) {
                console.log(`User created for ID: ${u.staffId}`);
                await supabase.from('profiles').upsert({
                    id: data.user.id,
                    staff_id: u.staffId,
                    name: u.name,
                    role: u.role,
                    email: email
                });
            }
        } catch (err) {
            console.error(`Unexpected error for ID ${u.staffId}:`, err);
        }
    }

    // 2. Clear CRM Seeding Flag
    localStorage.removeItem('crm_initialized');

    // 3. Modules data seeding
    if (window.seedMockData) {
        console.log('📦 Seeding Modules data...');
        await window.seedMockData();
    }

    console.log('✅ Seeding Complete');
    showToast('ID-based Login Ready! ⚡', 'success');
};
