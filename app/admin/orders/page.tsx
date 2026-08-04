import Link from 'next/link';
import type { Order } from '../../../lib/types/orders';
import { getAllOrders } from '../../../lib/pocketbase/orders';
import { ORDER_STATUS_LABELS } from '../../../lib/i18n/strings';
import { formatBdt as fmt, formatDate } from '../../../lib/format';

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped:   'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const PAYMENT_STYLES: Record<string, string> = {
  cod:   'bg-stone-100 text-stone-700',
  bkash: 'bg-pink-100 text-pink-700',
  nagad: 'bg-orange-100 text-orange-700',
};

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  let orders: Order[] = [];
  let error: string | null = null;
  try {
    orders = await getAllOrders();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load orders.';
  }

  return (
    <main className="min-h-screen bg-canvas pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-6">

        {/* ── En-tête ── */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              French Beauty BD
            </p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">
              Orders
            </h1>
            <p className="mt-1 text-sm text-muted">
              {orders.length} order{orders.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2 text-xs text-muted shadow-card">
            <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
            Supabase connected
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            Loading error: {error}
          </div>
        )}

        {orders.length === 0 && !error && (
          <div className="rounded-2xl border border-hairline bg-surface py-16 text-center shadow-card">
            <p className="text-muted">No orders yet.</p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-hairline bg-surface shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline bg-canvas">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    Order
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    Customer
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    Products
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                    Total
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                    Payment
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    Date
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {orders.map((order) => {
                  const addr = order.shipping_address;
                  const items = order.order_items ?? [];
                  const productSummary = items
                    .map((i) => `${i.product?.name ?? '—'} ×${i.quantity}`)
                    .join(', ');

                  return (
                    <tr key={order.id} className="group transition hover:bg-highlight">
                      {/* Numéro */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-accent">
                          #{order.id.split('-')[0].toUpperCase()}
                        </span>
                      </td>

                      {/* Client */}
                      <td className="px-5 py-4">
                        <div className="font-medium text-ink">
                          {addr?.firstName} {addr?.lastName}
                        </div>
                        <div className="text-xs text-muted">{addr?.city}</div>
                      </td>

                      {/* Produits */}
                      <td className="max-w-[220px] px-5 py-4">
                        <p className="truncate text-xs text-muted">{productSummary || '—'}</p>
                        <p className="mt-0.5 text-xs text-muted/60">
                          {items.length} item{items.length !== 1 ? 's' : ''}
                        </p>
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4 text-right font-semibold text-ink">
                        {fmt(order.total_bdt)}
                      </td>

                      {/* Paiement */}
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${PAYMENT_STYLES[order.payment_method] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {order.payment_method.toUpperCase()}
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[order.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}
                        >
                          {ORDER_STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-xs text-muted">
                        {formatDate(order.created_at)}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}/slip`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-canvas px-3 py-1.5 text-xs font-medium text-ink transition hover:border-accent hover:bg-accent hover:text-white"
                        >
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 17H17.01M6 17h5m6 0v-5a2 2 0 00-2-2H7a2 2 0 00-2 2v5m14 0a2 2 0 01-2 2H5a2 2 0 01-2-2m14 0H5M9 11V7a3 3 0 016 0v4"
                            />
                          </svg>
                          Print slip
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
