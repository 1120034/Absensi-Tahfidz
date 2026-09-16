import React, { useState } from 'react';
import { Santri, SetoranRecord, GoogleSyncConfig, AuthSession } from './types';
import {
  getStoredSantri,
  saveSantriList,
  getStoredSetoran,
  saveSetoranList,
  getStoredGoogleSync,
  saveGoogleSync,
  getStoredAuthSession,
  saveAuthSession,
} from './services/storage';
import { populateSpreadsheetData } from './services/googleWorkspace';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { UstadzDashboard } from './components/UstadzDashboard';
import { WaliSantriPortal } from './components/WaliSantriPortal';
import { AdminPortal } from './components/AdminPortal';
import { InputSetoranModal } from './components/InputSetoranModal';
import { AddSantriModal } from './components/AddSantriModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { RaporModal } from './components/RaporModal';
import { QRScannerModal } from './components/QRScannerModal';
import { SantriQRCardModal } from './components/SantriQRCardModal';
import { BookOpen } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredAuthSession());
  const [santriList, setSantriList] = useState<Santri[]>(() => getStoredSantri());
  const [setoranList, setSetoranList] = useState<SetoranRecord[]>(() => getStoredSetoran());
  const [syncConfig, setSyncConfig] = useState<GoogleSyncConfig>(() => getStoredGoogleSync());

  // Modal states
  const [isSetoranModalOpen, setIsSetoranModalOpen] = useState(false);
  const [setoranSantriId, setSetoranSantriId] = useState<string | undefined>(undefined);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isQRVerified, setIsQRVerified] = useState(false);
  const [isQRCardOpen, setIsQRCardOpen] = useState(false);
  const [qrCardSantri, setQrCardSantri] = useState<Santri | null>(null);

  const [isAddSantriOpen, setIsAddSantriOpen] = useState(false);
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);

  const [isGoogleSyncOpen, setIsGoogleSyncOpen] = useState(false);

  const [isRaporOpen, setIsRaporOpen] = useState(false);
  const [raporSantri, setRaporSantri] = useState<Santri | null>(null);

  const handleLoginSuccess = (newSession: AuthSession) => {
    setSession(newSession);
    saveAuthSession(newSession);
  };

  const handleLogout = () => {
    setSession(null);
    saveAuthSession(null);
  };

  // Open Setoran Journal Flow: Automatically prompt QR Scan for Ustadz
  const handleOpenNewSetoran = (santriId?: string) => {
    setSetoranSantriId(santriId);
    if (session?.role === 'ustadz') {
      setIsQRVerified(false);
      setIsQRScannerOpen(true);
    } else {
      setIsQRVerified(false);
      setIsSetoranModalOpen(true);
    }
  };

  // When santri QR is successfully scanned
  const handleSantriScanned = (santri: Santri) => {
    setSetoranSantriId(santri.id);
    setIsQRVerified(true);
    setIsQRScannerOpen(false);
    setIsSetoranModalOpen(true);
  };

  // Manual fallback if QR cannot be scanned
  const handleSkipScanToManual = () => {
    setIsQRVerified(false);
    setIsQRScannerOpen(false);
    setIsSetoranModalOpen(true);
  };

  // Background Google Sheets auto-sync helper
  const triggerAutoGoogleSync = (updatedSantriList: Santri[], updatedSetoranList: SetoranRecord[]) => {
    if (syncConfig.isConnected && syncConfig.accessToken && syncConfig.spreadsheetId) {
      populateSpreadsheetData(syncConfig.accessToken, syncConfig.spreadsheetId, updatedSantriList, updatedSetoranList)
        .then(() => {
          const updated = {
            ...syncConfig,
            lastSyncedAt: new Date().toLocaleString('id-ID'),
          };
          setSyncConfig(updated);
          saveGoogleSync(updated);
        })
        .catch((err) => console.warn('Background sync notice:', err));
    }
  };

  // Handle saving new setoran record
  const handleSaveSetoran = (newRecord: SetoranRecord, updatedSantri?: Santri) => {
    const nextSetoran = [newRecord, ...setoranList];
    setSetoranList(nextSetoran);
    saveSetoranList(nextSetoran);

    let nextSantri = santriList;
    if (updatedSantri) {
      nextSantri = santriList.map((s) => (s.id === updatedSantri.id ? updatedSantri : s));
      setSantriList(nextSantri);
      saveSantriList(nextSantri);
    }

    triggerAutoGoogleSync(nextSantri, nextSetoran);
  };

  // Handle saving a santri (add or edit)
  const handleSaveSantri = (santri: Santri) => {
    const exists = santriList.some((s) => s.id === santri.id);
    let nextList: Santri[];
    if (exists) {
      nextList = santriList.map((s) => (s.id === santri.id ? santri : s));
    } else {
      nextList = [santri, ...santriList];
    }

    setSantriList(nextList);
    saveSantriList(nextList);
    triggerAutoGoogleSync(nextList, setoranList);
  };

  // Handle deleting a santri
  const handleDeleteSantri = (santriId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data santri ini?')) {
      const nextSantri = santriList.filter((s) => s.id !== santriId);
      const nextSetoran = setoranList.filter((s) => s.santriId !== santriId);
      setSantriList(nextSantri);
      saveSantriList(nextSantri);
      setSetoranList(nextSetoran);
      saveSetoranList(nextSetoran);
      triggerAutoGoogleSync(nextSantri, nextSetoran);
    }
  };

  // Handle parent verification and comment
  const handleVerifySetoran = (recordId: string, comment: string) => {
    const nextSetoran = setoranList.map((rec) => {
      if (rec.id === recordId) {
        return {
          ...rec,
          verifiedByGuardian: true,
          guardianComment: comment,
          guardianCommentDate: new Date().toISOString(),
        };
      }
      return rec;
    });

    setSetoranList(nextSetoran);
    saveSetoranList(nextSetoran);
    triggerAutoGoogleSync(santriList, nextSetoran);
  };

  // If NOT logged in, show the Login Page directly!
  if (!session) {
    return (
      <LoginPage
        santriList={santriList}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Navbar */}
      <Navbar
        session={session}
        onLogout={handleLogout}
        syncConfig={syncConfig}
        onOpenGoogleSync={() => setIsGoogleSyncOpen(true)}
        onOpenNewSetoran={() => handleOpenNewSetoran()}
      />

      {/* Main Content Based on Role */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {session.role === 'admin' && (
          <AdminPortal
            santriList={santriList}
            setoranList={setoranList}
            syncConfig={syncConfig}
            onOpenGoogleSync={() => setIsGoogleSyncOpen(true)}
            onOpenAddSantri={(santri) => {
              setEditingSantri(santri || null);
              setIsAddSantriOpen(true);
            }}
            onOpenSetoranModal={(santriId) => handleOpenNewSetoran(santriId)}
            onOpenRapor={(santri) => {
              setRaporSantri(santri);
              setIsRaporOpen(true);
            }}
            onOpenQRCard={(santri) => {
              setQrCardSantri(santri);
              setIsQRCardOpen(true);
            }}
            onDeleteSantri={handleDeleteSantri}
          />
        )}

        {session.role === 'ustadz' && (
          <UstadzDashboard
            santriList={santriList}
            setoranList={setoranList}
            syncConfig={syncConfig}
            onOpenSetoranModal={(santriId) => handleOpenNewSetoran(santriId)}
            onOpenAddSantri={(santri) => {
              setEditingSantri(santri || null);
              setIsAddSantriOpen(true);
            }}
            onOpenGoogleSync={() => setIsGoogleSyncOpen(true)}
            onOpenRapor={(santri) => {
              setRaporSantri(santri);
              setIsRaporOpen(true);
            }}
            onOpenQRCard={(santri) => {
              setQrCardSantri(santri);
              setIsQRCardOpen(true);
            }}
          />
        )}

        {session.role === 'wali' && (
          <WaliSantriPortal
            santriList={santriList}
            setoranList={setoranList}
            initialSantriId={session.santriId}
            onOpenRapor={(santri) => {
              setRaporSantri(santri);
              setIsRaporOpen(true);
            }}
            onVerifySetoran={handleVerifySetoran}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-slate-700">Jurnal Tahfidz Santri</span>
            <span>— Terpadu dengan Google Drive & Sheets</span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[11px] text-slate-400">
              Membina generasi Qur'ani yang berakhlak mulia dan mutqin 30 Juz
            </p>
            <button
              onClick={handleLogout}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
            >
              Ganti Peran / Keluar
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* 1. QR Code Scanner for Santri (Automatic on setoran creation) */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        santriList={santriList}
        onSantriSelected={handleSantriScanned}
        onSkipToManual={handleSkipScanToManual}
      />

      {/* 2. Official Santri QR Identity Card (View & Print) */}
      <SantriQRCardModal
        isOpen={isQRCardOpen}
        onClose={() => setIsQRCardOpen(false)}
        santri={qrCardSantri}
      />

      {/* 3. Journal Input Setoran Modal */}
      <InputSetoranModal
        isOpen={isSetoranModalOpen}
        onClose={() => setIsSetoranModalOpen(false)}
        santriList={santriList}
        initialSantriId={setoranSantriId}
        isQRVerified={isQRVerified}
        onReScanQR={() => {
          setIsSetoranModalOpen(false);
          setIsQRScannerOpen(true);
        }}
        onSave={handleSaveSetoran}
      />

      <AddSantriModal
        isOpen={isAddSantriOpen}
        onClose={() => setIsAddSantriOpen(false)}
        onSave={handleSaveSantri}
        existingSantri={editingSantri}
      />

      <GoogleSheetsModal
        isOpen={isGoogleSyncOpen}
        onClose={() => setIsGoogleSyncOpen(false)}
        syncConfig={syncConfig}
        setSyncConfig={setSyncConfig}
        santriList={santriList}
        setoranList={setoranList}
      />

      <RaporModal
        isOpen={isRaporOpen}
        onClose={() => setIsRaporOpen(false)}
        santri={raporSantri}
        setoranList={setoranList}
      />
    </div>
  );
}
