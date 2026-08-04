import PocketBase, { type RecordModel } from 'pocketbase';
import { headers } from 'next/headers';

/**
 * Per-request server PocketBase client, seeded from the request's `pb_auth`
 * cookie. Import from Server Components / Route Handlers.
 */
export function getServerPb(): PocketBase {
  const url = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
  const pb = new PocketBase(url);
  pb.authStore.loadFromCookie(headers().get('cookie') || '');
  return pb;
}

/**
 * Returns the authenticated user ONLY if verified against PocketBase and with
 * role 'admin'. The cookie's model is NOT trusted (it is client-writable) —
 * authRefresh re-validates the token and returns the authoritative record.
 */
export async function getVerifiedAdmin(pb: PocketBase): Promise<RecordModel | null> {
  if (!pb.authStore.isValid) return null;
  try {
    const { record } = await pb.collection('users').authRefresh();
    return record?.role === 'admin' ? record : null;
  } catch {
    return null;
  }
}

/** Returns the verified authenticated user (any role) or null. */
export async function getVerifiedUser(pb: PocketBase): Promise<RecordModel | null> {
  if (!pb.authStore.isValid) return null;
  try {
    const { record } = await pb.collection('users').authRefresh();
    return record ?? null;
  } catch {
    return null;
  }
}
