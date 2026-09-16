import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { Santri } from '../types';
import { matchSantriFromQR, playScanBeep } from '../utils/qrCode';
import confetti from 'canvas-confetti';
import {
  X,
  Camera,
  Upload,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Flashlight,
  UserCheck,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  santriList: Santri[];
  onSantriSelected: (santri: Santri) => void;
  onSkipToManual?: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  santriList,
  onSantriSelected,
  onSkipToManual,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'simulate'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannedSantri, setScannedSantri] = useState<Santri | null>(null);
  const [scanErrorMsg, setScanErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Stop camera stream cleanly
  const stopCamera = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Handle successful match
  const handleSuccess = useCallback(
    (santri: Santri) => {
      if (isProcessing) return;
      setIsProcessing(true);
      setScannedSantri(santri);
      setScanErrorMsg(null);
      stopCamera();

      // Play audio feedback & confetti
      playScanBeep();
      try {
        confetti({
          particleCount: 40,
          spread: 55,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#34d399', '#f59e0b'],
        });
      } catch {
        // Confetti optional
      }

      // Auto forward after brief visual confirmation
      const timer = setTimeout(() => {
        onSantriSelected(santri);
      }, 900);

      return () => clearTimeout(timer);
    },
    [isProcessing, onSantriSelected, stopCamera]
  );

  // Process video frames
  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          const matched = matchSantriFromQR(code.data, santriList);
          if (matched) {
            handleSuccess(matched);
            return;
          } else {
            setScanErrorMsg('Kode QR terdeteksi tapi tidak cocok dengan santri terdaftar.');
          }
        }
      }
    }

    animationFrameId.current = requestAnimationFrame(scanFrame);
  }, [handleSuccess, isProcessing, santriList]);

  // Start camera
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setScanErrorMsg(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Kamera tidak didukung pada peramban ini. Silakan gunakan opsi unggah foto QR atau pilih santri langsung.');
      setActiveTab('simulate');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        animationFrameId.current = requestAnimationFrame(scanFrame);

        // Check torch capabilities
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };
        if (capabilities && capabilities.torch) {
          setHasTorch(true);
        }
      }
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      setCameraError(
        'Izin kamera tidak diberikan atau perangkat kamera tidak tersedia. Silakan gunakan opsi unggah foto QR atau pilih santri langsung di bawah.'
      );
      setActiveTab('simulate');
    }
  }, [facingMode, scanFrame, stopCamera]);

  // Toggle torch
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await (track as MediaStreamTrack & { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
        advanced: [{ torch: !isTorchOn }],
      });
      setIsTorchOn(!isTorchOn);
    } catch (e) {
      console.warn('Failed to toggle torch', e);
    }
  };

  // Flip camera
  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Handle uploaded QR image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          const matched = matchSantriFromQR(code.data, santriList);
          if (matched) {
            handleSuccess(matched);
          } else {
            setScanErrorMsg('Kode QR pada foto tidak terdaftar sebagai santri aktif.');
          }
        } else {
          setScanErrorMsg('Tidak dapat mendeteksi kode QR pada gambar yang diunggah.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Manage camera on modal open/close & tab change
  useEffect(() => {
    if (isOpen) {
      setScannedSantri(null);
      setIsProcessing(false);
      setScanErrorMsg(null);
      if (activeTab === 'camera') {
        startCamera();
      } else {
        stopCamera();
      }
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode, startCamera, stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Pindai Kode QR Santri
              </h3>
              <p className="text-xs text-slate-500">
                Arahkan kamera ke kartu QR santri sebelum mencatat jurnal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-2 bg-slate-100 border-b border-slate-200 flex items-center justify-center gap-1 shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Kamera Langsung
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Unggah Foto QR
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('simulate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'simulate'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Pilih Cepat ({santriList.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* SUCCESS OVERLAY */}
          {scannedSantri && (
            <div className="p-5 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-center space-y-3 animate-in zoom-in-95 duration-200 shadow-md">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl mx-auto flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-200/80 px-2 py-0.5 rounded-md">
                  QR Santri Berhasil Diverifikasi!
                </span>
                <h4 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  {scannedSantri.name}
                </h4>
                <p className="text-xs text-slate-600">
                  NIS: {scannedSantri.nis} • Halaqah {scannedSantri.halaqah}
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-emerald-700 font-semibold">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                Membuka lembar catatan jurnal setoran...
              </div>
            </div>
          )}

          {/* SCAN ERROR MESSAGE */}
          {scanErrorMsg && !scannedSantri && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{scanErrorMsg}</span>
            </div>
          )}

          {/* TAB 1: LIVE CAMERA SCANNER */}
          {activeTab === 'camera' && !scannedSantri && (
            <div className="space-y-3">
              {cameraError ? (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
                  <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl w-12 h-12 mx-auto flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Akses Kamera Terkendala</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {cameraError}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Coba Lagi
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('simulate')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Gunakan Pilih Santri
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full aspect-square max-w-xs mx-auto bg-black rounded-3xl overflow-hidden shadow-inner border-2 border-emerald-600/60">
                  {/* Real video feed */}
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Scanning Crosshair & Viewfinder */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-56 h-56 border-2 border-emerald-400/80 rounded-2xl relative shadow-2xl">
                      {/* Corner Accents */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>

                      {/* Animated Laser Beam */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-lg shadow-emerald-400 absolute top-0 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Camera Controls Bar */}
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-auto">
                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="p-2.5 bg-slate-900/80 hover:bg-black text-white rounded-xl text-xs font-bold backdrop-blur-md flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Ganti kamera depan/belakang"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Balik</span>
                    </button>

                    {hasTorch && (
                      <button
                        type="button"
                        onClick={toggleTorch}
                        className={`p-2.5 rounded-xl text-xs font-bold backdrop-blur-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isTorchOn ? 'bg-amber-500 text-slate-950' : 'bg-slate-900/80 text-white'
                        }`}
                        title="Flash kamera"
                      >
                        <Flashlight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <p className="text-center text-xs text-slate-500">
                Posisikan kode QR di dalam bingkai hijau. Pemindaian akan berjalan otomatis.
              </p>
            </div>
          )}

          {/* TAB 2: UPLOAD IMAGE */}
          {activeTab === 'upload' && !scannedSantri && (
            <div className="space-y-4">
              <label
                htmlFor="qr-file-upload"
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/60 hover:bg-emerald-50/30 transition-all"
              >
                <div className="p-3 bg-white text-emerald-700 rounded-2xl shadow-xs mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Pilih atau Seret Foto QR Code</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Dukung format JPG, PNG, atau tangkapan layar dari kartu santri.
                </p>
                <span className="mt-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors">
                  Jelajahi File
                </span>
                <input
                  id="qr-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* TAB 3: SIMULATE / SELECT SANTRI DIRECTLY */}
          {activeTab === 'simulate' && !scannedSantri && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-emerald-600" />
                  Klik salah satu santri untuk simulasi scan QR instan:
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {santriList.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSuccess(s)}
                    className="w-full p-2.5 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-400 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        {s.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <strong className="text-xs text-slate-800 group-hover:text-emerald-950 block truncate font-bold">
                          {s.name}
                        </strong>
                        <span className="text-[11px] text-slate-500 block truncate">
                          NIS: {s.nis} • {s.halaqah}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 text-emerald-700 text-xs font-bold group-hover:translate-x-0.5 transition-transform">
                      <span>Pindai</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer / Fallback Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          {onSkipToManual ? (
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onSkipToManual();
              }}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold hover:underline cursor-pointer"
            >
              Lewati Scan & Pilih Manual
            </button>
          ) : (
            <span></span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer ml-auto"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
