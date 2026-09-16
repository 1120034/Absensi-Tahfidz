import React, { useState } from 'react';
import { GoogleSyncConfig, Santri, SetoranRecord } from '../types';
import {
  requestGoogleAccessToken,
  fetchGoogleUserProfile,
  createTahfidzSpreadsheet,
  populateSpreadsheetData
} from '../services/googleWorkspace';
import { saveGoogleSync } from '../services/storage';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  FolderSync,
  LogIn,
  Layers,
  Database
} from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncConfig: GoogleSyncConfig;
  setSyncConfig: React.Dispatch<React.SetStateAction<GoogleSyncConfig>>;
  santriList: Santri[];
  setoranList: SetoranRecord[];
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  syncConfig,
  setSyncConfig,
  santriList,
  setoranList,
}) => {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnectGoogle = async () => {
    setLoading(true);
    setStatusMsg('Membuka jendela otorisasi Google...');
    setErrorMsg(null);

    try {
      const token = await requestGoogleAccessToken();
      setStatusMsg('Mengambil data profil Google...');
      const profile = await fetchGoogleUserProfile(token);

      const newConfig: GoogleSyncConfig = {
        ...syncConfig,
        isConnected: true,
        accessToken: token,
        userEmail: profile.email,
        error: null,
      };

      setSyncConfig(newConfig);
      saveGoogleSync(newConfig);
      setStatusMsg(`Berhasil terhubung dengan ${profile.email}!`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal menghubungkan akun Google.');
      setStatusMsg(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToSheets = async () => {
    setLoading(true);
    setStatusMsg('Menyiapkan data hafalan santri ke Google Sheets...');
    setErrorMsg(null);

    try {
      let token = syncConfig.accessToken;
      if (!token) {
        token = await requestGoogleAccessToken();
      }

      let spreadsheetId = syncConfig.spreadsheetId;
      let spreadsheetUrl = syncConfig.spreadsheetUrl;

      if (!spreadsheetId) {
        setStatusMsg('Membuat file spreadsheet baru di Google Drive Anda...');
        const created = await createTahfidzSpreadsheet(token, santriList, setoranList);
        spreadsheetId = created.spreadsheetId;
        spreadsheetUrl = created.spreadsheetUrl;
      } else {
        setStatusMsg('Menyinkronkan data terbaru ke Google Sheets...');
        await populateSpreadsheetData(token, spreadsheetId, santriList, setoranList);
      }

      const updatedConfig: GoogleSyncConfig = {
        ...syncConfig,
        isConnected: true,
        accessToken: token,
        spreadsheetId,
        spreadsheetUrl,
        lastSyncedAt: new Date().toLocaleString('id-ID'),
        isSyncing: false,
        error: null,
      };

      setSyncConfig(updatedConfig);
      saveGoogleSync(updatedConfig);
      setStatusMsg('Alhamdulillah, sinkronisasi ke Google Sheets berhasil tuntas!');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kendala saat sinkronisasi Google Sheets.');
      setStatusMsg(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-emerald-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-700/50">
              <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">Integrasi Google Sheets & Drive</h2>
              <p className="text-xs text-emerald-200">
                Pencadangan dan pelaporan rekapitulasi hafalan santri
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status Koneksi
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {syncConfig.isConnected ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-800">
                        Terhubung ({syncConfig.userEmail || 'Google Account'})
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                      <span className="text-sm font-medium text-slate-600">
                        Belum Terhubung
                      </span>
                    </>
                  )}
                </div>
              </div>

              {!syncConfig.isConnected ? (
                <button
                  type="button"
                  onClick={handleConnectGoogle}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Hubungkan Google
                </button>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  Aktif
                </span>
              )}
            </div>

            {syncConfig.lastSyncedAt && (
              <p className="text-xs text-slate-500 mt-2.5 pt-2 border-t border-slate-200">
                Terakhir disinkronkan: <strong>{syncConfig.lastSyncedAt}</strong>
              </p>
            )}
          </div>

          {/* Sync Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-950">
              <span className="text-xs font-medium text-emerald-700 block">Total Data Santri</span>
              <span className="text-xl font-bold">{santriList.length} Santri</span>
            </div>
            <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-teal-950">
              <span className="text-xs font-medium text-teal-700 block">Total Log Setoran</span>
              <span className="text-xl font-bold">{setoranList.length} Catatan</span>
            </div>
          </div>

          {/* Messages */}
          {statusMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{statusMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Active Spreadsheet Link if exists */}
          {syncConfig.spreadsheetUrl && (
            <div className="p-4 rounded-xl bg-slate-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Google Spreadsheet Aktif</span>
                </div>
                <a
                  href={syncConfig.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                >
                  Buka Spreadsheet
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                ID: {syncConfig.spreadsheetId}
              </p>
            </div>
          )}

          {/* Sync Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleSyncToSheets}
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading
                ? 'Sedang Menyinkronkan...'
                : syncConfig.spreadsheetId
                ? 'Sinkronkan Data Sekarang ke Google Sheets'
                : 'Buat Spreadsheet Tahfidz di Google Drive'}
            </button>

            <p className="text-[11px] text-center text-slate-400">
              Data sheet memuat tab <strong>Log Setoran Real-Time</strong> dan tab <strong>Data Santri</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
