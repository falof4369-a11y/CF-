import { getSetting, setSetting } from './db';
import { verifyAdminPinAPI, changeAdminPinAPI, setActiveAdminPin } from './api';

const PIN_SETTING_KEY = 'admin_pin_sha256';
const SESSION_STORAGE_KEY = 'cf_admin_session_auth';

// Standard SHA-256 hash function using Web Crypto API
async function sha256(str: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`cf_salt_2026_${str}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Ensure default PIN 2008 is hashed and initialized locally
export async function initAdminPin(): Promise<void> {
  const existingHash = await getSetting<string | null>(PIN_SETTING_KEY, null);
  if (!existingHash) {
    const defaultHash = await sha256('2008');
    await setSetting(PIN_SETTING_KEY, defaultHash);
  }
}

export async function verifyAdminPin(pin: string): Promise<boolean> {
  if (!pin || pin.length !== 4) return false;

  // Try server verification first
  const apiSuccess = await verifyAdminPinAPI(pin);
  if (apiSuccess) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, Date.now().toString());
    setActiveAdminPin(pin);
    return true;
  }

  // Fallback to local crypto check
  await initAdminPin();
  const inputHash = await sha256(pin);
  const storedHash = await getSetting<string>(PIN_SETTING_KEY, '');

  if (inputHash === storedHash || (!storedHash && pin === '2008')) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, Date.now().toString());
    setActiveAdminPin(pin);
    return true;
  }
  return false;
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const session = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!session) return false;
  const timestamp = parseInt(session, 10);
  const TWO_HOURS = 2 * 60 * 60 * 1000;
  if (Date.now() - timestamp > TWO_HOURS) {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return false;
  }
  return true;
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  sessionStorage.removeItem('cf_active_pin');
}

export async function changeAdminPin(
  currentPin: string,
  newPin: string
): Promise<{ success: boolean; error?: string }> {
  // Validate format
  if (!/^\d{4}$/.test(newPin)) {
    return { success: false, error: 'O novo código de acesso deve conter exatamente 4 dígitos numéricos (0-9).' };
  }

  if (newPin === currentPin) {
    return { success: false, error: 'O novo código deve ser diferente do código atual.' };
  }

  // Attempt server change
  const serverRes = await changeAdminPinAPI(currentPin, newPin);
  if (serverRes.success) {
    const newHash = await sha256(newPin);
    await setSetting(PIN_SETTING_KEY, newHash);
    sessionStorage.setItem(SESSION_STORAGE_KEY, Date.now().toString());
    setActiveAdminPin(newPin);
    return { success: true };
  }

  // Local check fallback
  const isCurrentValid = await verifyAdminPin(currentPin);
  if (!isCurrentValid) {
    return { success: false, error: 'O código atual de 4 dígitos está incorreto.' };
  }

  const newHash = await sha256(newPin);
  await setSetting(PIN_SETTING_KEY, newHash);
  sessionStorage.setItem(SESSION_STORAGE_KEY, Date.now().toString());
  setActiveAdminPin(newPin);

  return { success: true };
}
