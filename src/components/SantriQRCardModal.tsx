import React, { useEffect, useState, useRef } from 'react';
import { Santri } from '../types';
import { generateQRCodeDataURL, getSantriQRPayload } from '../utils/qrCode';
import { X, Printer, Download, QrCode, CheckCircle2, Copy } from 'lucide-react';

interface SantriQRCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  santri: Santri | null;
}

export const SantriQRCardModal: React.FC<SantriQRCardModalProps> = ({
  isOpen,
  onClose,
  santri,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!santri) return;
    const payload = getSantriQRPayload(santri);
    generateQRCodeDataURL(payload).then(setQrUrl);
  }, [santri]);

  if (!isOpen || !santri) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `QR_${santri.nis}_${santri.name.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  const handleCopyPayload = () => {
    const payload = getSantriQRPayload(santri);
    navigator.clipboard.writeText(payload).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Kartu QR Santri</h3>
              <p className="text-xs text-slate-500">Identitas digital untuk absensi & pencatatan jurnal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card Container */}
        <div className="p-4 sm:p-6 flex flex-col items-center overflow-y-auto flex-1">
          <div
            ref={cardRef}
            className="w-full bg-gradient-to-b from-emerald-800 via-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-emerald-700/50 flex flex-col items-center text-center relative overflow-hidden"
          >
            {/* Watermark Pattern */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-emerald-500/10 pointer-events-none"></div>
            <div className="absolute -left-8 -top-8 w-32 h-32 rounded-full bg-teal-500/10 pointer-events-none"></div>

            {/* Header Badge */}
            <div className="flex items-center justify-between w-full pb-3 border-b border-white/15 mb-4">
              <div className="text-left">
                <span className="text-[10px] font-extrabold tracking-wider text-emerald-300 uppercase block">
                  KARTU IDENTITAS TAHFIDZ
                </span>
                <span className="text-xs font-semibold text-white/90">Pondok Pesantren Tahfidz</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-emerald-200 border border-white/20">
                {santri.gender === 'L' ? 'Ikhwan' : 'Akhwat'}
              </span>
            </div>

            {/* QR Code Canvas/Image */}
            <div className="bg-white p-3 rounded-2xl shadow-md mb-4 flex items-center justify-center">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt={`QR Code ${santri.name}`}
                  className="w-44 h-44 object-contain"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                  Memuat QR...
                </div>
              )}
            </div>

            {/* Santri Info */}
            <h4 className="text-base sm:text-lg font-extrabold text-white tracking-wide">{santri.name}</h4>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-xs font-mono font-bold bg-emerald-500/25 px-2 py-0.5 rounded-md text-emerald-200 border border-emerald-400/30">
                NIS: {santri.nis}
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-emerald-100 font-medium">{santri.halaqah}</span>
            </div>

            <div className="w-full mt-3 pt-3 border-t border-white/10 grid grid-cols-2 text-left text-[11px] text-slate-300">
              <div>
                <span className="text-slate-400 block text-[10px]">Musyrif Halaqah:</span>
                <strong className="text-white font-semibold truncate block">{santri.ustadzName}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Target Capaian:</span>
                <strong className="text-emerald-300 font-semibold">{santri.totalMutqinJuz} / {santri.targetJuz} Juz</strong>
              </div>
            </div>

            <p className="text-[10px] text-emerald-200/70 mt-3 italic">
              Scan kode QR ini sebelum menyetorkan hafalan ziyadah atau muraja'ah.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopyPayload}
            className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            {copied ? 'Tersalin' : 'Salin Data'}
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleDownload}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Unduh QR
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-800/20"
            >
              <Printer className="w-4 h-4" />
              Cetak Kartu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
