import PocketBase from 'pocketbase';

/**
 * Browser PocketBase singleton. Auth state is mirrored to a `pb_auth` cookie
 * (non-httpOnly, so the client can write it) so the server can read the session
 * on the next request. Import only from Client Components.
 */
let _pb: PocketBase | null = null;

export function getBrowserPb(): PocketBase {
  if (_pb) return _pb;
  const url = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
  const pb = new PocketBase(url);

  if (typeof document !== 'undefined') {
    // Restore any existing session, then keep the cookie in sync on changes.
    pb.authStore.loadFromCookie(document.cookie);
    pb.authStore.onChange(() => {
      document.cookie = pb.authStore.exportToCookie({
        httpOnly: false,
        sameSite: 'Lax',
        secure: location.protocol === 'https:',
        path: '/',
      });
    });
  }

  _pb = pb;
  return pb;
}
