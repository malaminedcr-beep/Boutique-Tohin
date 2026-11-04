/**
 * Règle de mot de passe côté app. DOIT rester alignée avec les réglages
 * Supabase Auth (Authentication → Providers → Email → Minimum password length
 * + Password Requirements). La validation serveur reste Supabase ; ceci donne
 * un retour immédiat et cohérent à l'utilisateur. Compense l'absence de
 * "leaked password protection" (feature plan Pro).
 */
export const PASSWORD_MIN_LENGTH = 10;

export const PASSWORD_HINT =
  'Min. 10 characters, with an uppercase letter, a lowercase letter and a number.';

/** Retourne un message d'erreur si le mot de passe ne respecte pas la règle, sinon null. */
export function validatePassword(pw: string): string | null {
  if (pw.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (!/[a-z]/.test(pw)) return 'Password must include a lowercase letter.';
  if (!/[A-Z]/.test(pw)) return 'Password must include an uppercase letter.';
  if (!/[0-9]/.test(pw)) return 'Password must include a number.';
  return null;
}
