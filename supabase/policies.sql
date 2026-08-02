-- ============================================================================
-- French Beauty BD — RLS hardening (LOT 1)
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- It is idempotent: safe to run more than once.
--
-- WHAT IT FIXES
--   * orders / order_items were world-readable (SELECT USING true) and
--     world-insertable (INSERT WITH CHECK true) — anyone could read every
--     customer's name/phone/address and insert forged orders.
--   * Adds profiles.role for the admin back-office guard.
--
-- AFTER THIS SCRIPT
--   * anon: can read `products` only. No access to orders/order_items.
--   * authenticated: can read ONLY their own orders/order_items.
--   * order creation happens exclusively via /api/orders (service_role),
--     which bypasses RLS — so no INSERT policy is granted to anon/authenticated.
--   * admin back-office reads via service_role behind an auth guard.
-- ============================================================================

begin;

-- ── 1. profiles.role (admin flag) ──────────────────────────────────────────
alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles
  drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin'));

-- ── 2. ORDERS ───────────────────────────────────────────────────────────────
-- Remove the permissive policies.
drop policy if exists admin_read_all_orders    on public.orders;      -- SELECT true (LEAK)
drop policy if exists anyone_can_insert_order  on public.orders;      -- INSERT true (FORGERY)

-- Keep authenticated users able to read/manage ONLY their own orders.
drop policy if exists orders_own on public.orders;
create policy orders_select_own on public.orders
  for select
  to authenticated
  using (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policy for anon/authenticated on purpose:
-- writes go through the server (service_role) only.

-- ── 3. ORDER_ITEMS ───────────────────────────────────────────────────────────
drop policy if exists admin_read_all_order_items   on public.order_items;  -- SELECT true (LEAK)
drop policy if exists anyone_can_insert_order_item on public.order_items;  -- INSERT true (FORGERY)

drop policy if exists order_items_own on public.order_items;
create policy order_items_select_own on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

-- ── 4. PRODUCTS ───────────────────────────────────────────────────────────────
-- Public read is intended. No write policy => anon/authenticated cannot write.
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select
  to anon, authenticated
  using (true);

commit;

-- ============================================================================
-- 5. PROMOTE THE ADMIN  — run manually, once, with the real admin email.
--    The user must already have signed up (row exists in auth.users).
-- ----------------------------------------------------------------------------
-- update public.profiles
--   set role = 'admin'
--   where id = (select id from auth.users where email = 'REPLACE_WITH_ADMIN_EMAIL');
--
-- Verify:
--   select p.role, u.email
--   from public.profiles p join auth.users u on u.id = p.id
--   where p.role = 'admin';
-- ============================================================================
