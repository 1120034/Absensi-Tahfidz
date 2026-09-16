import React, { useState } from 'react';
import { Santri, SetoranRecord, GoogleSyncConfig, UstadzAccount } from '../types';
import {
  getStoredUstadz,
  saveUstadzList,
  getStoredAdminCredentials,
  saveAdminCredentials,
} from '../services/storage';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  BookOpen,
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Printer,
  Search,
  Award,
  QrCode
} from 'lucide-react';

interface AdminPortalProps {
  santriList: Santri[];
  setoranList: SetoranRecord[];
  syncConfig: GoogleSyncConfig;
  onOpenGoogleSync: () => void;
  onOpenAddSantri: (santri?: Santri) => void;
  onOpenSetoranModal: (santriId?: string) => void;
  onOpenRapor: (santri: Santri) => void;
  onOpenQRCard?: (santri: Santri) => void;
  onDeleteSantri: (santriId: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  santriList,
  setoranList,
  syncConfig,
  onOpenGoogleSync,
  onOpenAddSantri,
  onOpenSetoranModal,
  onOpenRapor,
  onOpenQRCard,
  onDeleteSantri,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'santri' | 'ustadz' | 'settings'>('overview');
  const [ustadzList, setUstadzList] = useState<UstadzAccount[]>(() => getStoredUstadz());

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Admin password change form
  const [adminCreds, setAdminCreds] = useState(() => getStoredAdminCredentials());
  const [newUsername, setNewUsername] = useState(adminCreds.username);
  const [newPassword, setNewPassword] = useState(adminCreds.password);
  const [passSaveMsg, setPassSaveMsg] = useState<string | null>(null);

  // Add Ustadz modal
  const [isAddUstadzOpen, setIsAddUstadzOpen] = useState(false);
  const [ustName, setUstName] = useState('');
  const [ustHalaqah, setUstHalaqah] = useState('');
  const [ustUsername, setUstUsername] = useState('');
  const [ustPassword, setUstPassword] = useState('ustadz123');

  // Stats calculation
  const totalMutqin = santriList.reduce((acc, curr) => acc + curr.totalMutqinJuz, 0);

  const handleSaveAdminCreds = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...adminCreds,
      username: newUsername.trim(),
      password: newPassword.trim(),
    };
    saveAdminCredentials(updated);
    setAdminCreds(updated);
    setPassSaveMsg('Username dan password admin berhasil diperbarui.');
    setTimeout(() => setPassSaveMsg(null), 3000);
  };

  const handleAddUstadz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ustName.trim() || !ustHalaqah.trim()) return;

    const newUst: UstadzAccount = {
      id: `ust-${Date.now()}`,
      name: ustName.trim(),
      halaqah: ustHalaqah.trim(),
      username: ustUsername.trim() || `ust.${Date.now()}`,
      password: ustPassword.trim() || 'ustadz123',
    };

    const nextList = [...ustadzList, newUst];
    setUstadzList(nextList);
    saveUstadzList(nextList);

    setUstName('');
    setUstHalaqah('');
    setUstUsername('');
    setUstPassword('ustadz123');
    setIsAddUstadzOpen(false);
  };

  const handleDeleteUstadz = (id: string) => {
    if (window.confirm('Yakin ingin menghapus akun ustadz ini?')) {
      const nextList = ustadzList.filter((u) => u.id !== id);
      setUstadzList(nextList);
      saveUstadzList(nextList);
    }
  };

  const filteredSantri = santriList.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.nis.toLowerCase().includes(q) ||
      s.halaqah.toLowerCase().includes(q) ||
      s.guardianName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Portal Administrasi Pusat</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 uppercase">
                Admin Mode
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Pengelolaan menyeluruh data santri, akun musyrif halaqah, dan sinkronisasi laporan cloud.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenGoogleSync}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Integrasi Sheets & Drive
          </button>
          <button
            onClick={() => onOpenSetoranModal()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Catat Setoran
          </button>
        </div>
      </div>

      {/* Admin Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Santri</span>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{santriList.length} Santri</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Terdaftar Aktif</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-teal-50 text-teal-700">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ustadz & Musyrif</span>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{ustadzList.length} Pengampu</h3>
            <p className="text-[11px] text-teal-600 font-medium mt-0.5">Membina Halaqah</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-700">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Setoran</span>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{setoranList.length} Log</h3>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">Tercatat di Sistem</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-700">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Juz Mutqin</span>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalMutqin} Juz</h3>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">Lulus Ujian Tasmi'</p>
          </div>
        </div>
      </div>

      {/* Main Admin Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekapitulasi Jurnal
            </button>
            <button
              onClick={() => setActiveTab('santri')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'santri' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kelola Santri ({santriList.length})
            </button>
            <button
              onClick={() => setActiveTab('ustadz')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ustadz' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kelola Ustadz ({ustadzList.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Keamanan & Password
            </button>
          </div>

          {activeTab === 'santri' && (
            <button
              onClick={() => onOpenAddSantri()}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Santri Baru
            </button>
          )}

          {activeTab === 'ustadz' && (
            <button
              onClick={() => setIsAddUstadzOpen(true)}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Ustadz Baru
            </button>
          )}
        </div>

        {/* Tab 1: Rekapitulasi Jurnal */}
        {activeTab === 'overview' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Waktu</th>
                  <th className="p-3.5">Nama Santri</th>
                  <th className="p-3.5">Jenis</th>
                  <th className="p-3.5">Surat & Ayat</th>
                  <th className="p-3.5">Juz</th>
                  <th className="p-3.5">Predikat</th>
                  <th className="p-3.5">Musyrif</th>
                  <th className="p-3.5">Catatan</th>
                  <th className="p-3.5">Status Wali</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {setoranList.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 whitespace-nowrap text-slate-500">
                      <div>{rec.date}</div>
                      <div className="text-[11px]">{rec.time} WIB</div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">{rec.santriName}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        rec.type === 'ziyadah' ? 'bg-emerald-100 text-emerald-800' :
                        rec.type === 'murajaah' ? 'bg-sky-100 text-sky-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {rec.type}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-medium text-emerald-950">
                      QS. {rec.surahName} ({rec.ayahStart}-{rec.ayahEnd})
                    </td>
                    <td className="p-3.5 font-bold">Juz {rec.juz}</td>
                    <td className="p-3.5 uppercase font-semibold text-slate-700">
                      {rec.grade.replace('_', ' ')}
                    </td>
                    <td className="p-3.5 text-slate-600">{rec.ustadzName}</td>
                    <td className="p-3.5 max-w-xs truncate text-slate-500 italic">
                      "{rec.notes || '-'}"
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {rec.verifiedByGuardian ? (
                        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Dikonfirmasi
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Belum Disimak</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Kelola Santri */}
        {activeTab === 'santri' && (
          <div>
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <div className="relative max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari santri, NIS, atau halaqah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">NIS</th>
                    <th className="p-3.5">Nama Santri</th>
                    <th className="p-3.5">Halaqah</th>
                    <th className="p-3.5">Capaian Mutqin</th>
                    <th className="p-3.5">Wali Santri & No. WA</th>
                    <th className="p-3.5">Musyrif</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSantri.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono text-slate-600">{s.nis}</td>
                      <td className="p-3.5 font-bold text-slate-900">{s.name}</td>
                      <td className="p-3.5">{s.halaqah}</td>
                      <td className="p-3.5 font-semibold text-emerald-800">
                        {s.totalMutqinJuz} / {s.targetJuz} Juz
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{s.guardianName}</div>
                        <div className="text-[11px] text-slate-400">{s.guardianPhone}</div>
                      </td>
                      <td className="p-3.5 text-slate-600">{s.ustadzName}</td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {onOpenQRCard && (
                            <button
                              type="button"
                              onClick={() => onOpenQRCard(s)}
                              className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg cursor-pointer transition-colors"
                              title="Lihat & Cetak Kartu QR Santri"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onOpenRapor(s)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg"
                            title="Cetak Rapor"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenAddSantri(s)}
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg"
                            title="Edit Data Santri"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteSantri(s.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Hapus Santri"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Kelola Ustadz */}
        {activeTab === 'ustadz' && (
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {ustadzList.map((u) => (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{u.name}</h4>
                        <span className="text-[11px] text-slate-500">{u.halaqah}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 text-xs space-y-1 my-2 border border-slate-100">
                      <div>Username: <strong className="font-mono text-slate-800">{u.username}</strong></div>
                      <div>Password: <strong className="font-mono text-slate-800">{u.password}</strong></div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleDeleteUstadz(u.id)}
                      className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus Akun
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Keamanan & Password Admin */}
        {activeTab === 'settings' && (
          <div className="p-6 max-w-lg space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Ubah Kredensial Portal Admin</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pastikan username dan password admin disimpan dengan aman.
              </p>
            </div>

            {passSaveMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{passSaveMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdminCreds} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username Admin
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password Baru Admin
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Simpan Perubahan Kredensial
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Modal Add Ustadz */}
      {isAddUstadzOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <h3 className="font-bold text-slate-900 text-base">Tambah Akun Ustadz / Musyrif Baru</h3>
            <form onSubmit={handleAddUstadz} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  placeholder="Contoh: Ustadz M. Fauzan, S.Th.I"
                  value={ustName}
                  onChange={(e) => setUstName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Nama Halaqah</label>
                <input
                  type="text"
                  placeholder="Contoh: Halaqah Abu Bakar Ash-Shiddiq"
                  value={ustHalaqah}
                  onChange={(e) => setUstHalaqah(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Username</label>
                  <input
                    type="text"
                    placeholder="ustadz.fauzan"
                    value={ustUsername}
                    onChange={(e) => setUstUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Password</label>
                  <input
                    type="text"
                    value={ustPassword}
                    onChange={(e) => setUstPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUstadzOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Simpan Akun Ustadz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
