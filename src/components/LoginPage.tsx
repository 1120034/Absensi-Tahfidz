import React, { useState } from 'react';
import { AuthSession, Santri, UstadzAccount } from '../types';
import {
  getStoredAdminCredentials,
  getStoredUstadz,
  getStoredUstadzRemember,
  saveStoredUstadzRemember,
} from '../services/storage';
import {
  BookOpenCheck,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Search,
  CheckCircle2,
  BookOpen,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';

interface LoginPageProps {
  santriList: Santri[];
  onLoginSuccess: (session: AuthSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ santriList, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<'ustadz' | 'wali' | 'admin'>('ustadz');

  // Admin form state
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Ustadz form state
  const ustadzList = getStoredUstadz();
  const [selectedUstadzId, setSelectedUstadzId] = useState<string>(() => {
    const saved = getStoredUstadzRemember();
    if (saved?.remembered && saved.ustadzId && ustadzList.some((u) => u.id === saved.ustadzId)) {
      return saved.ustadzId;
    }
    return ustadzList[0]?.id || '';
  });
  const [ustadzPass, setUstadzPass] = useState<string>(() => {
    const saved = getStoredUstadzRemember();
    if (saved?.remembered && saved.password !== undefined) {
      return saved.password;
    }
    return 'ustadz123';
  });
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    const saved = getStoredUstadzRemember();
    return saved ? saved.remembered : true;
  });
  const [showUstadzPass, setShowUstadzPass] = useState(false);
  const [ustadzError, setUstadzError] = useState<string | null>(null);

  const handleSelectUstadz = (newId: string) => {
    setSelectedUstadzId(newId);
    setUstadzError(null);
    const saved = getStoredUstadzRemember();
    if (saved?.remembered && saved.ustadzId === newId && saved.password !== undefined) {
      setUstadzPass(saved.password);
    } else {
      const target = ustadzList.find((u) => u.id === newId);
      setUstadzPass(target?.password || 'ustadz123');
    }
  };

  // Wali Santri form state
  const [selectedSantriId, setSelectedSantriId] = useState<string>('');
  const [searchSantri, setSearchSantri] = useState('');
  const [waliError, setWaliError] = useState<string | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    const creds = getStoredAdminCredentials();

    if (adminUser.trim() === creds.username && adminPass === creds.password) {
      onLoginSuccess({
        role: 'admin',
        name: creds.name,
        detail: 'Pengelola Pusat Jurnal Tahfidz',
      });
    } else {
      setAdminError('Username atau password admin tidak valid.');
    }
  };

  const handleUstadzLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setUstadzError(null);
    const target = ustadzList.find((u) => u.id === selectedUstadzId);
    if (!target) {
      setUstadzError('Silakan pilih akun ustadz.');
      return;
    }

    if (!ustadzPass) {
      setUstadzError('Silakan masukkan password ustadz.');
      return;
    }

    if (target.password && ustadzPass !== target.password) {
      setUstadzError('Password ustadz salah.');
      return;
    }

    if (rememberMe) {
      saveStoredUstadzRemember({
        remembered: true,
        ustadzId: target.id,
        password: ustadzPass,
      });
    } else {
      saveStoredUstadzRemember(null);
    }

    onLoginSuccess({
      role: 'ustadz',
      userId: target.id,
      name: target.name,
      detail: target.halaqah,
    });
  };

  const handleSearchSantriChange = (query: string) => {
    setSearchSantri(query);
    setWaliError(null);
    setSelectedSantriId('');
  };

  const handleSelectSantri = (id: string) => {
    setSelectedSantriId(id);
    setWaliError(null);
    const target = santriList.find((s) => s.id === id);
    if (target) {
      setSearchSantri(target.name);
    }
  };

  const handleClearSearchSantri = () => {
    setSearchSantri('');
    setSelectedSantriId('');
    setWaliError(null);
  };

  const filteredSantri = santriList.filter((s) => {
    const q = searchSantri.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.nis.toLowerCase().includes(q) ||
      s.guardianName.toLowerCase().includes(q) ||
      s.halaqah.toLowerCase().includes(q)
    );
  });

  const selectedSantri = santriList.find((s) => s.id === selectedSantriId);

  const handleWaliLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setWaliError(null);
    const target = santriList.find((s) => s.id === selectedSantriId);

    if (!target) {
      setWaliError('Silakan pilih nama santri ananda dari hasil pencarian.');
      return;
    }

    onLoginSuccess({
      role: 'wali',
      name: target.guardianName,
      detail: `Wali dari ${target.name} (${target.nis})`,
      santriId: target.id,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-700 text-white shadow-lg shadow-emerald-900/20 mb-3">
            <BookOpenCheck className="w-8 h-8 text-emerald-200" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Jurnal Tahfidz Santri
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Sistem Mutaba'ah Hafalan Al-Qur'an Terpadu, Real-Time & Transparan
          </p>
        </div>

        {/* 3 Role Selection Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
          {/* Option 1: Ustadz */}
          <button
            type="button"
            onClick={() => setSelectedRole('ustadz')}
            className={`p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col items-center sm:items-start ${
              selectedRole === 'ustadz'
                ? 'bg-emerald-800 text-white border-emerald-700 shadow-md ring-2 ring-emerald-600/30'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
            }`}
          >
            <div
              className={`p-2 rounded-xl mb-2 ${
                selectedRole === 'ustadz'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs sm:text-sm block">Ustadz</span>
            <span
              className={`text-[11px] hidden sm:block mt-0.5 ${
                selectedRole === 'ustadz' ? 'text-emerald-100' : 'text-slate-500'
              }`}
            >
              Musyrif Halaqah
            </span>
          </button>

          {/* Option 2: Wali Santri */}
          <button
            type="button"
            onClick={() => setSelectedRole('wali')}
            className={`p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col items-center sm:items-start ${
              selectedRole === 'wali'
                ? 'bg-teal-800 text-white border-teal-700 shadow-md ring-2 ring-teal-600/30'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
            }`}
          >
            <div
              className={`p-2 rounded-xl mb-2 ${
                selectedRole === 'wali'
                  ? 'bg-white/20 text-white'
                  : 'bg-teal-50 text-teal-700'
              }`}
            >
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs sm:text-sm block">Wali Santri</span>
            <span
              className={`text-[11px] hidden sm:block mt-0.5 ${
                selectedRole === 'wali' ? 'text-teal-100' : 'text-slate-500'
              }`}
            >
              Orang Tua Santri
            </span>
          </button>

          {/* Option 3: Admin */}
          <button
            type="button"
            onClick={() => setSelectedRole('admin')}
            className={`p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col items-center sm:items-start ${
              selectedRole === 'admin'
                ? 'bg-slate-900 text-white border-slate-800 shadow-md ring-2 ring-slate-700/30'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
            }`}
          >
            <div
              className={`p-2 rounded-xl mb-2 ${
                selectedRole === 'admin'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs sm:text-sm block">Admin</span>
            <span
              className={`text-[11px] hidden sm:block mt-0.5 ${
                selectedRole === 'admin' ? 'text-slate-200' : 'text-slate-500'
              }`}
            >
              User & Password
            </span>
          </button>
        </div>

        {/* Main Login Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
          {/* ROLE: USTADZ FORM */}
          {selectedRole === 'ustadz' && (
            <form onSubmit={handleUstadzLogin} className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Masuk Sebagai Ustadz / Musyrif</h3>
                  <p className="text-xs text-slate-500">Pilih akun halaqah pengampu Anda untuk mencatat setoran santri</p>
                </div>
              </div>

              {ustadzError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{ustadzError}</span>
                </div>
              )}

              <div>
                <label htmlFor="select-ustadz-dropdown" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Nama Ustadz / Musyrif
                </label>
                <select
                  id="select-ustadz-dropdown"
                  value={selectedUstadzId}
                  onChange={(e) => handleSelectUstadz(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {ustadzList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.halaqah}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ustadz-password-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kata Sandi Ustadz
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="ustadz-password-input"
                    type={showUstadzPass ? 'text' : 'password'}
                    value={ustadzPass}
                    onChange={(e) => setUstadzPass(e.target.value)}
                    placeholder="Masukkan password ustadz"
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
                    required
                  />
                  <button
                    id="btn-toggle-ustadz-password"
                    type="button"
                    onClick={() => setShowUstadzPass((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                    title={showUstadzPass ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                    aria-label={showUstadzPass ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                  >
                    {showUstadzPass ? (
                      <EyeOff className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Kata sandi bawaan ustadz: <strong className="font-mono text-slate-600">ustadz123</strong>
                </span>
              </div>

              {/* Centang Ingat Saya */}
              <div className="flex items-center justify-between py-1">
                <label
                  htmlFor="remember-me-ustadz"
                  className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none group"
                >
                  <input
                    id="remember-me-ustadz"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setRememberMe(checked);
                      if (!checked) {
                        saveStoredUstadzRemember(null);
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500 cursor-pointer accent-emerald-700"
                  />
                  <span className="group-hover:text-emerald-800 transition-colors">
                    Ingat saya di perangkat ini
                  </span>
                </label>
                {rememberMe && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    Tersimpan
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all cursor-pointer mt-2"
              >
                <GraduationCap className="w-4 h-4" />
                Masuk Dashboard Ustadz
              </button>
            </form>
          )}

          {/* ROLE: WALI SANTRI FORM */}
          {selectedRole === 'wali' && (
            <form onSubmit={handleWaliLogin} className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Masuk Sebagai Wali Santri</h3>
                  <p className="text-xs text-slate-500">Pilih nama ananda untuk memantau capaian hafalan 30 juz dan setoran harian</p>
                </div>
              </div>

              {waliError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{waliError}</span>
                </div>
              )}

              {/* Pencarian Nama Santri */}
              <div>
                <label htmlFor="search-santri-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pencarian Nama Santri Ananda
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="search-santri-input"
                    type="text"
                    value={searchSantri}
                    onChange={(e) => handleSearchSantriChange(e.target.value)}
                    placeholder="Ketik nama ananda, NIS, atau nama wali..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors"
                    autoComplete="off"
                  />
                  {searchSantri && (
                    <button
                      id="btn-clear-search-santri"
                      type="button"
                      onClick={handleClearSearchSantri}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                      title="Hapus pencarian / ganti santri"
                      aria-label="Hapus pencarian / ganti santri"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {!selectedSantri && (
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Ketik nama atau NIS untuk mencari nama santri ananda.
                  </span>
                )}
              </div>

              {/* Rekomendasi berada di bawah isian pencarian. Setelah santri terpilih, rekomendasi lainnya dihilangkan */}
              {selectedSantri ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      Santri Terpilih
                    </span>
                    <button
                      id="btn-change-santri"
                      type="button"
                      onClick={handleClearSearchSantri}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
                    >
                      Ganti Santri
                    </button>
                  </div>

                  <div className="p-3.5 bg-teal-50/90 border-2 border-teal-500 rounded-xl flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-teal-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                        {selectedSantri.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-teal-900 bg-teal-200/80 px-1.5 py-0.5 rounded">
                            NIS: {selectedSantri.nis}
                          </span>
                          <span className="text-[11px] text-slate-600">
                            {selectedSantri.halaqah}
                          </span>
                        </div>
                        <strong className="text-xs sm:text-sm text-slate-900 block truncate">
                          {selectedSantri.name}
                        </strong>
                        <span className="text-[11px] text-slate-600 block truncate">
                          Wali: {selectedSantri.guardianName}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-teal-700 text-white block shadow-xs">
                        {selectedSantri.totalMutqinJuz} / {selectedSantri.targetJuz} Juz
                      </span>
                      <span className="text-[10px] text-teal-700 font-semibold mt-0.5 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-teal-600" /> Siap Masuk
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-teal-600" />
                      Hasil Pencarian
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {filteredSantri.length > 0 ? `${filteredSantri.length} santri ditemukan` : ''}
                    </span>
                  </div>

                  {filteredSantri.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
                      <p className="text-xs text-slate-600 font-semibold">
                        Tidak ada hasil pencarian untuk "{searchSantri}"
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Periksa ejaan nama santri, nomor NIS, atau nama orang tua.
                      </p>
                      <button
                        type="button"
                        onClick={handleClearSearchSantri}
                        className="mt-2 text-xs text-teal-700 hover:text-teal-800 font-bold hover:underline cursor-pointer"
                      >
                        Tampilkan semua santri
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                      {filteredSantri.map((s) => (
                        <button
                          key={s.id}
                          id={`santri-rekomendasi-${s.id}`}
                          type="button"
                          onClick={() => handleSelectSantri(s.id)}
                          className="w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer bg-white hover:bg-teal-50/50 border-slate-200 hover:border-teal-400 hover:shadow-xs group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 bg-slate-100 text-slate-700 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                              {s.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <strong className="text-xs block truncate text-slate-800 group-hover:text-teal-900">
                                {s.name}
                              </strong>
                              <span className="text-[11px] text-slate-500 block truncate">
                                NIS: {s.nis} • Wali: {s.guardianName}
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right pl-1">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 group-hover:bg-teal-100 group-hover:text-teal-800">
                              {s.totalMutqinJuz} / {s.targetJuz} Juz
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5 truncate max-w-[120px]">
                              {s.halaqah}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-teal-700/20 transition-all cursor-pointer mt-2"
              >
                <HeartHandshake className="w-4 h-4" />
                {selectedSantri ? `Masuk Portal Wali ${selectedSantri.name}` : 'Masuk Portal Wali Santri'}
              </button>
            </form>
          )}

          {/* ROLE: ADMIN FORM (Username & Password) */}
          {selectedRole === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Portal Masuk Administrator</h3>
                  <p className="text-xs text-slate-500">
                    Masukkan username dan password admin untuk mengelola seluruh data lembaga
                  </p>
                </div>
              </div>

              {adminError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{adminError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username Admin
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    placeholder="Masukkan username admin"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-slate-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password Admin
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="admin-password-input"
                    type={showAdminPass ? 'text' : 'password'}
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="Masukkan password admin"
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-slate-700 focus:bg-white transition-colors"
                    required
                  />
                  <button
                    id="btn-toggle-admin-password"
                    type="button"
                    onClick={() => setShowAdminPass((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                    title={showAdminPass ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                    aria-label={showAdminPass ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                  >
                    {showAdminPass ? (
                      <EyeOff className="w-4 h-4 text-slate-800" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer mt-2"
              >
                <Lock className="w-4 h-4" />
                Masuk Sebagai Admin
              </button>
            </form>
          )}
        </div>

        {/* Bottom footer text */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Lembaga Tahfidz Qur'an • Membina generasi Rabbani yang mutqin 30 Juz
        </p>
      </div>
    </div>
  );
};
