/**
 * DELIVERY_STORE.JS — Refactored for the new 'orders' table.
 */

const DeliveryStore = {
    /**
     * getAll()
     * Fetches all orders accessible to the current user (filtered by RLS).
     */
    async getAll() {
        const client = window.supabase;
        if (!client) return [];
        try {
            const { data, error } = await client.from('orders')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            return data.map(d => ({
                id: d.order_id,
                orderNo: d.order_id.slice(0, 8).toUpperCase(),
                customerName: d.customer_name,
                address: d.address,
                phone: d.phone,
                items: Array.isArray(d.product_details) ? d.product_details : [],
                status: d.status,
                deliveryBoyId: d.delivery_boy_id,
                adminId: d.admin_id,
                dispatchTime: d.dispatch_time,
                deliveredTime: d.delivered_time,
                createdAt: d.created_at,
                totalAmount: d.total_amount || 0,
                advancePaid: d.advance_paid || 0,
                dueAmount: d.due_amount || 0,
                packingProof: d.packing_proof,
                deliveryProof: d.delivery_proof,
                deliveryDate: d.delivery_date,
                entryPhotos: d.entry_photos || []
            }));
        } catch (err) {
            console.error("Fetch Error:", err);
            return [];
        }
    },

    /**
     * saveOrder(data)
     * Creates a new pending order.
     */
    async saveOrder(data) {
        const client = window.supabase;
        if (!client) return { error: "No Supabase" };

        const mapping = {
            customer_name: data.customerName,
            address: data.address,
            phone: data.phone,
            product_details: data.items || [],
            total_amount: data.totalAmount || 0,
            advance_paid: data.advancePaid || 0,
            due_amount: (data.totalAmount || 0) - (data.advancePaid || 0),
            delivery_date: data.deliveryDate || null,
            status: 'pending',
            entry_photos: data.entryPhotos || []
        };

        try {
            const { data: result, error } = await client.from("orders").insert([mapping]).select();
            if (error) throw error;
            return { data: result[0] };
        } catch (err) {
            console.error("Insert Error:", err);
            return { error: err };
        }
    },

    /**
     * dispatchOrder(orderId, deliveryBoyId, adminId)
     * Admin dispatches order to assigned delivery boy.
     */
    async dispatchOrder(orderId, deliveryBoyId, adminId) {
        const client = window.supabase;
        if (!client) return { error: "No Supabase" };

        try {
            const { data, error } = await client.from('orders')
                .update({ 
                    status: 'assigned', 
                    delivery_boy_id: deliveryBoyId,
                    admin_id: adminId,
                    dispatch_time: new Date().toISOString()
                })
                .eq('order_id', orderId)
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (err) {
            console.error("Dispatch Error:", err);
            return { error: err };
        }
    },

    /**
     * pickOrder(orderId)
     * Delivery boy marks order as picked up.
     */
    async pickOrder(orderId) {
        const client = window.supabase;
        if (!client) return { error: "No Supabase" };

        try {
            const { data, error } = await client.from('orders')
                .update({ status: 'picked' })
                .eq('order_id', orderId)
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (err) {
            console.error("Pick Error:", err);
            return { error: err };
        }
    },

    /**
     * completeOrder(orderId)
     * Delivery boy marks order as delivered.
     */
    async completeOrder(orderId) {
        const client = window.supabase;
        if (!client) return { error: "No Supabase" };

        try {
            const { data, error } = await client.from('orders')
                .update({ 
                    status: 'delivered',
                    delivered_time: new Date().toISOString()
                })
                .eq('order_id', orderId)
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (err) {
            console.error("Complete Error:", err);
            return { error: err };
        }
    },

    /**
     * updateOrder(orderId, updates)
     * Generic update for any order fields.
     */
    async updateOrder(orderId, updates) {
        const client = window.supabase;
        if (!client) return { error: "No Supabase" };

        try {
            const { data, error } = await client.from('orders')
                .update(updates)
                .eq('order_id', orderId)
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (err) {
            console.error("Update Error:", err);
            return { error: err };
        }
    },

    /**
     * getDeliveryStaff()
     * Fetches available delivery profiles for assignment.
     */
    async getDeliveryStaff() {
        const client = window.supabase;
        if (!client) return [];
        try {
            const { data, error } = await client.from('profiles').select('id, staff_id, name').eq('role', 'delivery');
            if (error) throw error;
            return data;
        } catch (err) {
            console.error('Staff Fetch Error:', err);
            return [];
        }
    }
};

window.DeliveryStore = DeliveryStore;
