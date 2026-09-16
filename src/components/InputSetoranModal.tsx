import React, { useState, useEffect } from 'react';
import { Santri, SetoranRecord, SetoranType, GradeType, JuzStatus } from '../types';
import { QURAN_SURAHS, getSurahByNumber } from '../data/quranData';
import { formatWhatsAppMessage } from '../services/storage';
import confetti from 'canvas-confetti';
import {
  X,
  BookOpen,
  Send,
  Star,
  Check,
  Sparkles,
  UserCheck,
  AlertCircle,
  QrCode,
  ScanLine
} from 'lucide-react';

interface InputSetoranModalProps {
  isOpen: boolean;
  onClose: () => void;
  santriList: Santri[];
  initialSantriId?: string;
  isQRVerified?: boolean;
  onReScanQR?: () => void;
  onSave: (newRecord: SetoranRecord, updatedSantri?: Santri) => void;
}

export const InputSetoranModal: React.FC<InputSetoranModalProps> = ({
  isOpen,
  onClose,
  santriList,
  initialSantriId,
  isQRVerified = false,
  onReScanQR,
  onSave,
}) => {
  const defaultSantri = santriList.find(s => s.id === initialSantriId) || santriList[0];

  const [selectedSantriId, setSelectedSantriId] = useState<string>(defaultSantri?.id || '');
  const [type, setType] = useState<SetoranType>('ziyadah');
  const [surahNum, setSurahNum] = useState<number>(2); // Default Al-Baqarah
  const [ayahStart, setAyahStart] = useState<number>(1);
  const [ayahEnd, setAyahEnd] = useState<number>(7);
  const [juz, setJuz] = useState<number>(1);
  const [grade, setGrade] = useState<GradeType>('mumtaz');
  const [makhrajScore, setMakhrajScore] = useState<number>(5);
  const [tajwidScore, setTajwidScore] = useState<number>(5);
  const [kelancaranScore, setKelancaranScore] = useState<number>(5);
  const [notes, setNotes] = useState<string>('Alhamdulillah hafalan sangat lancar dan tartil.');
  const [markJuzMutqin, setMarkJuzMutqin] = useState<boolean>(false);
  const [autoSendWA, setAutoSendWA] = useState<boolean>(false);

  // Synchronize when initialSantriId changes
  useEffect(() => {
    if (initialSantriId) {
      setSelectedSantriId(initialSantriId);
    }
  }, [initialSantriId, isOpen]);

  if (!isOpen) return null;

  const currentSantri = santriList.find(s => s.id === selectedSantriId) || santriList[0];
  const currentSurah = getSurahByNumber(surahNum) || QURAN_SURAHS[0];

  const handleSurahChange = (num: number) => {
    setSurahNum(num);
    const surah = getSurahByNumber(num);
    if (surah) {
      setJuz(surah.juz);
      setAyahStart(1);
      setAyahEnd(Math.min(surah.totalAyah, 10));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSantri) return;

    const now = new Date();
    const newRecord: SetoranRecord = {
      id: `set-${Date.now()}`,
      santriId: currentSantri.id,
      santriName: currentSantri.name,
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      type,
      surahNumber: currentSurah.number,
      surahName: currentSurah.nameLatin,
      ayahStart: Number(ayahStart),
      ayahEnd: Number(ayahEnd),
      juz: Number(juz),
      grade,
      makhrajScore,
      tajwidScore,
      kelancaranScore,
      ustadzName: currentSantri.ustadzName,
      notes: notes.trim(),
      verifiedByGuardian: false,
    };

    // Prepare santri updates
    let updatedSantri: Santri | undefined = undefined;
    if (markJuzMutqin || type === 'ziyadah') {
      const newMap: Record<number, JuzStatus> = { ...currentSantri.juzStatusMap };
      if (markJuzMutqin) {
        newMap[juz] = 'mutqin';
      } else if (newMap[juz] === 'belum') {
        newMap[juz] = 'proses';
      }

      const totalMutqin = Object.values(newMap).filter(s => s === 'mutqin').length;

      updatedSantri = {
        ...currentSantri,
        juzStatusMap: newMap,
        totalMutqinJuz: totalMutqin,
        currentSurah: currentSurah.nameLatin,
        currentAyah: Number(ayahEnd),
      };
    }

    if (grade === 'mumtaz' || type === 'tasmi') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }

    onSave(newRecord, updatedSantri);

    // If autoSendWA is requested, open WhatsApp Web immediately
    if (autoSendWA && currentSantri.guardianPhone) {
      const encodedMsg = formatWhatsAppMessage(newRecord, updatedSantri || currentSantri);
      const cleanPhone = currentSantri.guardianPhone.replace(/\D/g, '');
      const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <BookOpen className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Catat Setoran Hafalan Baru</h2>
              <p className="text-xs text-emerald-100">
                Input evaluasi makhraj, tajwid & kelancaran santri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* QR Verification Status Banner */}
          {isQRVerified && currentSantri && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300/80 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Check className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">
                      Santri Terverifikasi QR
                    </span>
                    <span className="text-xs text-slate-500 font-mono">NIS: {currentSantri.nis}</span>
                  </div>
                  <strong className="text-xs sm:text-sm text-slate-900 block truncate">{currentSantri.name}</strong>
                </div>
              </div>
              {onReScanQR && (
                <button
                  type="button"
                  onClick={onReScanQR}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <ScanLine className="w-3.5 h-3.5 text-emerald-600" />
                  Scan Ulang
                </button>
              )}
            </div>
          )}

          {/* Santri Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Santri Penyetor
              </label>
              {onReScanQR && !isQRVerified && (
                <button
                  type="button"
                  onClick={onReScanQR}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Pindai QR Santri
                </button>
              )}
            </div>
            <select
              value={selectedSantriId}
              onChange={(e) => setSelectedSantriId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium text-sm"
              required
            >
              {santriList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.nis}) - {s.halaqah}
                </option>
              ))}
            </select>
            {currentSantri && (
              <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Musyrif: <strong>{currentSantri.ustadzName}</strong></span>
                <span>Wali: <strong>{currentSantri.guardianName}</strong></span>
              </div>
            )}
          </div>

          {/* Type of Setoran */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Jenis Setoran
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('ziyadah')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  type === 'ziyadah'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🌱 Ziyadah (Hafalan Baru)
              </button>
              <button
                type="button"
                onClick={() => setType('murajaah')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  type === 'murajaah'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🔄 Muraja'ah (Pengulangan)
              </button>
              <button
                type="button"
                onClick={() => setType('tasmi')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  type === 'tasmi'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🏆 Tasmi' (Ujian Hafalan)
              </button>
            </div>
          </div>

          {/* Surah and Ayah Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Surat
              </label>
              <select
                value={surahNum}
                onChange={(e) => handleSurahChange(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-emerald-500"
              >
                {QURAN_SURAHS.map((surah) => (
                  <option key={surah.number} value={surah.number}>
                    {surah.number}. {surah.nameLatin} ({surah.totalAyah} Ayat)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ayat Mulai - Selesai
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={currentSurah.totalAyah}
                  value={ayahStart}
                  onChange={(e) => setAyahStart(Number(e.target.value))}
                  className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <span className="text-slate-400 font-bold">-</span>
                <input
                  type="number"
                  min={ayahStart}
                  max={currentSurah.totalAyah}
                  value={ayahEnd}
                  onChange={(e) => setAyahEnd(Number(e.target.value))}
                  className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Juz Ke
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={juz}
                onChange={(e) => setJuz(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Predikat / Grade */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Predikat Kelulusan Setoran
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { key: 'mumtaz', label: 'Mumtaz (A)', color: 'bg-emerald-600 text-white' },
                { key: 'jayyid_jiddan', label: 'Jayyid Jiddan (B+)', color: 'bg-teal-600 text-white' },
                { key: 'jayyid', label: 'Jayyid (B)', color: 'bg-blue-600 text-white' },
                { key: 'maqbul', label: 'Maqbul (C)', color: 'bg-amber-600 text-white' },
                { key: 'rasib', label: 'Rasib (D/Ulang)', color: 'bg-rose-600 text-white' },
              ].map((g) => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setGrade(g.key as GradeType)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    grade === g.key
                      ? `${g.color} font-bold shadow-xs scale-102`
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scores: Makhraj, Tajwid, Kelancaran */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            {/* Makhraj */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                <span>Makharijul Huruf</span>
                <span className="text-emerald-700 font-bold">{makhrajScore}/5</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setMakhrajScore(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${star <= makhrajScore ? 'fill-amber-400' : 'text-slate-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Tajwid */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                <span>Hukum Tajwid</span>
                <span className="text-emerald-700 font-bold">{tajwidScore}/5</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setTajwidScore(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${star <= tajwidScore ? 'fill-amber-400' : 'text-slate-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Kelancaran */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                <span>Kelancaran (Fashahah)</span>
                <span className="text-emerald-700 font-bold">{kelancaranScore}/5</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setKelancaranScore(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${star <= kelancaranScore ? 'fill-amber-400' : 'text-slate-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Catatan & Masukan Ustadz
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="Tuliskan catatan tajwid, ayat yang perlu diperbaiki, atau kalimat motivasi untuk santri dan wali..."
            ></textarea>
          </div>

          {/* Checkboxes: Mark Mutqin & WhatsApp */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={markJuzMutqin}
                onChange={(e) => setMarkJuzMutqin(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="font-semibold text-emerald-900">
                Tandai Juz {juz} telah SELESAI MUTQIN (Khatam & lulus tasmi')
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSendWA}
                onChange={(e) => setAutoSendWA(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="flex items-center gap-1.5 font-medium">
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                Langsung buka WhatsApp untuk kirim pesan laporan otomatis ke Wali Santri ({currentSantri?.guardianName})
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-700/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Simpan & Terbitkan Setoran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
