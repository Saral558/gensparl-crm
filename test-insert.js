const SUPABASE_URL = 'https://idtisrnhmivrvgzilxyo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_BNL9AQlF8tkW2TCH4_CFdQ_NYk_rVnV';

const payload = {
    staff_id: '1003',
    salesboy_id: null,
    salesboy_name: 'Test Name',
    staff_name: 'Test Name',
    customer_name: 'Test Customer',
    mobile: '1234567890',
    mobile_no: '1234567890',
    location: 'Test Location',
    product_name: 'Test Product',
    serial_no: '1234',
    quantity: 1,
    amount: 1000,
    sale_amount: 1000,
    profit_amount: 100,
    payment_mode: 'cash',
    payment_method: 'cash',
    narration: 'test',
    image_url: 'http://example.com/image.jpg',
    image_verified: false
};

async function testInsert() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/sales`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Body:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

testInsert();
