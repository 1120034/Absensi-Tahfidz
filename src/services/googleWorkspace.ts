import { GoogleSyncConfig, Santri, SetoranRecord } from '../types';

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
            error_callback?: (err: unknown) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

export const OAUTH_CLIENT_ID = "947598295160-l5nkgvittqflaa8e159lp3ldd5kj1ma4.apps.googleusercontent.com";
export const OAUTH_SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file";

export async function requestGoogleAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error("Google Identity Services library belum termuat. Pastikan koneksi internet stabil."));
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: OAUTH_CLIENT_ID,
        scope: OAUTH_SCOPES,
        callback: (tokenResponse) => {
          if (tokenResponse.error) {
            reject(new Error(tokenResponse.error));
            return;
          }
          if (tokenResponse.access_token) {
            resolve(tokenResponse.access_token);
          } else {
            reject(new Error("Gagal mendapatkan Access Token dari Google."));
          }
        },
        error_callback: (err) => {
          reject(err);
        }
      });

      client.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      reject(err);
    }
  });
}

// Fetch user profile from Google using access token
export async function fetchGoogleUserProfile(accessToken: string): Promise<{ email: string; name?: string }> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    if (!res.ok) throw new Error("Gagal mengambil profil akun Google");
    return await res.json();
  } catch {
    return { email: 'Google User' };
  }
}

// Create a new spreadsheet in Google Drive
export async function createTahfidzSpreadsheet(
  accessToken: string,
  santriList: Santri[],
  setoranList: SetoranRecord[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const title = `Jurnal Tahfidz Santri - Rekap Real-Time (${new Date().toLocaleDateString('id-ID')})`;

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: title
      },
      sheets: [
        {
          properties: {
            title: 'Log Setoran Real-Time',
            gridProperties: { frozenRowCount: 1 }
          }
        },
        {
          properties: {
            title: 'Data Santri',
            gridProperties: { frozenRowCount: 1 }
          }
        }
      ]
    })
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gagal membuat spreadsheet Google Sheets (${createRes.status})`);
  }

  const result = await createRes.json();
  const spreadsheetId = result.spreadsheetId;
  const spreadsheetUrl = result.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write content to both sheets
  await populateSpreadsheetData(accessToken, spreadsheetId, santriList, setoranList);

  return { spreadsheetId, spreadsheetUrl };
}

// Populate or sync data into existing spreadsheet
export async function populateSpreadsheetData(
  accessToken: string,
  spreadsheetId: string,
  santriList: Santri[],
  setoranList: SetoranRecord[]
): Promise<void> {
  // 1. Prepare Data for 'Log Setoran Real-Time'
  const setoranHeaders = [
    'ID Setoran',
    'Tanggal',
    'Jam',
    'Nama Santri',
    'Tipe Setoran',
    'Surat',
    'Ayat',
    'Juz',
    'Predikat',
    'Makhraj (1-5)',
    'Tajwid (1-5)',
    'Kelancaran (1-5)',
    'Ustadz Pembimbing',
    'Catatan / Evaluasi',
    'Verifikasi Wali',
    'Tanggapan Wali Santri'
  ];

  const setoranRows = setoranList.map(item => [
    item.id,
    item.date,
    item.time,
    item.santriName,
    item.type.toUpperCase(),
    item.surahName,
    `${item.ayahStart} - ${item.ayahEnd}`,
    item.juz,
    item.grade.toUpperCase().replace('_', ' '),
    item.makhrajScore,
    item.tajwidScore,
    item.kelancaranScore,
    item.ustadzName,
    item.notes || '-',
    item.verifiedByGuardian ? 'Sudah Diverifikasi' : 'Belum',
    item.guardianComment || '-'
  ]);

  const setoranValues = [setoranHeaders, ...setoranRows];

  // 2. Prepare Data for 'Data Santri'
  const santriHeaders = [
    'ID Santri',
    'NIS',
    'Nama Lengkap',
    'Jenis Kelamin',
    'Halaqah',
    'Target Hafalan (Juz)',
    'Juz Mutqin',
    'Hafalan Terakhir',
    'Ustadz Pengampu',
    'Wali Santri',
    'No. WhatsApp Wali',
    'Tanggal Bergabung'
  ];

  const santriRows = santriList.map(s => [
    s.id,
    s.nis,
    s.name,
    s.gender === 'L' ? 'Ikhwan' : 'Akhwat',
    s.halaqah,
    `${s.targetJuz} Juz`,
    `${s.totalMutqinJuz} Juz`,
    `${s.currentSurah} : ${s.currentAyah}`,
    s.ustadzName,
    s.guardianName,
    s.guardianPhone,
    s.joinedDate
  ]);

  const santriValues = [santriHeaders, ...santriRows];

  // Batch update values
  const batchRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: "'Log Setoran Real-Time'!A1:P" + (setoranValues.length + 10),
            values: setoranValues
          },
          {
            range: "'Data Santri'!A1:L" + (santriValues.length + 10),
            values: santriValues
          }
        ]
      })
    }
  );

  if (!batchRes.ok) {
    const err = await batchRes.json().catch(() => ({}));
    throw new Error(err.error?.message || "Gagal memperbarui data di Google Sheets.");
  }
}
