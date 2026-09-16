import QRCode from 'qrcode';
import { Santri } from '../types';

/**
 * Generate standard QR payload for a Santri
 */
export function getSantriQRPayload(santri: Santri): string {
  return JSON.stringify({
    app: 'TAHFIDZ_APP',
    id: santri.id,
    nis: santri.nis,
    name: santri.name,
    halaqah: santri.halaqah,
  });
}

/**
 * Generate high quality QR code data URL image
 */
export async function generateQRCodeDataURL(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#064e3b', // deep emerald
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}

/**
 * Robustly matches scanned string to a Santri in santriList
 */
export function matchSantriFromQR(code: string, santriList: Santri[]): Santri | null {
  const trimmed = code.trim();
  if (!trimmed) return null;

  // 1. Try parsing JSON payload
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed.id) {
      const match = santriList.find((s) => s.id === parsed.id);
      if (match) return match;
    }
    if (parsed.nis) {
      const match = santriList.find((s) => s.nis === String(parsed.nis));
      if (match) return match;
    }
  } catch {
    // Not valid JSON, continue with string patterns
  }

  // 2. Direct ID or NIS exact match
  const directMatch = santriList.find(
    (s) => s.id.toLowerCase() === trimmed.toLowerCase() || s.nis.toLowerCase() === trimmed.toLowerCase()
  );
  if (directMatch) return directMatch;

  // 3. Match prefixed SANTRI:id or NIS:nis
  const santriPrefix = trimmed.match(/^SANTRI[:\-_](.+)$/i);
  if (santriPrefix) {
    const target = santriPrefix[1].trim();
    const found = santriList.find((s) => s.id.toLowerCase() === target.toLowerCase() || s.nis === target);
    if (found) return found;
  }

  const nisPrefix = trimmed.match(/^NIS[:\-_](.+)$/i);
  if (nisPrefix) {
    const target = nisPrefix[1].trim();
    const found = santriList.find((s) => s.nis === target || s.id.toLowerCase() === target.toLowerCase());
    if (found) return found;
  }

  // 4. Fallback search if NIS or ID is inside the string
  const substringMatch = santriList.find(
    (s) => (s.nis && trimmed.includes(s.nis)) || (s.id && trimmed.includes(s.id))
  );
  if (substringMatch) return substringMatch;

  return null;
}

/**
 * Pleasant sound feedback upon successful QR scan using Web Audio API
 */
export function playScanBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12); // High chirp
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // AudioContext may be restricted by browser policy before user interaction
  }
}
