import PocketBase from 'pocketbase';

/**
 * Superuser PocketBase client. Bypasses collection API rules entirely.
 *
 * SERVER-ONLY. Never import from a Client Component or expose the credentials.
 * Used for privileged operations behind server logic:
 *  - creating orders with a server-recomputed total (checkout)
 *  - reading all orders in the admin back-office
 */
export async function createAdminPb() {
  const url = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
  const email = process.env.POCKETBASE_ADMIN_EMAIL;
  const password = process.env.POCKETBASE_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'POCKETBASE_ADMIN_EMAIL / POCKETBASE_ADMIN_PASSWORD are not set (server-only superuser credentials).',
    );
  }
  const pb = new PocketBase(url);
  pb.beforeSend = (u, options) => {
    (options as any).cache = 'no-store';
    return { url: u, options };
  };
  await pb.collection('_superusers').authWithPassword(email, password);
  return pb;
}
