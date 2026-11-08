'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '../../lib/supabase/client';
import { useCart } from '../../lib/cart-context';
import { formatBdt, formatDate } from '../../lib/format';
import { whatsappLink } from '../../lib/contact';
import { validatePassword, PASSWORD_MIN_LENGTH, PASSWORD_HINT } from '../../lib/password-policy';
import type { AccountOrder, AccountAddress } from '../../lib/supabase/account';

type Tab = 'home' | 'orders' | 'addresses' | 'info';

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmed', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  shipped: { label: 'Shipped', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  delivered: { label: 'Delivered', cls: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-700 border-red-200' },
};
const TIMELINE = ['pending', 'confirmed', 'shipped', 'delivered'] as const;
const PAY: Record<string, string> = { bkash: 'bKash', nagad: 'Nagad', cod: 'Cash on Delivery' };

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, cls: 'bg-surface text-muted border-hairline' };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${s.cls}`}>
      {s.label}
    </span>
  );
}

const NAV: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: 'Overview', icon: 'M3 12l9-9 9 9M5 10v10h14V10' },
  { key: 'orders', label: 'My Orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 11H4L5 9z' },
  { key: 'addresses', label: 'Addresses', icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' },
  { key: 'info', label: 'My Details', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

export default function AccountClient({
  userId,
  email,
  profile,
  orders,
  addresses,
}: {
  userId: string;
  email: string;
  profile: { fullName: string; phone: string };
  orders: AccountOrder[];
  addresses: AccountAddress[];
}) {
  const router = useRouter();
  const { addItem, updateQuantity } = useCart();
  const [tab, setTab] = useState<Tab>('home');
  const [selected, setSelected] = useState<AccountOrder | null>(null);

  const firstName = (profile.fullName.trim().split(/\s+/)[0] || email.split('@')[0] || 'there');

  async function logout() {
    await getBrowserSupabase().auth.signOut();
    router.push('/');
    router.refresh();
  }

  function openOrder(o: AccountOrder) {
    setSelected(o);
    setTab('orders');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  }

  function reorder(o: AccountOrder) {
    const items = o.items.filter((it) => it.product?.purchasable && it.product.ref != null);
    if (items.length === 0) return;
    items.forEach((it) => {
      const p = it.product!;
      addItem({
        id: p.ref as number,
        sku: p.sku ?? '',
        name: p.name,
        brand: p.brand,
        volume: p.volume,
        priceEur: p.priceEur,
        priceBdt: p.priceBdt,
        image: p.image ?? '',
      });
      if (it.quantity > 1) updateQuantity(p.ref as number, it.quantity);
    });
    router.push('/cart');
  }

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-12">
        {/* Header */}
        <div className="mb-5 flex items-end justify-between gap-3 md:mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted">My account</p>
            <h1 className="font-serif text-2xl text-ink md:text-3xl">Hello, {firstName}</h1>
          </div>
          <button
            onClick={logout}
            className="shrink-0 rounded-full border border-hairline px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted transition-colors hover:border-accent hover:text-accent"
          >
            Sign out
          </button>
        </div>

        {/* Mobile tabs */}
        <nav className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => { setTab(n.key); setSelected(null); }}
              className={`shrink-0 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                tab === n.key ? 'border-accent bg-accent text-white' : 'border-hairline bg-white text-muted'
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden md:block">
            <div className="sticky top-6 rounded-2xl border border-hairline bg-white p-2 shadow-card">
              {NAV.map((n) => (
                <button
                  key={n.key}
                  onClick={() => { setTab(n.key); setSelected(null); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                    tab === n.key ? 'bg-accent/10 text-accent' : 'text-muted hover:bg-surface hover:text-ink'
                  }`}
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={n.icon} />
                  </svg>
                  {n.label}
                </button>
              ))}
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.1em] text-muted transition-colors hover:bg-surface hover:text-ink"
              >
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </aside>

          {/* Content */}
          <section className="min-w-0">
            {tab === 'home' && <HomeTab firstName={firstName} orders={orders} onOpenOrder={openOrder} onGoOrders={() => setTab('orders')} />}
            {tab === 'orders' && (
              selected
                ? <OrderDetail order={selected} onBack={() => setSelected(null)} onReorder={reorder} />
                : <OrdersTab orders={orders} onOpen={openOrder} />
            )}
            {tab === 'addresses' && <AddressesTab userId={userId} initial={addresses} />}
            {tab === 'info' && <InfoTab email={email} profile={profile} />}
          </section>
        </div>
      </div>
    </main>
  );
}

/* ───────────── Home ───────────── */
function HomeTab({ firstName, orders, onOpenOrder, onGoOrders }: {
  firstName: string; orders: AccountOrder[]; onOpenOrder: (o: AccountOrder) => void; onGoOrders: () => void;
}) {
  const last = orders[0];
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card md:p-8">
        <h2 className="font-serif text-xl text-ink md:text-2xl">Welcome back, {firstName}.</h2>
        <p className="mt-2 max-w-md text-sm text-muted">Track your orders, manage your addresses and keep your details up to date — all in one place.</p>
        <Link href="/shop" className="mt-5 inline-flex items-center gap-2 rounded-none bg-accent px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-accent/90">
          Continue shopping
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Last order */}
        <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted">Latest order</p>
          {last ? (
            <button onClick={() => onOpenOrder(last)} className="mt-3 block w-full text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="font-serif text-lg text-ink">{last.orderNumber}</span>
                <StatusBadge status={last.status} />
              </div>
              <p className="mt-1 text-xs text-muted">{formatDate(last.createdAt)} · {formatBdt(last.totalBdt)}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">View details
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </span>
            </button>
          ) : (
            <p className="mt-3 text-sm text-muted">No orders yet.</p>
          )}
        </div>
        {/* Count */}
        <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted">Total orders</p>
          <p className="mt-3 font-serif text-4xl text-ink">{orders.length}</p>
          {orders.length > 0 && (
            <button onClick={onGoOrders} className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
              See all orders
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────── Orders list ───────────── */
function OrdersTab({ orders, onOpen }: { orders: AccountOrder[]; onOpen: (o: AccountOrder) => void }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-hairline bg-white p-12 text-center shadow-card">
        <p className="font-serif text-xl italic text-ink">No orders yet</p>
        <p className="mt-2 text-sm text-muted">When you place an order, it will show up here.</p>
        <Link href="/shop" className="mt-5 inline-flex items-center rounded-none bg-ink px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-accent">
          Browse the shop
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <button key={o.id} onClick={() => onOpen(o)} className="block w-full rounded-2xl border border-hairline bg-white p-5 text-left shadow-card transition-colors hover:border-accent/40">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-serif text-lg text-ink">{o.orderNumber}</p>
              <p className="text-xs text-muted">{formatDate(o.createdAt)}</p>
            </div>
            <StatusBadge status={o.status} />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex -space-x-2">
              {o.items.slice(0, 4).map((it, i) => (
                <span key={i} className="h-11 w-11 overflow-hidden rounded-lg border border-hairline bg-surface">
                  {it.product?.image ? <img src={it.product.image} alt="" className="h-full w-full object-cover" /> : null}
                </span>
              ))}
              {o.items.length > 4 && (
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-hairline bg-surface text-[11px] font-semibold text-muted">+{o.items.length - 4}</span>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Total</p>
              <p className="font-serif text-lg text-ink">{formatBdt(o.totalBdt)}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ───────────── Order detail ───────────── */
function OrderDetail({ order, onBack, onReorder }: { order: AccountOrder; onBack: () => void; onReorder: (o: AccountOrder) => void }) {
  const addr = order.shippingAddress ?? {};
  const name = [addr.firstName, addr.lastName].filter(Boolean).join(' ') || addr.full_name || '';
  const cancelled = order.status === 'cancelled';
  const activeIdx = TIMELINE.indexOf(order.status as (typeof TIMELINE)[number]);
  const help = whatsappLink
    ? `${whatsappLink}?text=${encodeURIComponent(`Hello, I need help with my order ${order.orderNumber}.`)}`
    : null;
  const anyReorderable = order.items.some((it) => it.product?.purchasable);

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted hover:text-ink">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to orders
      </button>

      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl text-ink">{order.orderNumber}</h2>
            <p className="text-xs text-muted">Placed {formatDate(order.createdAt)}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Timeline */}
        {cancelled ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">This order was cancelled.</div>
        ) : (
          <ol className="mt-6 flex items-center">
            {TIMELINE.map((step, i) => {
              const done = i <= activeIdx;
              return (
                <li key={step} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] ${done ? 'border-accent bg-accent text-white' : 'border-hairline bg-white text-muted'}`}>
                      {done ? (
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      ) : i + 1}
                    </span>
                    <span className={`mt-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] ${done ? 'text-ink' : 'text-muted'}`}>{STATUS[step].label}</span>
                  </div>
                  {i < TIMELINE.length - 1 && <span className={`mx-1 h-0.5 flex-1 ${i < activeIdx ? 'bg-accent' : 'bg-hairline'}`} />}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Products */}
      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
        <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-muted">Items</p>
        <div className="space-y-4">
          {order.items.map((it, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-hairline bg-surface">
                {it.product?.image ? <img src={it.product.image} alt="" className="h-full w-full object-cover" /> : null}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{it.product?.name ?? 'Product'}</p>
                <p className="text-xs text-muted">{it.product?.brand} · Qty {it.quantity}</p>
              </div>
              <p className="shrink-0 text-sm font-medium text-ink">{formatBdt(it.unitPriceBdt * it.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted">Total</span>
          <span className="font-serif text-xl text-ink">{formatBdt(order.totalBdt)}</span>
        </div>
      </div>

      {/* Address + payment */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
          <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-muted">Delivery address</p>
          <p className="text-sm font-medium text-ink">{name}</p>
          {addr.phone && <p className="text-sm text-muted">{addr.phone}</p>}
          <p className="mt-1 text-sm text-muted">{addr.address || addr.address_line}</p>
          {(addr.city || addr.zone || addr.district) && (
            <p className="text-sm text-muted">{[addr.zone, addr.city || addr.district].filter(Boolean).join(', ')}</p>
          )}
        </div>
        <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
          <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-muted">Payment</p>
          <p className="text-sm font-medium text-ink">{PAY[order.paymentMethod] ?? order.paymentMethod}</p>
          <p className="mt-1 text-xs text-muted">{order.paymentStatus === 'paye' ? 'Paid' : order.paymentStatus === 'refuse' ? 'Refused' : 'Awaiting verification'}</p>
          {order.trackingNumber && <p className="mt-2 text-xs text-muted">Tracking: {order.trackingNumber}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => onReorder(order)}
          disabled={!anyReorderable}
          className="flex-1 rounded-none bg-ink px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          Order again
        </button>
        {help && (
          <a href={help} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-none border border-hairline bg-white px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-ink transition-colors hover:border-accent hover:text-accent">
            Need help?
          </a>
        )}
      </div>
    </div>
  );
}

/* ───────────── Addresses ───────────── */
type AddrForm = { id?: string; fullName: string; phone: string; district: string; zone: string; addressLine: string; isDefault: boolean };
const emptyAddr: AddrForm = { fullName: '', phone: '+880 ', district: '', zone: '', addressLine: '', isDefault: false };

function AddressesTab({ userId, initial }: { userId: string; initial: AccountAddress[] }) {
  const [list, setList] = useState<AccountAddress[]>(initial);
  const [form, setForm] = useState<AddrForm | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const { data } = await getBrowserSupabase()
      .from('addresses')
      .select('id, full_name, phone, district, zone, address_line, is_default')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });
    setList((data ?? []).map((a: any) => ({ id: a.id, fullName: a.full_name, phone: a.phone, district: a.district, zone: a.zone, addressLine: a.address_line, isDefault: a.is_default })));
  }

  async function save() {
    if (!form) return;
    if (!form.fullName.trim() || !form.phone.trim() || !form.addressLine.trim()) {
      setError('Name, phone and address are required.');
      return;
    }
    setBusy(true); setError(null);
    const sb = getBrowserSupabase();
    const payload = {
      user_id: userId,
      full_name: form.fullName.trim(),
      phone: form.phone.trim(),
      district: form.district.trim() || null,
      zone: form.zone.trim() || null,
      address_line: form.addressLine.trim(),
      is_default: form.isDefault,
    };
    const res = form.id
      ? await sb.from('addresses').update(payload).eq('id', form.id)
      : await sb.from('addresses').insert(payload);
    setBusy(false);
    if (res.error) { setError(res.error.message); return; }
    setForm(null);
    await reload();
  }

  async function remove(id: string) {
    setBusy(true);
    await getBrowserSupabase().from('addresses').delete().eq('id', id);
    setBusy(false);
    await reload();
  }

  async function makeDefault(id: string) {
    setBusy(true);
    await getBrowserSupabase().from('addresses').update({ is_default: true }).eq('id', id);
    setBusy(false);
    await reload();
  }

  if (form) {
    return (
      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
        <h2 className="mb-5 font-serif text-xl text-ink">{form.id ? 'Edit address' : 'Add address'}</h2>
        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="space-y-4">
          <Field label="Full name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
          <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+880 1XXXXXXXXX" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="District" value={form.district} onChange={(v) => setForm({ ...form, district: v })} placeholder="Dhaka" />
            <Field label="Zone / Area" value={form.zone} onChange={(v) => setForm({ ...form, zone: v })} placeholder="Banani" />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">Full address</label>
            <textarea value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} rows={3}
              className="w-full border border-hairline bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-accent" />
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="h-4 w-4 accent-[#C9513A]" />
            Set as default address
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={save} disabled={busy} className="rounded-none bg-ink px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-accent disabled:opacity-50">
            {busy ? 'Saving…' : 'Save address'}
          </button>
          <button onClick={() => { setForm(null); setError(null); }} className="rounded-none border border-hairline px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted hover:text-ink">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-ink">My addresses</h2>
        <button onClick={() => setForm({ ...emptyAddr })} className="rounded-none bg-accent px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-accent/90">
          + Add
        </button>
      </div>
      {list.length === 0 ? (
        <div className="rounded-2xl border border-hairline bg-white p-10 text-center shadow-card">
          <p className="text-sm text-muted">No saved addresses yet. Add one to speed up checkout.</p>
        </div>
      ) : (
        list.map((a) => (
          <div key={a.id} className="rounded-2xl border border-hairline bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink">{a.fullName}</p>
                  {a.isDefault && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-accent">Default</span>}
                </div>
                <p className="text-sm text-muted">{a.phone}</p>
                <p className="mt-1 text-sm text-muted">{a.addressLine}</p>
                {(a.zone || a.district) && <p className="text-sm text-muted">{[a.zone, a.district].filter(Boolean).join(', ')}</p>}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-[11px] font-semibold uppercase tracking-[0.1em]">
              <button onClick={() => setForm({ id: a.id, fullName: a.fullName, phone: a.phone, district: a.district ?? '', zone: a.zone ?? '', addressLine: a.addressLine, isDefault: a.isDefault })} className="text-ink hover:text-accent">Edit</button>
              {!a.isDefault && <button onClick={() => makeDefault(a.id)} disabled={busy} className="text-muted hover:text-accent">Set default</button>}
              <button onClick={() => remove(a.id)} disabled={busy} className="text-muted hover:text-red-600">Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-hairline bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-accent" />
    </div>
  );
}

/* ───────────── Info ───────────── */
function InfoTab({ email, profile }: { email: string; profile: { fullName: string; phone: string } }) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [savingInfo, setSavingInfo] = useState(false);

  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  async function saveInfo() {
    setSavingInfo(true); setSavedMsg(null);
    const sb = getBrowserSupabase();
    const { data: { user } } = await sb.auth.getUser();
    if (user) {
      await sb.from('profiles').update({ full_name: fullName.trim(), phone: phone.trim() }).eq('id', user.id);
      await sb.auth.updateUser({ data: { full_name: fullName.trim() } });
    }
    setSavingInfo(false);
    setSavedMsg('Saved.');
  }

  async function changePassword() {
    setPwErr(null); setPwMsg(null);
    const err = validatePassword(pw);
    if (err) { setPwErr(err); return; }
    if (pw !== pw2) { setPwErr('Passwords do not match.'); return; }
    setSavingPw(true);
    const { error } = await getBrowserSupabase().auth.updateUser({ password: pw });
    setSavingPw(false);
    if (error) { setPwErr(error.message); return; }
    setPw(''); setPw2(''); setPwMsg('Password updated.');
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
        <h2 className="mb-5 font-serif text-xl text-ink">My details</h2>
        <div className="space-y-4">
          <Field label="Full name" value={fullName} onChange={setFullName} />
          <Field label="Phone" value={phone} onChange={setPhone} placeholder="+880 1XXXXXXXXX" />
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">Email (cannot be changed)</label>
            <input value={email} readOnly className="w-full cursor-not-allowed border border-hairline bg-surface px-4 py-3 text-sm text-muted outline-none" />
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button onClick={saveInfo} disabled={savingInfo} className="rounded-none bg-ink px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-accent disabled:opacity-50">
            {savingInfo ? 'Saving…' : 'Save changes'}
          </button>
          {savedMsg && <span className="text-sm text-green-700">{savedMsg}</span>}
        </div>
      </div>

      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
        <h2 className="mb-1 font-serif text-xl text-ink">Change password</h2>
        <p className="mb-5 text-xs text-muted">{PASSWORD_HINT}</p>
        {pwErr && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pwErr}</div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">New password</label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} minLength={PASSWORD_MIN_LENGTH} placeholder="••••••••••"
              className="w-full border border-hairline bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-accent" />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">Confirm</label>
            <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} minLength={PASSWORD_MIN_LENGTH} placeholder="••••••••••"
              className="w-full border border-hairline bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-accent" />
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button onClick={changePassword} disabled={savingPw} className="rounded-none border border-ink px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-ink transition-colors hover:bg-ink hover:text-white disabled:opacity-50">
            {savingPw ? 'Updating…' : 'Update password'}
          </button>
          {pwMsg && <span className="text-sm text-green-700">{pwMsg}</span>}
        </div>
      </div>
    </div>
  );
}
