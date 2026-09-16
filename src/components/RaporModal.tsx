import React, { useState, useEffect } from 'react';
import { Santri, SetoranRecord } from '../types';
import { JuzProgressGrid } from './JuzProgressGrid';
import { generateQRCodeDataURL, getSantriQRPayload } from '../utils/qrCode';
import { X, Printer, Award, BookOpen, Calendar, CheckCircle2 } from 'lucide-react';

interface RaporModalProps {
  isOpen: boolean;
  onClose: () => void;
  santri: Santri | null;
  setoranList: SetoranRecord[];
}

export const RaporModal: React.FC<RaporModalProps> = ({
  isOpen,
  onClose,
  santri,
  setoranList,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (santri) {
      const payload = getSantriQRPayload(santri);
      generateQRCodeDataURL(payload).then(setQrUrl);
    }
  }, [santri]);

  if (!isOpen || !santri) return null;

  const santriRecords = setoranList.filter(s => s.santriId === santri.id);
  const ziyadahCount = santriRecords.filter(s => s.type === 'ziyadah').length;
  const murajaahCount = santriRecords.filter(s => s.type === 'murajaah').length;
  const tasmiCount = santriRecords.filter(s => s.type === 'tasmi').length;

  const avgMakhraj =
    santriRecords.length > 0
      ? (santriRecords.reduce((acc, c) => acc + c.makhrajScore, 0) / santriRecords.length).toFixed(1)
      : '5.0';

  const avgTajwid =
    santriRecords.length > 0
      ? (santriRecords.reduce((acc, c) => acc + c.tajwidScore, 0) / santriRecords.length).toFixed(1)
      : '5.0';

  const avgKelancaran =
    santriRecords.length > 0
      ? (santriRecords.reduce((acc, c) => acc + c.kelancaranScore, 0) / santriRecords.length).toFixed(1)
      : '5.0';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in duration-200 print:m-0 print:border-none print:shadow-none print:w-full print:max-h-none print:overflow-visible">
        {/* Top Action Bar (hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-xs sm:text-sm">Pratinjau Rapor Mutaba'ah Tahfidz</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak / Simpan PDF</span>
              <span className="sm:hidden">Cetak</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-6 sm:p-10 space-y-6 text-slate-800 bg-white overflow-y-auto flex-1 print:overflow-visible print:p-0">
          {/* Header Lembaga */}
          <div className="text-center border-b-2 border-emerald-900 pb-5">
            <h1 className="font-arabic text-3xl text-emerald-900 font-bold mb-1">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </h1>
            <h2 className="text-xl font-extrabold uppercase tracking-wide text-slate-900">
              LEMBAGA PENDIDIKAN TAHFIDZUL QUR'AN AL-KARIM
            </h2>
            <p className="text-xs text-slate-600">
              Sistem Informasi Manajemen & Laporan Mutaba'ah Hafalan Terpadu
            </p>
            <div className="inline-block mt-2 px-4 py-1 bg-emerald-100 text-emerald-900 rounded-full font-bold text-xs uppercase tracking-wider">
              Laporan Perkembangan Hafalan Santri
            </div>
          </div>

          {/* Biodata Santri */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 flex-1 w-full">
              <div className="space-y-1.5">
                <div className="flex">
                  <span className="w-32 text-slate-500 font-medium">Nama Santri</span>
                  <span className="font-bold text-slate-900">: {santri.name}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-500 font-medium">Nomor Induk (NIS)</span>
                  <span className="font-semibold">: {santri.nis}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-500 font-medium">Halaqah</span>
                  <span className="font-semibold">: {santri.halaqah}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex">
                  <span className="w-36 text-slate-500 font-medium">Musyrif Pengampu</span>
                  <span className="font-semibold">: {santri.ustadzName}</span>
                </div>
                <div className="flex">
                  <span className="w-36 text-slate-500 font-medium">Wali Santri</span>
                  <span className="font-semibold">: {santri.guardianName}</span>
                </div>
                <div className="flex">
                  <span className="w-36 text-slate-500 font-medium">Target / Capaian</span>
                  <span className="font-bold text-emerald-800">
                    : {santri.totalMutqinJuz} dari {santri.targetJuz} Juz Mutqin
                  </span>
                </div>
              </div>
            </div>

            {qrUrl && (
              <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col items-center justify-center shrink-0">
                <img
                  src={qrUrl}
                  alt={`QR Code ${santri.name}`}
                  className="w-18 h-18 object-contain"
                />
                <span className="text-[9px] font-mono font-bold text-slate-600 mt-1 uppercase">
                  QR Santri
                </span>
              </div>
            )}
          </div>

          {/* Peta Capaian 30 Juz */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              Peta 30 Juz Al-Qur'an
            </h3>
            <div className="scale-95 origin-top">
              <JuzProgressGrid juzStatusMap={santri.juzStatusMap} interactive={false} />
            </div>
          </div>

          {/* Statistik Rata-rata Nilai */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[11px] text-slate-500 font-medium">Makharijul Huruf</span>
              <div className="text-lg font-bold text-emerald-700 mt-0.5">{avgMakhraj} / 5.0</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[11px] text-slate-500 font-medium">Hukum Tajwid</span>
              <div className="text-lg font-bold text-emerald-700 mt-0.5">{avgTajwid} / 5.0</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[11px] text-slate-500 font-medium">Kelancaran (Fashahah)</span>
              <div className="text-lg font-bold text-emerald-700 mt-0.5">{avgKelancaran} / 5.0</div>
            </div>
          </div>

          {/* Tabel Catatan Setoran Terbaru */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Riwayat Setoran Terbaru
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Tanggal</th>
                    <th className="p-2.5">Jenis</th>
                    <th className="p-2.5">Surat & Ayat</th>
                    <th className="p-2.5">Juz</th>
                    <th className="p-2.5">Predikat</th>
                    <th className="p-2.5">Catatan Evaluasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {santriRecords.slice(0, 5).map((r) => (
                    <tr key={r.id}>
                      <td className="p-2.5 text-slate-600">{r.date}</td>
                      <td className="p-2.5 font-medium uppercase text-[10px]">
                        <span className={`px-2 py-0.5 rounded-full ${
                          r.type === 'ziyadah' ? 'bg-emerald-100 text-emerald-800' :
                          r.type === 'murajaah' ? 'bg-sky-100 text-sky-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {r.type}
                        </span>
                      </td>
                      <td className="p-2.5 font-semibold text-slate-800">
                        {r.surahName} ({r.ayahStart}-{r.ayahEnd})
                      </td>
                      <td className="p-2.5">Juz {r.juz}</td>
                      <td className="p-2.5 font-semibold text-emerald-700 uppercase">
                        {r.grade.replace('_', ' ')}
                      </td>
                      <td className="p-2.5 text-slate-600 italic max-w-xs truncate">
                        "{r.notes || '-'}"
                      </td>
                    </tr>
                  ))}
                  {santriRecords.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400">
                        Belum ada catatan setoran tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tanda Tangan */}
          <div className="grid grid-cols-3 gap-4 pt-8 text-xs text-center">
            <div>
              <p className="text-slate-500 mb-14">Wali Santri</p>
              <p className="font-bold border-b border-slate-400 inline-block px-4 pb-1">
                {santri.guardianName}
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-14">Musyrif Pengampu</p>
              <p className="font-bold border-b border-slate-400 inline-block px-4 pb-1">
                {santri.ustadzName}
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-14">Mudir Tahfidz</p>
              <p className="font-bold border-b border-slate-400 inline-block px-4 pb-1">
                KH. Ahmad Dahlan, MA.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
