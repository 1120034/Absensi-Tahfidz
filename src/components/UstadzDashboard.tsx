import React, { useState } from 'react';
import { Santri, SetoranRecord, GoogleSyncConfig } from '../types';
import { formatWhatsAppMessage } from '../services/storage';
import {
  Plus,
  Search,
  Filter,
  Send,
  Printer,
  CheckCircle2,
  Clock,
  UserPlus,
  QrCode,
} from 'lucide-react';

interface UstadzDashboardProps {
  santriList: Santri[];
  setoranList: SetoranRecord[];
  syncConfig?: GoogleSyncConfig;
  onOpenSetoranModal: (santriId?: string) => void;
  onOpenAddSantri: (santri?: Santri) => void;
  onOpenGoogleSync?: () => void;
  onOpenRapor: (santri: Santri) => void;
  onOpenQRCard?: (santri: Santri) => void;
}

export const UstadzDashboard: React.FC<UstadzDashboardProps> = ({
  santriList,
  setoranList,
  onOpenSetoranModal,
  onOpenAddSantri,
  onOpenRapor,
  onOpenQRCard,
}) => {
  const [activeTab, setActiveTab] = useState<'log' | 'santri'>('log');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHalaqah, setFilterHalaqah] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Unique halaqahs
  const halaqahOptions = Array.from(new Set(santriList.map(s => s.halaqah)));

  // Filtered Setoran
  const filteredSetoran = setoranList.filter(item => {
    const matchesSearch =
      item.santriName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.surahName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchQuery.toLowerCase());

    const santriObj = santriList.find(s => s.id === item.santriId);
    const matchesHalaqah = filterHalaqah === 'all' || (santriObj && santriObj.halaqah === filterHalaqah);
    const matchesType = filterType === 'all' || item.type === filterType;

    return matchesSearch && matchesHalaqah && matchesType;
  });

  // Filtered Santri
  const filteredSantri = santriList.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.guardianName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesHalaqah = filterHalaqah === 'all' || s.halaqah === filterHalaqah;

    return matchesSearch && matchesHalaqah;
  });

  const handleSendWA = (record: SetoranRecord) => {
    const santri = santriList.find(s => s.id === record.santriId);
    if (!santri || !santri.guardianPhone) {
      alert('Nomor WhatsApp wali santri belum terdaftar.');
      return;
    }

    const cleanPhone = santri.guardianPhone.replace(/\D/g, '');
    const encoded = formatWhatsAppMessage(record, santri);
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs and Main Actions */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('log')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'log'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Log Setoran Real-Time ({setoranList.length})
            </button>
            <button
              onClick={() => setActiveTab('santri')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'santri'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Santri ({santriList.length})
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onOpenAddSantri()}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-slate-500" />
              Tambah Santri
            </button>
            <button
              onClick={() => onOpenSetoranModal()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              Catat Setoran (Scan QR)
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari santri, surat, atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Halaqah Filter */}
            <select
              value={filterHalaqah}
              onChange={(e) => setFilterHalaqah(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">Semua Halaqah</option>
              {halaqahOptions.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>

            {/* Setoran Type Filter (Only for Log Tab) */}
            {activeTab === 'log' && (
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="all">Semua Jenis Setoran</option>
                <option value="ziyadah">🌱 Ziyadah</option>
                <option value="murajaah">🔄 Muraja'ah</option>
                <option value="tasmi">🏆 Tasmi'</option>
              </select>
            )}
          </div>
        </div>

        {/* Tab 1: Log Setoran Real-Time */}
        {activeTab === 'log' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Waktu & Tanggal</th>
                  <th className="p-3.5">Santri</th>
                  <th className="p-3.5">Jenis</th>
                  <th className="p-3.5">Surat & Ayat</th>
                  <th className="p-3.5">Juz</th>
                  <th className="p-3.5">Predikat</th>
                  <th className="p-3.5">Rincian Nilai</th>
                  <th className="p-3.5">Catatan Ustadz</th>
                  <th className="p-3.5">Status Wali</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSetoran.map((record) => {
                  const santri = santriList.find(s => s.id === record.santriId);
                  return (
                    <tr key={record.id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{record.time} WIB</div>
                        <div className="text-[11px] text-slate-400">{record.date}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{record.santriName}</div>
                        <div className="text-[11px] text-slate-500">{santri?.halaqah}</div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            record.type === 'ziyadah'
                              ? 'bg-emerald-100 text-emerald-800'
                              : record.type === 'murajaah'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {record.type}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-semibold text-emerald-900">
                          QS. {record.surahName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Ayat {record.ayahStart} - {record.ayahEnd}
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-700 whitespace-nowrap">
                        Juz {record.juz}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] uppercase ${
                          record.grade === 'mumtaz' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          record.grade === 'jayyid_jiddan' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                          record.grade === 'jayyid' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {record.grade.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="text-[11px] space-y-0.5">
                          <div>Makhraj: <strong>{record.makhrajScore}★</strong></div>
                          <div>Tajwid: <strong>{record.tajwidScore}★</strong></div>
                          <div>Lancar: <strong>{record.kelancaranScore}★</strong></div>
                        </div>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <p className="text-slate-600 truncate" title={record.notes}>
                          "{record.notes || '-'}"
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Oleh: {record.ustadzName}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        {record.verifiedByGuardian ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Sudah Disimak
                            </span>
                            {record.guardianComment && (
                              <p className="text-[10px] text-slate-500 italic truncate max-w-[140px]" title={record.guardianComment}>
                                "{record.guardianComment}"
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            Belum Disimak
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleSendWA(record)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 ml-auto transition-colors cursor-pointer shadow-xs"
                          title="Kirim Laporan Mutaba'ah ke WhatsApp Wali Santri"
                        >
                          <Send className="w-3 h-3" />
                          Kirim WA
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredSetoran.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      Tidak ada catatan setoran yang cocok dengan filter atau pencarian Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Daftar Santri & Capaian */}
        {activeTab === 'santri' && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSantri.map((santri) => {
              const percentage = Math.min(100, Math.round((santri.totalMutqinJuz / santri.targetJuz) * 100));
              return (
                <div
                  key={santri.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header Santri */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl ${santri.avatarColor} text-white font-bold flex items-center justify-center text-base shadow-sm`}
                        >
                          {santri.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-snug">{santri.name}</h4>
                          <span className="text-xs text-slate-500 block">NIS: {santri.nis}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-full">
                          {santri.gender === 'L' ? 'Ikhwan' : 'Akhwat'}
                        </span>
                        {onOpenQRCard && (
                          <button
                            type="button"
                            onClick={() => onOpenQRCard(santri)}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 transition-colors cursor-pointer"
                            title="Tampilkan Kartu QR Santri"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 mb-4">
                      <div>Halaqah: <strong>{santri.halaqah}</strong></div>
                      <div>Musyrif: <strong>{santri.ustadzName}</strong></div>
                      <div>Wali: <strong>{santri.guardianName}</strong> ({santri.guardianPhone})</div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-600">Capaian Mutqin:</span>
                        <span className="text-emerald-700">
                          {santri.totalMutqinJuz} / {santri.targetJuz} Juz ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 mb-4 border border-slate-100">
                      <span className="text-[11px] text-slate-400 block">Posisi Hafalan Terakhir:</span>
                      <strong className="text-slate-800">
                        QS. {santri.currentSurah} (Ayat {santri.currentAyah})
                      </strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-1.5 pt-3 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => onOpenSetoranModal(santri.id)}
                      className="py-2 px-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-xl text-center transition-colors cursor-pointer truncate"
                      title="Catat Setoran Baru Santri"
                    >
                      + Setoran
                    </button>
                    {onOpenQRCard && (
                      <button
                        type="button"
                        onClick={() => onOpenQRCard(santri)}
                        className="py-2 px-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold rounded-xl text-center flex items-center justify-center gap-1 transition-colors cursor-pointer truncate"
                        title="Lihat & Cetak Kartu QR Santri"
                      >
                        <QrCode className="w-3.5 h-3.5 shrink-0" />
                        <span>Kartu QR</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenRapor(santri)}
                      className="py-2 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-center flex items-center justify-center gap-1 transition-colors cursor-pointer truncate"
                      title="Cetak Rapor Hafalan"
                    >
                      <Printer className="w-3.5 h-3.5 shrink-0" />
                      <span>Rapor</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
