import { NextResponse } from 'next/server';
import { createAdminSupabase } from '../../../../../lib/supabase/admin';
import { BKASH_RECEIVER_NUMBER, isPlausibleTrxId, normalizeTrxId } from '../../../../../lib/bkash';

export const dynamic = 'force-dynamic';

const BUCKET = process.env.SUPABASE_PAYMENT_PROOF_BUCKET || 'payment-proofs';
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Client submission of a bKash payment (manual verification).
 *
 * The client uploads a SCREENSHOT of their bKash confirmation (required) and
 * may optionally paste the TrxID (helps the merchant find the transaction).
 * We go through the service-role — like every other `orders` write — so it
 * works for guest orders (user_id null, unreadable under RLS) and cannot touch
 * sensitive columns. The transition is only allowed from `en_attente_paiement`
 * (`.eq` guard) to prevent a double submit.
 *
 * The screenshot goes to a PRIVATE Supabase Storage bucket (it contains
 * personal data). Notifying the merchant is handled downstream by n8n WF1
 * (Supabase DB webhook on the transition to `paiement_a_verifier` → Telegram
 * sendPhoto of the screenshot + Confirm/Reject buttons → WF8 verdict).
 */

/** Detect a supported image type from its magic bytes (never trust client MIME). */
function detectImage(buf: Buffer): { ext: string; contentType: string } | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: 'jpg', contentType: 'image/jpeg' };
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return { ext: 'png', contentType: 'image/png' };
  }
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && // RIFF
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50 // WEBP
  ) {
    return { ext: 'webp', contentType: 'image/webp' };
  }
  return null;
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const orderId = params.id;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 });
  }

  // ── Screenshot (required) ──────────────────────────────────────────────
  const file = form.get('file');
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ error: 'A payment screenshot is required.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image is too large (max 5 MB).' }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const kind = detectImage(buffer);
  if (!kind) {
    return NextResponse.json(
      { error: 'Unsupported image. Please upload a JPG, PNG or WEBP.' },
      { status: 400 },
    );
  }

  // ── TrxID (optional) ───────────────────────────────────────────────────
  const trxidRaw = String(form.get('trxid') ?? '').trim();
  let trxid: string | null = null;
  if (trxidRaw) {
    trxid = normalizeTrxId(trxidRaw);
    if (!isPlausibleTrxId(trxid)) {
      return NextResponse.json(
        { error: 'Invalid TrxID. Check the code from bKash, or leave it empty.' },
        { status: 400 },
      );
    }
  }

  let supabase;
  try {
    supabase = createAdminSupabase();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Supabase init failed.' },
      { status: 500 },
    );
  }

  // ── Upload the screenshot to the PRIVATE bucket ────────────────────────
  const objectPath = `orders/${orderId}/${Date.now()}.${kind.ext}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, buffer, { contentType: kind.contentType, upsert: false });
  if (uploadError) {
    return NextResponse.json({ error: 'Could not store the screenshot. Please try again.' }, { status: 500 });
  }

  // ── Record the payment (guarded against double submit) ─────────────────
  const { data, error } = await supabase
    .from('orders')
    .update({
      ...(trxid ? { trxid } : {}),
      trxid_submitted_at: new Date().toISOString(),
      payment_proof_path: objectPath,
      payment_proof_uploaded_at: new Date().toISOString(),
      payment_status: 'paiement_a_verifier',
      bkash_receiver_number: BKASH_RECEIVER_NUMBER,
    })
    .eq('id', orderId)
    .eq('payment_status', 'en_attente_paiement') // prevents a double submit
    .select('id, order_number')
    .maybeSingle();

  if (error) {
    // 23505 = unique violation -> this TrxID was already used.
    await supabase.storage.from(BUCKET).remove([objectPath]).catch(() => {});
    if ((error as any).code === '23505') {
      return NextResponse.json(
        { error: 'This TrxID has already been used. Please check your code or contact us.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // No row updated: order not found OR already submitted/handled — clean up.
  if (!data) {
    await supabase.storage.from(BUCKET).remove([objectPath]).catch(() => {});
    return NextResponse.json(
      { error: 'Payment already submitted for this order, or order not found.' },
      { status: 409 },
    );
  }

  // The transition to `paiement_a_verifier` fires the Supabase DB webhook that
  // drives n8n WF1 (merchant Telegram notification with the screenshot + verdict
  // buttons) — no notification is sent from here.
  return NextResponse.json({ ok: true, order: { id: data.id, order_number: data.order_number } });
}
