import React from 'react';
import { AuthSession, GoogleSyncConfig } from '../types';
import {
  BookOpenCheck,
  FileSpreadsheet,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Plus,
  LogOut,
  User
} from 'lucide-react';

interface NavbarProps {
  session: AuthSession;
  onLogout: () => void;
  syncConfig: GoogleSyncConfig;
  onOpenGoogleSync: () => void;
  onOpenNewSetoran: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  onLogout,
  syncConfig,
  onOpenGoogleSync,
  onOpenNewSetoran,
}) => {
  const role = session.role;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3 sm:gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-800/20 shrink-0">
              <BookOpenCheck className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Jurnal Tahfidz Santri
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Real-time
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                Manajemen Hafalan & Transparansi Perkembangan Santri
              </p>
            </div>
          </div>

          {/* Right Action Tools & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Google Sheets Sync Button - Only visible in Admin Portal */}
            {role === 'admin' && (
              <button
                onClick={onOpenGoogleSync}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  syncConfig.isConnected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                title={syncConfig.isConnected ? `Sheets Terhubung (${syncConfig.userEmail})` : 'Hubungkan Google Sheets'}
              >
                <FileSpreadsheet className={`w-3.5 h-3.5 ${syncConfig.isConnected ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span className="hidden lg:inline">
                  {syncConfig.isConnected ? 'Sheets Sync' : 'Google Sheets'}
                </span>
                {syncConfig.isConnected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                )}
              </button>
            )}

            {/* Setoran Baru (For Ustadz & Admin) */}
            {(role === 'ustadz' || role === 'admin') && (
              <button
                onClick={onOpenNewSetoran}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {role === 'ustadz' ? 'Scan QR Setoran' : 'Setoran Baru'}
                </span>
              </button>
            )}

            {/* User Session Info & Role Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                  {session.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate max-w-[170px]">
                  {session.detail}
                </div>
              </div>

              {/* Role Badge */}
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shrink-0 ${
                  role === 'admin'
                    ? 'bg-slate-900 text-white'
                    : role === 'ustadz'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    : 'bg-teal-100 text-teal-900 border border-teal-200'
                }`}
              >
                {role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                {role === 'ustadz' && <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />}
                {role === 'wali' && <HeartHandshake className="w-3.5 h-3.5 text-teal-700" />}
                <span className="capitalize">
                  {role === 'admin' ? 'Admin' : role === 'ustadz' ? 'Ustadz' : 'Wali Santri'}
                </span>
              </span>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="Keluar / Kembali ke Halaman Login"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
