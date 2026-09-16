import { Santri, SetoranRecord, GoogleSyncConfig, SetoranType, AuthSession, UstadzAccount } from '../types';
import { INITIAL_SANTRI, INITIAL_SETORAN, INITIAL_USTADZ, DEFAULT_ADMIN } from '../data/initialData';

const STORAGE_KEYS = {
  SANTRI: 'tahfidz_santri_v1',
  SETORAN: 'tahfidz_setoran_v1',
  GOOGLE_SYNC: 'tahfidz_google_sync_v1',
  AUTH_SESSION: 'tahfidz_auth_session_v1',
  USTADZ: 'tahfidz_ustadz_v1',
  ADMIN_CREDENTIALS: 'tahfidz_admin_creds_v1',
  USTADZ_REMEMBER: 'tahfidz_ustadz_remember_v1',
};

export function getStoredSantri(): Santri[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SANTRI);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SANTRI, JSON.stringify(INITIAL_SANTRI));
      return INITIAL_SANTRI;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SANTRI;
  }
}

export function saveSantriList(list: Santri[]): void {
  localStorage.setItem(STORAGE_KEYS.SANTRI, JSON.stringify(list));
  window.dispatchEvent(new Event('tahfidz_data_updated'));
}

export function getStoredSetoran(): SetoranRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETORAN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETORAN, JSON.stringify(INITIAL_SETORAN));
      return INITIAL_SETORAN;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SETORAN;
  }
}

export function saveSetoranList(list: SetoranRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.SETORAN, JSON.stringify(list));
  window.dispatchEvent(new Event('tahfidz_data_updated'));
}

export function getStoredGoogleSync(): GoogleSyncConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOOGLE_SYNC);
    if (!raw) {
      return {
        isConnected: false,
        userEmail: null,
        accessToken: null,
        spreadsheetId: null,
        spreadsheetUrl: null,
        lastSyncedAt: null,
        isSyncing: false,
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      isConnected: false,
      userEmail: null,
      accessToken: null,
      spreadsheetId: null,
      spreadsheetUrl: null,
      lastSyncedAt: null,
      isSyncing: false,
    };
  }
}

export function saveGoogleSync(config: GoogleSyncConfig): void {
  localStorage.setItem(STORAGE_KEYS.GOOGLE_SYNC, JSON.stringify(config));
  window.dispatchEvent(new Event('tahfidz_sync_updated'));
}

export function formatWhatsAppMessage(record: SetoranRecord, santri: Santri): string {
  const typeText =
    record.type === 'ziyadah'
      ? 'Setoran Hafalan Baru (Ziyadah)'
      : record.type === 'murajaah'
      ? "Pengulangan Hafalan (Muraja'ah)"
      : "Ujian Hafalan (Tasmi')";

  const gradeNames: Record<string, string> = {
    mumtaz: 'Mumtaz (Sangat Lancar / A)',
    jayyid_jiddan: 'Jayyid Jiddan (Lancar / B+)',
    jayyid: 'Jayyid (Cukup / B)',
    maqbul: 'Maqbul (Perlu Latihan / C)',
    rasib: 'Rasib (Harus Diulang / D)',
  };

  const text = `*LAPORAN PERKEMBANGAN TAHFIDZ AL-QUR'AN*
━━━━━━━━━━━━━━━━━━━━
_Bismillahirrohmanirrohim_

Yth. *${santri.guardianName}*
(Wali Santri dari *${santri.name}* - NIS: ${santri.nis})

Berikut adalah catatan setoran hafalan ananda hari ini:

📅 *Waktu:* ${record.date} (${record.time} WIB)
🏷️ *Jenis Setoran:* ${typeText}
📖 *Surat:* QS. ${record.surahName} (${record.ayahStart} - ${record.ayahEnd})
⭐ *Juz:* ${record.juz}
🏆 *Predikat:* ${gradeNames[record.grade] || record.grade}
📊 *Rincian Nilai:*
  • Makhraj: ${record.makhrajScore}/5 ⭐
  • Tajwid: ${record.tajwidScore}/5 ⭐
  • Kelancaran: ${record.kelancaranScore}/5 ⭐

📝 *Catatan Ustadz/Musyrif:*
"${record.notes || 'Alhamdulillah bacaan dan setoran berjalan lancar.'}"

👳‍♂️ *Pengampu:* ${record.ustadzName}
📌 *Total Capaian:* ${santri.totalMutqinJuz} dari ${santri.targetJuz} Juz Mutqin

Mohon doa dan dukungan Bapak/Ibu untuk terus menyimak dan memotivasi ananda di rumah.

_Jazaakumullahu Khairan Katsiran_
_Wassalamu'alaikum Warahmatullahi Wabarakatuh_`;

  return encodeURIComponent(text);
}

export function getStoredAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAuthSession(session: AuthSession | null): void {
  if (!session) {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  } else {
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
  }
}

export function getStoredUstadz(): UstadzAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USTADZ);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USTADZ, JSON.stringify(INITIAL_USTADZ));
      return INITIAL_USTADZ;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USTADZ;
  }
}

export function saveUstadzList(list: UstadzAccount[]): void {
  localStorage.setItem(STORAGE_KEYS.USTADZ, JSON.stringify(list));
}

export function getStoredAdminCredentials(): { username: string; password: string; name: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_CREDENTIALS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_CREDENTIALS, JSON.stringify(DEFAULT_ADMIN));
      return DEFAULT_ADMIN;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ADMIN;
  }
}

export function saveAdminCredentials(creds: { username: string; password: string; name: string }): void {
  localStorage.setItem(STORAGE_KEYS.ADMIN_CREDENTIALS, JSON.stringify(creds));
}

export interface UstadzRememberData {
  remembered: boolean;
  ustadzId?: string;
  password?: string;
}

export function getStoredUstadzRemember(): UstadzRememberData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USTADZ_REMEMBER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredUstadzRemember(data: UstadzRememberData | null): void {
  if (!data || !data.remembered) {
    localStorage.removeItem(STORAGE_KEYS.USTADZ_REMEMBER);
  } else {
    localStorage.setItem(STORAGE_KEYS.USTADZ_REMEMBER, JSON.stringify(data));
  }
}

