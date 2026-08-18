-- ============================================================================
-- bKash manual payment flow — French Beauty BD
-- ============================================================================
-- Le paiement bKash est manuel : le client envoie l'argent vers un numéro fixe,
-- colle son TrxID sur le site, puis l'admin le vérifie à la main.
--
-- NOTE IMPORTANTE : la colonne `payment_status` EXISTE DÉJÀ sur `orders` avec la
-- contrainte historique ('pending' | 'paid' | 'failed'). On ne crée donc PAS de
-- doublon : on migre son vocabulaire vers les statuts du flux bKash. Le code
-- applicatif (app/api/orders/route.ts, lib/types/orders.ts, lib/airtable.ts) est
-- mis à jour en conséquence dans le même lot.
-- ============================================================================

begin;

-- 1. Nouvelles colonnes (idempotent) --------------------------------------------------
alter table public.orders
  add column if not exists order_number           text,
  add column if not exists trxid                   text,
  add column if not exists trxid_submitted_at      timestamptz,
  add column if not exists verified_at             timestamptz,
  add column if not exists verified_by             text,
  add column if not exists bkash_receiver_number   text,
  add column if not exists payment_notes           text;

-- 2. Réconciliation du vocabulaire payment_status -------------------------------------
--    (colonne pré-existante : 'pending' | 'paid' | 'failed')
alter table public.orders drop constraint if exists orders_payment_status_check;

update public.orders
set payment_status = case payment_status
  when 'pending' then 'en_attente_paiement'
  when 'paid'    then 'paye'
  when 'failed'  then 'refuse'
  else 'en_attente_paiement'
end;

alter table public.orders
  alter column payment_status set default 'en_attente_paiement';

alter table public.orders
  add constraint orders_payment_status_check
  check (payment_status = any (array[
    'en_attente_paiement',   -- commande créée, en attente que le client paie
    'paiement_a_verifier',   -- le client a soumis un TrxID, à vérifier par l'admin
    'paye',                  -- TrxID validé par l'admin
    'expire',                -- délai dépassé sans paiement
    'refuse'                 -- TrxID invalide / refusé par l'admin
  ]));

-- 3. order_number : génération auto FBD-YYMMDD-XXXXX -----------------------------------
create or replace function public.generate_order_number()
returns text
language plpgsql
as $$
declare
  candidate text;
begin
  loop
    candidate := 'FBD-' || to_char(now(), 'YYMMDD') || '-' ||
                 upper(substr(md5(random()::text || clock_timestamp()::text), 1, 5));
    exit when not exists (select 1 from public.orders where order_number = candidate);
  end loop;
  return candidate;
end;
$$;

create or replace function public.set_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null then
    new.order_number := public.generate_order_number();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_order_number on public.orders;
create trigger trg_set_order_number
  before insert on public.orders
  for each row execute function public.set_order_number();

-- Backfill des commandes existantes
update public.orders
set order_number = public.generate_order_number()
where order_number is null;

alter table public.orders alter column order_number set not null;
create unique index if not exists orders_order_number_key on public.orders (order_number);

-- 4. Index -----------------------------------------------------------------------------
-- File d'attente admin : filtre payment_status + tri chronologique
create index if not exists orders_payment_status_created_at_idx
  on public.orders (payment_status, created_at);

-- Un TrxID ne peut servir qu'une seule fois (unique partiel, ignore les NULL)
create unique index if not exists orders_trxid_unique_idx
  on public.orders (trxid) where trxid is not null;

-- 5. RLS : le client peut soumettre son TrxID -----------------------------------------
--    Les écritures "commande" restent globalement réservées au service-role.
--    On ouvre UNIQUEMENT la transition en_attente_paiement -> paiement_a_verifier,
--    et UNIQUEMENT sur 3 colonnes (grant colonne) pour empêcher toute altération
--    de total_bdt / shipping_address / status via la clé anon.
revoke update on public.orders from anon, authenticated;
grant  update (trxid, trxid_submitted_at, payment_status)
  on public.orders to anon, authenticated;

drop policy if exists orders_client_submit_payment on public.orders;
create policy orders_client_submit_payment on public.orders
  for update
  to anon, authenticated
  using  (payment_status = 'en_attente_paiement')   -- ligne ciblable seulement si non payée
  with check (payment_status = 'paiement_a_verifier'); -- ne peut PAS se marquer 'paye' soi-même

commit;
