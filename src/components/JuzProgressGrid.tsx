import React, { useState } from 'react';
import { JuzStatus } from '../types';
import { getSurahsForJuz } from '../data/quranData';
import { CheckCircle2, Clock, CircleDot, BookOpen, X } from 'lucide-react';

interface JuzProgressGridProps {
  juzStatusMap: Record<number, JuzStatus>;
  onJuzClick?: (juzNum: number) => void;
  interactive?: boolean;
}

export const JuzProgressGrid: React.FC<JuzProgressGridProps> = ({
  juzStatusMap,
  onJuzClick,
  interactive = true,
}) => {
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);

  const handleSelect = (juz: number) => {
    setSelectedJuz(juz);
    if (onJuzClick) onJuzClick(juz);
  };

  const juzList = Array.from({ length: 30 }, (_, i) => i + 1);

  // Statistics
  const mutqinCount = Object.values(juzStatusMap).filter(s => s === 'mutqin').length;
  const prosesCount = Object.values(juzStatusMap).filter(s => s === 'proses').length;
  const belumCount = 30 - mutqinCount - prosesCount;

  return (
    <div id="juz-progress-container" className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Peta Capaian 30 Juz Al-Qur'an
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Klik nomor juz untuk melihat rincian surat dan status penguasaan
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
            <span className="text-slate-600 font-medium">Mutqin ({mutqinCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400 inline-block"></span>
            <span className="text-slate-600 font-medium">Proses ({prosesCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-200 inline-block"></span>
            <span className="text-slate-500 font-medium">Belum ({belumCount})</span>
          </div>
        </div>
      </div>

      {/* Grid of 30 Juz */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
        {juzList.map((juz) => {
          const status = juzStatusMap[juz] || 'belum';
          const isSelected = selectedJuz === juz;

          let bgStyle = 'bg-slate-100 text-slate-500 hover:bg-slate-200 border-slate-200';
          let badgeText = 'Belum';

          if (status === 'mutqin') {
            bgStyle = 'bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-600 shadow-xs shadow-emerald-200';
            badgeText = 'Mutqin';
          } else if (status === 'proses') {
            bgStyle = 'bg-amber-400 text-amber-950 hover:bg-amber-500 border-amber-500 animate-pulse';
            badgeText = 'Proses';
          }

          return (
            <button
              key={juz}
              id={`juz-card-${juz}`}
              type="button"
              onClick={() => interactive && handleSelect(juz)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${bgStyle} ${
                isSelected ? 'ring-2 ring-emerald-600 ring-offset-2 scale-105 z-10' : ''
              }`}
              title={`Juz ${juz}: ${badgeText}`}
            >
              <span className="text-[10px] uppercase tracking-wider font-medium opacity-80">Juz</span>
              <span className="text-base font-bold leading-tight">{juz}</span>
              <div className="mt-1">
                {status === 'mutqin' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                {status === 'proses' && <Clock className="w-3.5 h-3.5 text-amber-950" />}
                {status === 'belum' && <CircleDot className="w-3.5 h-3.5 text-slate-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Modal/Popout for Selected Juz */}
      {selectedJuz && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm animate-fadeIn">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                Juz {selectedJuz}
              </span>
              <span className="text-xs text-slate-500">
                Status:{' '}
                <strong className={juzStatusMap[selectedJuz] === 'mutqin' ? 'text-emerald-600' : juzStatusMap[selectedJuz] === 'proses' ? 'text-amber-600' : 'text-slate-500'}>
                  {juzStatusMap[selectedJuz] === 'mutqin' ? 'Mutqin (Tuntas Ujian)' : juzStatusMap[selectedJuz] === 'proses' ? 'Sedang Dihafal' : 'Belum Mulai'}
                </strong>
              </span>
            </div>
            <button
              onClick={() => setSelectedJuz(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-slate-600 mb-2">
            Surat-surat utama yang terkandung di dalam Juz {selectedJuz}:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {getSurahsForJuz(selectedJuz).length > 0 ? (
              getSurahsForJuz(selectedJuz).map((s) => (
                <div key={s.number} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                  <div className="truncate">
                    <span className="font-semibold text-slate-800">{s.number}. {s.nameLatin}</span>
                    <span className="text-[11px] text-slate-500 block">({s.totalAyah} Ayat - {s.meaning})</span>
                  </div>
                  <span className="font-arabic text-base text-emerald-800 pl-2">{s.nameArabic}</span>
                </div>
              ))
            ) : (
              <div className="col-span-full p-2 bg-white rounded-lg text-slate-500 text-xs italic">
                Juz {selectedJuz} mencakup rangkaian ayat Al-Qur'an pada bagian tengah surat utama.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
