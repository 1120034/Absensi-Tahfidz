import React, { useState } from 'react';
import { Santri, JuzStatus } from '../types';
import { X, UserPlus, Save } from 'lucide-react';

interface AddSantriModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (santri: Santri) => void;
  existingSantri?: Santri | null;
}

export const AddSantriModal: React.FC<AddSantriModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingSantri,
}) => {
  const [name, setName] = useState(existingSantri?.name || '');
  const [nis, setNis] = useState(existingSantri?.nis || `TH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`);
  const [gender, setGender] = useState<'L' | 'P'>(existingSantri?.gender || 'L');
  const [halaqah, setHalaqah] = useState(existingSantri?.halaqah || "Halaqah Imam 'Ashim");
  const [targetJuz, setTargetJuz] = useState(existingSantri?.targetJuz || 10);
  const [guardianName, setGuardianName] = useState(existingSantri?.guardianName || '');
  const [guardianPhone, setGuardianPhone] = useState(existingSantri?.guardianPhone || '628');
  const [ustadzName, setUstadzName] = useState(existingSantri?.ustadzName || 'Ustadz Abdullah Robbani, Lc.');
  const [notes, setNotes] = useState(existingSantri?.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emptyMap: Record<number, JuzStatus> = {};
    for (let i = 1; i <= 30; i++) emptyMap[i] = 'belum';

    const newSantri: Santri = {
      id: existingSantri?.id || `santri-${Date.now()}`,
      nis: nis.trim(),
      name: name.trim(),
      gender,
      halaqah,
      targetJuz: Number(targetJuz),
      totalMutqinJuz: existingSantri?.totalMutqinJuz || 0,
      juzStatusMap: existingSantri?.juzStatusMap || emptyMap,
      currentSurah: existingSantri?.currentSurah || 'Al-Fatihah',
      currentAyah: existingSantri?.currentAyah || 1,
      guardianName: guardianName.trim(),
      guardianPhone: guardianPhone.trim(),
      ustadzName: ustadzName.trim(),
      avatarColor: existingSantri?.avatarColor || (gender === 'L' ? 'bg-emerald-600' : 'bg-teal-600'),
      joinedDate: existingSantri?.joinedDate || new Date().toISOString().split('T')[0],
      notes: notes.trim(),
    };

    onSave(newSantri);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in duration-200">
        <div className="bg-emerald-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-200" />
            <h2 className="text-lg font-bold">
              {existingSantri ? 'Edit Data Santri' : 'Tambah Santri Baru'}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NIS (Nomor Induk)</label>
              <input
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              >
                <option value="L">Ikhwan (Laki-laki)</option>
                <option value="P">Akhwat (Perempuan)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Santri</label>
            <input
              type="text"
              placeholder="Contoh: Muhammad Ihsan Pratama"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Halaqah / Kelompok</label>
              <input
                type="text"
                value={halaqah}
                onChange={(e) => setHalaqah(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Hafalan (Juz)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={targetJuz}
                onChange={(e) => setTargetJuz(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ustadz / Musyrif Pengampu</label>
            <input
              type="text"
              value={ustadzName}
              onChange={(e) => setUstadzName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Wali Santri</label>
              <input
                type="text"
                placeholder="Bapak / Ibu ..."
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp Wali</label>
              <input
                type="text"
                placeholder="628123456789"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan kepribadian santri, riwayat hafalan sebelumnya, dll..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Simpan Data Santri
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
