-- ============================================================
-- STAFF INVENTORY TABLE — Dinesh Electronics CRM
-- ============================================================

CREATE TABLE IF NOT EXISTS public.staff_inventory (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name     TEXT NOT NULL,
    buying_price  NUMERIC(12, 2) NOT NULL CHECK (buying_price >= 0),
    selling_price NUMERIC(12, 2) CHECK (selling_price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    category      TEXT,
    staff_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status        TEXT NOT NULL DEFAULT 'NORMAL' CHECK (status IN ('NORMAL', 'LOW_STOCK')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_inventory_staff_id    ON public.staff_inventory (staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_inventory_status       ON public.staff_inventory (status);
CREATE INDEX IF NOT EXISTS idx_staff_inventory_updated_at  ON public.staff_inventory (updated_at DESC);

-- ── Auto-update `updated_at` on every row change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_staff_inventory_updated_at ON public.staff_inventory;
CREATE TRIGGER trg_staff_inventory_updated_at
    BEFORE UPDATE ON public.staff_inventory
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Auto-calculate status based on stock_quantity (< 20 = LOW_STOCK)
CREATE OR REPLACE FUNCTION public.calc_inventory_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.stock_quantity < 20 THEN
        NEW.status := 'LOW_STOCK';
    ELSE
        NEW.status := 'NORMAL';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_staff_inventory_status ON public.staff_inventory;
CREATE TRIGGER trg_staff_inventory_status
    BEFORE INSERT OR UPDATE ON public.staff_inventory
    FOR EACH ROW EXECUTE FUNCTION public.calc_inventory_status();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.staff_inventory ENABLE ROW LEVEL SECURITY;

-- Staff can SELECT their own items only
DROP POLICY IF EXISTS "Staff can view own inventory" ON public.staff_inventory;
CREATE POLICY "Staff can view own inventory"
    ON public.staff_inventory FOR SELECT
    USING (auth.uid() = staff_id);

-- Staff can INSERT their own items only
DROP POLICY IF EXISTS "Staff can insert own inventory" ON public.staff_inventory;
CREATE POLICY "Staff can insert own inventory"
    ON public.staff_inventory FOR INSERT
    WITH CHECK (auth.uid() = staff_id);

-- Staff can UPDATE their own items only
DROP POLICY IF EXISTS "Staff can update own inventory" ON public.staff_inventory;
CREATE POLICY "Staff can update own inventory"
    ON public.staff_inventory FOR UPDATE
    USING (auth.uid() = staff_id);

-- Staff can DELETE their own items only
DROP POLICY IF EXISTS "Staff can delete own inventory" ON public.staff_inventory;
CREATE POLICY "Staff can delete own inventory"
    ON public.staff_inventory FOR DELETE
    USING (auth.uid() = staff_id);

-- Admin service role bypasses RLS automatically (service_role key ignores RLS)
-- If using anon key for admin, add an admin policy matching your profiles.role column:
-- CREATE POLICY "Admin can view all inventory"
--     ON public.staff_inventory FOR SELECT
--     USING (
--         EXISTS (
--             SELECT 1 FROM public.profiles
--             WHERE id = auth.uid() AND role = 'admin'
--         )
--     );
