import React, { useState } from 'react';
import { Santri, SetoranRecord } from '../types';
import { JuzProgressGrid } from './JuzProgressGrid';
import {
  Heart,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  Sparkles,
  MessageSquare,
  Printer,
  ChevronDown,
  UserCheck,
  Send,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface WaliSantriPortalProps {
  santriList: Santri[];
  setoranList: SetoranRecord[];
  initialSantriId?: string;
  onOpenRapor: (santri: Santri) => void;
  onVerifySetoran: (recordId: string, comment: string) => void;
}

export const WaliSantriPortal: React.FC<WaliSantriPortalProps> = ({
  santriList,
  setoranList,
  initialSantriId,
  onOpenRapor,
  onVerifySetoran,
}) => {
  const [selectedSantriId, setSelectedSantriId] = useState<string>(
    initialSantriId || santriList[0]?.id || ''
  );
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const currentSantri = santriList.find(s => s.id === selectedSantriId) || santriList[0];

  // Records for this child
  const childRecords = setoranList.filter(s => s.santriId === currentSantri?.id);

  const ziyadahCount = childRecords.filter(s => s.type === 'ziyadah').length;
  const murajaahCount = childRecords.filter(s => s.type === 'murajaah').length;
  const tasmiCount = childRecords.filter(s => s.type === 'tasmi').length;

  const targetPercentage = currentSantri
    ? Math.min(100, Math.round((currentSantri.totalMutqinJuz / currentSantri.targetJuz) * 100))
    : 0;

  const handleFeedbackSubmit = (recordId: string) => {
    if (!feedbackText.trim()) return;
    onVerifySetoran(recordId, feedbackText.trim());
    setActiveFeedbackId(null);
    setFeedbackText('');
  };

  if (!currentSantri) {
    return <div className="p-8 text-center text-slate-400">Data santri belum tersedia.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Selector Bar for Parents */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Portal Wali Santri</h3>
            <p className="text-xs text-slate-500">Pantau perkembangan hafalan ananda secara langsung dan transparan</p>
          </div>
        </div>

        {/* Child Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Pilih Ananda:</span>
          <select
            value={selectedSantriId}
            onChange={(e) => setSelectedSantriId(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {santriList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.nis})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Child Summary Hero Card */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl ${currentSantri.avatarColor} text-white font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/20`}>
              {currentSantri.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black">{currentSantri.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                  {currentSantri.gender === 'L' ? 'Ikhwan' : 'Akhwat'}
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-1">
                NIS: <span className="font-semibold text-white">{currentSantri.nis}</span> • Halaqah: <span className="font-semibold text-white">{currentSantri.halaqah}</span>
              </p>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Musyrif Pembimbing: <strong className="text-white">{currentSantri.ustadzName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <button
              onClick={() => onOpenRapor(currentSantri)}
              className="px-4 py-2.5 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              Lihat Rapor Resmi
            </button>
          </div>
        </div>

        {/* Target Progress Bar inside Hero */}
        <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="flex justify-between items-center text-xs mb-1.5 font-semibold">
              <span className="text-emerald-100">Progres Target Hafalan</span>
              <span className="text-emerald-200 font-bold">{currentSantri.totalMutqinJuz} dari {currentSantri.targetJuz} Juz Mutqin ({targetPercentage}%)</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${targetPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-200 block uppercase tracking-wider">Hafalan Terakhir</span>
              <span className="text-sm font-bold text-white">QS. {currentSantri.currentSurah} : {currentSantri.currentAyah}</span>
            </div>
            <BookOpen className="w-5 h-5 text-emerald-300" />
          </div>
        </div>
      </div>

      {/* 30 Juz Visual Map */}
      <JuzProgressGrid juzStatusMap={currentSantri.juzStatusMap} />

      {/* Stats Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Setoran Ziyadah (Baru)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-700">{ziyadahCount}</span>
            <span className="text-xs text-slate-400 font-medium">kali setoran</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">Penambahan ayat baru secara bertahap</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Pengulangan (Muraja'ah)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-sky-700">{murajaahCount}</span>
            <span className="text-xs text-slate-400 font-medium">kali setoran</span>
          </div>
          <p className="text-[11px] text-sky-600 mt-1">Menjaga kekuatan dan ketepatan hafalan</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Ujian Tasmi' (Sekali Duduk)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-purple-700">{tasmiCount}</span>
            <span className="text-xs text-slate-400 font-medium">kali tasmi'</span>
          </div>
          <p className="text-[11px] text-purple-600 mt-1">Verifikasi ke-mutqin-an satu juz utuh</p>
        </div>
      </div>

      {/* Timeline Setoran Real-Time */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Linimasa Setoran Real-Time</h3>
            <p className="text-xs text-slate-500">Catatan mutaba'ah langsung dari musyrif halaqah</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            {childRecords.length} Riwayat Setoran
          </span>
        </div>

        <div className="p-5 divide-y divide-slate-100">
          {childRecords.map((record) => (
            <div key={record.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
              {/* Header row: time, type, grade */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    record.type === 'ziyadah'
                      ? 'bg-emerald-100 text-emerald-800'
                      : record.type === 'murajaah'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {record.type}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">
                    QS. {record.surahName} (Ayat {record.ayahStart} - {record.ayahEnd}) • Juz {record.juz}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {record.date}, {record.time} WIB
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${
                    record.grade === 'mumtaz' ? 'bg-emerald-600 text-white' :
                    record.grade === 'jayyid_jiddan' ? 'bg-teal-600 text-white' :
                    record.grade === 'jayyid' ? 'bg-blue-600 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    {record.grade.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Detail Scores */}
              <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex-wrap">
                <div>Makhraj: <strong className="text-emerald-700">{record.makhrajScore} / 5 ⭐</strong></div>
                <div>Tajwid: <strong className="text-emerald-700">{record.tajwidScore} / 5 ⭐</strong></div>
                <div>Kelancaran: <strong className="text-emerald-700">{record.kelancaranScore} / 5 ⭐</strong></div>
                <div className="text-slate-400">Pengampu: <span className="font-semibold text-slate-700">{record.ustadzName}</span></div>
              </div>

              {/* Ustadz Notes */}
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/70 text-xs text-emerald-950">
                <span className="font-bold text-emerald-800 block mb-0.5">Catatan Musyrif:</span>
                <p className="italic">"{record.notes || 'Alhamdulillah setoran lancar dan tertib.'}"</p>
              </div>

              {/* Parent Verification & Feedback */}
              <div className="pt-1">
                {record.verifiedByGuardian ? (
                  <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-emerald-800">
                        Telah Disimak & Dikonfirmasi oleh Wali Santri
                      </span>
                      {record.guardianComment && (
                        <p className="text-slate-600 italic mt-0.5">
                          "{record.guardianComment}"
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    {activeFeedbackId === record.id ? (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <label className="block text-xs font-semibold text-slate-700">
                          Tuliskan Tanggapan atau Konfirmasi Simak di Rumah:
                        </label>
                        <input
                          type="text"
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Contoh: Alhamdulillah ananda sudah muraja'ah di rumah, terima kasih ustadz..."
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveFeedbackId(null);
                              setFeedbackText('');
                            }}
                            className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200 rounded-lg"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeedbackSubmit(record.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            Kirim Tanggapan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveFeedbackId(record.id);
                          setFeedbackText('Alhamdulillah, hafalan ini sudah disimak bersama di rumah.');
                        }}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Konfirmasi Telah Disimak / Berikan Tanggapan
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {childRecords.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              Belum ada riwayat setoran tercatat untuk ananda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
