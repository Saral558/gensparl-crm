// ============================================================
// MOCK DATA — Seed data for first load
// ============================================================

window.seedMockData = () => {
    if (localStorage.getItem('crm_initialized')) return;

    // ---- USERS ----
    const users = [
        { id: 'u1', name: 'Admin Owner', username: 'admin', password: 'admin123', role: 'admin', mobile: '9876543210', active: true, created_at: daysAgo(60) + 'T09:00:00.000Z' },
        { id: 'u2', name: 'Bijay Kumar', username: 'bijay', password: 'sales123', role: 'sales', mobile: '9876543211', active: true, created_at: daysAgo(50) + 'T09:00:00.000Z' },
        { id: 'u3', name: 'Ramesh Sharma', username: 'ramesh', password: 'sales123', role: 'sales', mobile: '9876543212', active: true, created_at: daysAgo(45) + 'T09:00:00.000Z' },
        { id: 'u4', name: 'Deepak Singh', username: 'deepak', password: 'delivery123', role: 'delivery', mobile: '9876543213', active: true, created_at: daysAgo(40) + 'T09:00:00.000Z' },
        { id: 'u5', name: 'Sunil Verma', username: 'sunil', password: 'service123', role: 'service', mobile: '9876543214', active: true, created_at: daysAgo(35) + 'T09:00:00.000Z' },
        { id: 'u6', name: 'Ankit Joshi', username: 'ankit', password: 'sales123', role: 'sales', mobile: '9876543215', active: true, created_at: daysAgo(30) + 'T09:00:00.000Z' },
    ];
    db.set('users', users);

    // ---- SALES ----
    const sales = [
        { id: 's1', customer_name: 'Ravi Prasad', mobile: '9812345670', location: 'Patna', product_name: 'Samsung 55" QLED TV', serial_no: 'SAM5502341', quantity: 1, amount: 68000, payment_mode: 'Finance', narration: 'Customer took EMI via Bajaj', salesboy_id: 'u2', salesboy_name: 'Bijay Kumar', created_at: todayStr() + 'T10:15:00.000Z' },
        { id: 's2', customer_name: 'Priya Kumari', mobile: '9812345671', location: 'Danapur', product_name: 'LG 1.5T Split AC', serial_no: 'LG1502234', quantity: 1, amount: 45000, payment_mode: 'UPI', narration: '', salesboy_id: 'u3', salesboy_name: 'Ramesh Sharma', created_at: todayStr() + 'T11:30:00.000Z' },
        { id: 's3', customer_name: 'Mukesh Roy', mobile: '9812345672', location: 'Boring Road', product_name: 'Whirlpool 265L Refrigerator', serial_no: 'WP2654412', quantity: 1, amount: 28500, payment_mode: 'Cash', narration: 'Cash payment', salesboy_id: 'u2', salesboy_name: 'Bijay Kumar', created_at: todayStr() + 'T12:00:00.000Z' },
        { id: 's4', customer_name: 'Seema Devi', mobile: '9812345673', location: 'Kankarbagh', product_name: 'Samsung Galaxy M54', serial_no: 'SGM543321', quantity: 2, amount: 32000, payment_mode: 'Card', narration: '', salesboy_id: 'u6', salesboy_name: 'Ankit Joshi', created_at: todayStr() + 'T13:45:00.000Z' },
        { id: 's5', customer_name: 'Arun Tiwari', mobile: '9812345674', location: 'Rajendra Nagar', product_name: 'Voltas 1T Window AC', serial_no: 'VL1012332', quantity: 1, amount: 27000, payment_mode: 'UPI', narration: '', salesboy_id: 'u3', salesboy_name: 'Ramesh Sharma', created_at: todayStr() + 'T14:20:00.000Z' },
        { id: 's6', customer_name: 'Sunita Mishra', mobile: '9812345675', location: 'Digha Ghat', product_name: 'Havells Pedestal Fan', serial_no: 'HF5021', quantity: 3, amount: 9000, payment_mode: 'Cash', narration: 'Bulk purchase', salesboy_id: 'u2', salesboy_name: 'Bijay Kumar', created_at: daysAgo(1) + 'T09:30:00.000Z' },
        { id: 's7', customer_name: 'Rohit Gupta', mobile: '9812345676', location: 'Bailey Road', product_name: 'Bosch Washing Machine 7kg', serial_no: 'BW7003312', quantity: 1, amount: 42000, payment_mode: 'Finance', narration: '', salesboy_id: 'u3', salesboy_name: 'Ramesh Sharma', created_at: daysAgo(1) + 'T11:00:00.000Z' },
        { id: 's8', customer_name: 'Kavita Yadav', mobile: '9812345677', location: 'Frazer Road', product_name: 'Lenovo IdeaPad Laptop', serial_no: 'LNV5I321', quantity: 1, amount: 55000, payment_mode: 'Card', narration: 'Corporate purchase', salesboy_id: 'u6', salesboy_name: 'Ankit Joshi', created_at: daysAgo(2) + 'T10:00:00.000Z' },
        { id: 's9', customer_name: 'Vijay Sinha', mobile: '9812345678', location: 'Ashok Rajpath', product_name: 'Sony 43" LED TV', serial_no: 'SN4321122', quantity: 1, amount: 35000, payment_mode: 'UPI', narration: '', salesboy_id: 'u2', salesboy_name: 'Bijay Kumar', created_at: daysAgo(2) + 'T15:00:00.000Z' },
        { id: 's10', customer_name: 'Geeta Kumari', mobile: '9812345679', location: 'Khagaul', product_name: 'Onida Cooler 55L', serial_no: 'ONC5512', quantity: 2, amount: 14000, payment_mode: 'Cash', narration: '', salesboy_id: 'u3', salesboy_name: 'Ramesh Sharma', created_at: daysAgo(3) + 'T09:00:00.000Z' },
        { id: 's11', customer_name: 'Ajay Pandey', mobile: '9812345680', location: 'Patna Sahib', product_name: 'Samsung Galaxy M54', serial_no: 'SGM9921', quantity: 1, amount: 16000, payment_mode: 'UPI', narration: '', salesboy_id: 'u6', salesboy_name: 'Ankit Joshi', created_at: daysAgo(4) + 'T11:30:00.000Z' },
        { id: 's12', customer_name: 'Monu Kumar', mobile: '9812345681', location: 'Bankipur', product_name: 'LG 1.5T Split AC', serial_no: 'LG1599011', quantity: 1, amount: 45000, payment_mode: 'Finance', narration: '', salesboy_id: 'u2', salesboy_name: 'Bijay Kumar', created_at: daysAgo(5) + 'T14:00:00.000Z' },
        { id: 's13', customer_name: 'Renu Priya', mobile: '9812345682', location: 'Kurji', product_name: 'Bosch Washing Machine 7kg', serial_no: 'BW7099012', quantity: 1, amount: 42000, payment_mode: 'Card', narration: '', salesboy_id: 'u3', salesboy_name: 'Ramesh Sharma', created_at: daysAgo(5) + 'T16:00:00.000Z' },
        { id: 's14', customer_name: 'Rakesh Thakur', mobile: '9812345683', location: 'Mithapur', product_name: 'Havells Pedestal Fan', serial_no: 'HF9901', quantity: 2, amount: 6000, payment_mode: 'Cash', narration: '', salesboy_id: 'u6', salesboy_name: 'Ankit Joshi', created_at: daysAgo(6) + 'T10:00:00.000Z' },
        { id: 's15', customer_name: 'Deepika Singh', mobile: '9812345684', location: 'Gardanibagh', product_name: 'Onida Cooler 55L', serial_no: 'ONC1102', quantity: 1, amount: 7000, payment_mode: 'UPI', narration: '', salesboy_id: 'u2', salesboy_name: 'Bijay Kumar', created_at: daysAgo(7) + 'T09:30:00.000Z' },
    ];
    db.set('sales', sales);

    // ---- FINANCE ----
    const finance = [
        { id: 'f1', customer_name: 'Ravi Prasad', mobile: '9812345670', finance_company: 'Bajaj Finance', salesboy_id: 'u2', salesboy_name: 'Bijay Kumar', mop: 68000, dp: 15000, disbursement: 53000, emi: 3200, tenure: 18, total_emi: 57600, net_finance_cost: 4600, dbd_charges: 500, application_no: 'BAJ2024001', status: 'Approved', created_at: todayStr() + 'T10:30:00.000Z' },
        { id: 'f2', customer_name: 'Rohit Gupta', mobile: '9812345676', finance_company: 'HDB Financial', salesboy_id: 'u3', salesboy_name: 'Ramesh Sharma', mop: 42000, dp: 8000, disbursement: 34000, emi: 2200, tenure: 18, total_emi: 39600, net_finance_cost: 5600, dbd_charges: 0, application_no: 'HDB2024015', status: 'Approved', created_at: daysAgo(1) + 'T11:30:00.000Z' },
        { id: 'f3', customer_name: 'Monu Kumar', mobile: '9812345681', finance_company: 'Bajaj Finance', salesboy_id: 'u2', salesboy_name: 'Bijay Kumar', mop: 45000, dp: 10000, disbursement: 35000, emi: 2100, tenure: 18, total_emi: 37800, net_finance_cost: 2800, dbd_charges: 400, application_no: 'BAJ2024009', status: 'Approved', created_at: daysAgo(5) + 'T14:30:00.000Z' },
        { id: 'f4', customer_name: 'Nidhi Singh', mobile: '9812345685', finance_company: 'HDFC', salesboy_id: 'u6', salesboy_name: 'Ankit Joshi', mop: 75000, dp: 20000, disbursement: 55000, emi: 3800, tenure: 18, total_emi: 68400, net_finance_cost: 13400, dbd_charges: 700, application_no: '', status: 'Pending', created_at: todayStr() + 'T09:00:00.000Z' },
        { id: 'f5', customer_name: 'Sanjay Kumar', mobile: '9812345686', finance_company: 'Tata Capital', salesboy_id: 'u3', salesboy_name: 'Ramesh Sharma', mop: 35000, dp: 5000, disbursement: 30000, emi: 1900, tenure: 18, total_emi: 34200, net_finance_cost: 4200, dbd_charges: 0, application_no: 'TC2024002', status: 'Rejected', created_at: daysAgo(3) + 'T13:00:00.000Z' },
    ];
    db.set('finance', finance);

    // ---- GIFTS ----
    const gifts = [
        { id: 'g1', customer_name: 'Ravi Prasad', bill_no: 's1', gift_item: 'Bluetooth Speaker', gift_value: 1500, given_by_id: 'u2', given_by_name: 'Bijay Kumar', remarks: 'On TV purchase', created_at: todayStr() + 'T10:45:00.000Z' },
        { id: 'g2', customer_name: 'Priya Kumari', bill_no: 's2', gift_item: 'LED Bulb Pack (6)', gift_value: 500, given_by_id: 'u3', given_by_name: 'Ramesh Sharma', remarks: 'On AC purchase', created_at: todayStr() + 'T11:45:00.000Z' },
        { id: 'g3', customer_name: 'Kavita Yadav', bill_no: 's8', gift_item: 'Laptop Bag', gift_value: 1200, given_by_id: 'u6', given_by_name: 'Ankit Joshi', remarks: 'On laptop purchase', created_at: daysAgo(2) + 'T10:30:00.000Z' },
    ];
    db.set('gifts', gifts);

    // ---- EXPENSES ----
    const expenses = [
        { id: 'e1', type: 'Debit', amount: 25000, category: 'Salary', narration: 'Staff salary for February', added_by_id: 'u1', added_by_name: 'Admin Owner', created_at: daysAgo(5) + 'T09:00:00.000Z' },
        { id: 'e2', type: 'Debit', amount: 15000, category: 'Rent', narration: 'Shop rent for March', added_by_id: 'u1', added_by_name: 'Admin Owner', created_at: daysAgo(4) + 'T09:30:00.000Z' },
        { id: 'e3', type: 'Debit', amount: 3200, category: 'Electricity', narration: 'Electricity bill', added_by_id: 'u1', added_by_name: 'Admin Owner', created_at: daysAgo(3) + 'T10:00:00.000Z' },
        { id: 'e4', type: 'Debit', amount: 5500, category: 'Transport', narration: 'Delivery vehicle fuel + maintenance', added_by_id: 'u1', added_by_name: 'Admin Owner', created_at: daysAgo(2) + 'T11:00:00.000Z' },
        { id: 'e5', type: 'Debit', amount: 800, category: 'Refreshment', narration: 'Tea/snacks for staff & customers', added_by_id: 'u1', added_by_name: 'Admin Owner', created_at: todayStr() + 'T08:30:00.000Z' },
        { id: 'e6', type: 'Debit', amount: 1200, category: 'Stationary', narration: 'Office stationary', added_by_id: 'u1', added_by_name: 'Admin Owner', created_at: daysAgo(6) + 'T09:00:00.000Z' },
        { id: 'e7', type: 'Credit', amount: 5000, category: 'Sale Return', narration: 'Fan returned by customer - refund adjusted', added_by_id: 'u1', added_by_name: 'Admin Owner', created_at: daysAgo(1) + 'T14:00:00.000Z' },
        { id: 'e8', type: 'Credit', amount: 2500, category: 'Vendor Credit', narration: 'LG credit note against defective AC', added_by_id: 'u1', added_by_name: 'Admin Owner', created_at: daysAgo(3) + 'T15:00:00.000Z' },
        { id: 'e9', type: 'Debit', amount: 2000, category: 'Maintenance', narration: 'Display shelf repair', added_by_id: 'u1', added_by_name: 'Admin Owner', created_at: daysAgo(7) + 'T10:00:00.000Z' },
        { id: 'e10', type: 'Debit', amount: 500, category: 'Other', narration: 'Misc expense', added_by_id: 'u1', added_by_name: 'Admin Owner', created_at: todayStr() + 'T09:00:00.000Z' },
    ];
    db.set('expenses', expenses);
    db.setOne('opening_balance', { amount: 50000, month: new Date().toISOString().slice(0, 7) });

    // ---- SERVICE ----
    const service = [
        { id: 'sv1', customer_name: 'Anil Pandey', mobile: '9811100001', location: 'Danapur', product_name: 'LG 1.5T Split AC', serial_no: 'LG15AMP112', type: 'Service', problem: 'AC not cooling properly, gas leak suspected', login_id: 'SV2024001', assigned_to_id: 'u5', assigned_to_name: 'Sunil Verma', status: 'In Progress', resolution_notes: 'Gas charged, filter cleaned. Monitoring.', narration: '', created_at: daysAgo(3) + 'T10:00:00.000Z', resolved_at: null },
        { id: 'sv2', customer_name: 'Ranjana Kumari', mobile: '9811100002', location: 'Boring Road', product_name: 'Samsung LED TV 43"', serial_no: 'SN4312209', type: 'Service', problem: 'Screen flickering and no sound', login_id: 'SV2024002', assigned_to_id: 'u5', assigned_to_name: 'Sunil Verma', status: 'Pending', resolution_notes: '', narration: '', created_at: daysAgo(5) + 'T11:00:00.000Z', resolved_at: null },
        { id: 'sv3', customer_name: 'Suresh Gupta', mobile: '9811100003', location: 'Kankarbagh', product_name: 'Whirlpool Refrigerator', serial_no: 'WP2654002', type: 'Service', problem: 'Fridge not maintaining temperature', login_id: 'SV2024003', assigned_to_id: 'u5', assigned_to_name: 'Sunil Verma', status: 'Done', resolution_notes: 'Thermostat replaced. Working fine.', narration: '', created_at: daysAgo(6) + 'T09:00:00.000Z', resolved_at: daysAgo(4) + 'T14:00:00.000Z' },
        { id: 'sv4', customer_name: 'Meena Lal', mobile: '9811100004', location: 'Patna City', product_name: 'Bajaj Cooler 50L', serial_no: 'BC5021', type: 'Demo', problem: 'Need demo for new cooler purchase', login_id: '', assigned_to_id: 'u5', assigned_to_name: 'Sunil Verma', status: 'Pending', resolution_notes: '', narration: 'Customer will buy if demo is good', created_at: todayStr() + 'T09:00:00.000Z', resolved_at: null },
        { id: 'sv5', customer_name: 'Pankaj Mishra', mobile: '9811100005', location: 'Rajendra Nagar', product_name: 'Lenovo Laptop', serial_no: 'LNV5I001', type: 'Service', problem: 'Battery drain very fast, display issue', login_id: 'SV2024005', assigned_to_id: null, assigned_to_name: null, status: 'Pending', resolution_notes: '', narration: '', created_at: daysAgo(8) + 'T13:00:00.000Z', resolved_at: null },
        { id: 'sv6', customer_name: 'Shiv Kumar', mobile: '9811100006', location: 'Gardanibagh', product_name: 'Voltas Window AC', serial_no: 'VL1012001', type: 'Service', problem: 'AC making loud noise, water leaking', login_id: 'SV2024006', assigned_to_id: 'u5', assigned_to_name: 'Sunil Verma', status: 'In Progress', resolution_notes: 'Drain pipe cleaned. Fan checked.', narration: '', created_at: daysAgo(2) + 'T10:30:00.000Z', resolved_at: null },
    ];
    db.set('service', service);

    // ---- DELIVERIES ----
    const deliveries = [
        { id: 'd1', customer_name: 'Priya Kumari', mobile: '9812345671', location: 'Danapur, Near SBI Bank, Patna', delivery_date: todayStr(), product_details: 'LG 1.5T Split AC (Serial: LG1502234)', total_amount: 45000, due_amount: 0, paid_amount: 45000, delivery_boy_id: 'u4', delivery_boy_name: 'Deepak Singh', before_photo: null, after_photo: null, status: 'Out for Delivery', narration: 'Ground floor installation required', created_at: daysAgo(1) + 'T18:00:00.000Z' },
        { id: 'd2', customer_name: 'Mukesh Roy', mobile: '9812345672', location: 'Boring Road, House No 142, Patna', delivery_date: todayStr(), product_details: 'Whirlpool 265L Refrigerator (Serial: WP2654412)', total_amount: 28500, due_amount: 5000, paid_amount: 23500, delivery_boy_id: 'u4', delivery_boy_name: 'Deepak Singh', before_photo: null, after_photo: null, status: 'Scheduled', narration: 'Collect ₹5000 due on delivery', created_at: daysAgo(1) + 'T19:00:00.000Z' },
        { id: 'd3', customer_name: 'Rohit Gupta', mobile: '9812345676', location: 'Bailey Road, Flat 3B, Rainbow Apartments, Patna', delivery_date: daysAgo(2), product_details: 'Bosch Washing Machine 7kg (Serial: BW7003312)', total_amount: 42000, due_amount: 0, paid_amount: 42000, delivery_boy_id: 'u4', delivery_boy_name: 'Deepak Singh', before_photo: null, after_photo: null, status: 'Delivered', narration: '', created_at: daysAgo(3) + 'T10:00:00.000Z' },
        { id: 'd4', customer_name: 'Kavita Yadav', mobile: '9812345677', location: 'Frazer Road, Office 201, Tech Tower', delivery_date: daysAgo(1), product_details: 'Lenovo IdeaPad Laptop (Serial: LNV5I321)', total_amount: 55000, due_amount: 10000, paid_amount: 45000, delivery_boy_id: 'u4', delivery_boy_name: 'Deepak Singh', before_photo: null, after_photo: null, status: 'Pending', narration: 'Was not available yesterday, reschedule', created_at: daysAgo(3) + 'T11:00:00.000Z' },
        { id: 'd5', customer_name: 'Seema Devi', mobile: '9812345673', location: 'Kankarbagh, Block C, Patna', delivery_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], product_details: 'Samsung Galaxy M54 × 2 (Serial: SGM543321)', total_amount: 32000, due_amount: 0, paid_amount: 32000, delivery_boy_id: 'u4', delivery_boy_name: 'Deepak Singh', before_photo: null, after_photo: null, status: 'Scheduled', narration: '', created_at: todayStr() + 'T13:30:00.000Z' },
        { id: 'd6', customer_name: 'Arun Tiwari', mobile: '9812345674', location: 'Rajendra Nagar, Near Park, Patna', delivery_date: new Date(Date.now() + 172800000).toISOString().split('T')[0], product_details: 'Voltas 1T Window AC (Serial: VL1012332)', total_amount: 27000, due_amount: 5000, paid_amount: 22000, delivery_boy_id: 'u4', delivery_boy_name: 'Deepak Singh', before_photo: null, after_photo: null, status: 'Scheduled', narration: 'Collect balance on delivery', created_at: todayStr() + 'T14:00:00.000Z' },
        { id: 'd7', customer_name: 'Sunita Mishra', mobile: '9812345675', location: 'Digha Ghat, Main Road, Patna', delivery_date: daysAgo(2), product_details: 'Havells Pedestal Fan × 3', total_amount: 9000, due_amount: 0, paid_amount: 9000, delivery_boy_id: 'u4', delivery_boy_name: 'Deepak Singh', before_photo: null, after_photo: null, status: 'Delivered', narration: '', created_at: daysAgo(3) + 'T09:00:00.000Z' },
        { id: 'd8', customer_name: 'Renu Priya', mobile: '9812345682', location: 'Kurji, MG Road, Patna', delivery_date: daysAgo(1), product_details: 'Bosch Washing Machine 7kg (Serial: BW7099012)', total_amount: 42000, due_amount: 8000, paid_amount: 34000, delivery_boy_id: 'u4', delivery_boy_name: 'Deepak Singh', before_photo: null, after_photo: null, status: 'Failed', narration: 'Address not found, customer not picking call', created_at: daysAgo(2) + 'T08:00:00.000Z' },
    ];
    db.set('deliveries', deliveries);

    // ---- TRANSACTIONS ----
    const transactions = [
        { id: 't1', source: 'Cash', type: 'Credit', amount: 52500, reference_id: '', narration: 'Cash sales aggregated', added_by_id: 'u1', added_by_name: 'Admin Owner', date: todayStr(), created_at: todayStr() + 'T20:00:00.000Z' },
        { id: 't2', source: 'UPI', type: 'Credit', amount: 72000, reference_id: 'GPay_Agg', narration: 'UPI/GPay collections', added_by_id: 'u1', added_by_name: 'Admin Owner', date: todayStr(), created_at: todayStr() + 'T20:01:00.000Z' },
        { id: 't3', source: 'Expense', type: 'Debit', amount: 1300, reference_id: '', narration: 'Today expenses', added_by_id: 'u1', added_by_name: 'Admin Owner', date: todayStr(), created_at: todayStr() + 'T20:02:00.000Z' },
    ];
    db.set('transactions', transactions);

    localStorage.setItem('crm_initialized', 'true');
    console.log('✅ CRM Mock Data Initialized');
};

// Run seed on load
window.seedMockData();
