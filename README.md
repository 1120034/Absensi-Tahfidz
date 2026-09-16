# Jurnal Tahfidz Santri 📖✨

Aplikasi manajemen dan mutaba'ah hafalan Al-Qur'an terintegrasi dengan pemindaian QR Code santri, kartu identitas cetak, pelaporan WhatsApp otomatis ke wali santri, rapor capaian 30 juz, serta pencadangan cloud Google Sheets.

---

## 🚀 Panduan Deploy ke GitHub Pages (Gratis & Otomatis)

Proyek ini sudah dilengkapi dengan konfigurasi **GitHub Actions** (`.github/workflows/deploy.yml`) dan path relatif Vite (`base: './'`), sehingga dapat langsung di-deploy secara gratis ke GitHub Pages.

### Langkah 1: Export / Hubungkan ke GitHub
1. Di pojok kanan atas Google AI Studio, klik menu pengaturan atau tombol **Export** / **Share**.
2. Pilih opsi **Export to GitHub** (atau unduh sebagai ZIP lalu `git push` ke repositori GitHub baru Anda).
3. Buat repositori baru di akun GitHub Anda (misal: `jurnal-tahfidz`).

### Langkah 2: Aktifkan GitHub Pages di Repository GitHub Anda
1. Buka repositori Anda di **GitHub**.
2. Klik tab **Settings** (Pengaturan Repositori) di bagian atas.
3. Di menu sebelah kiri, klik **Pages**.
4. Di bagian **Build and deployment** -> **Source**, ubah dari *Deploy from a branch* menjadi:
   👉 **GitHub Actions**
5. Selesai! GitHub Actions akan secara otomatis menjalankan proses build dan mempublikasikan aplikasi ke alamat:
   `https://<username-github>.github.io/<nama-repo>/`

---

## ⚡ Alternatif Deploy: Vercel / Netlify (30 Detik)

Jika Anda ingin menggunakan penyedia hosting seperti **Vercel** atau **Netlify**:
1. Buka [vercel.com](https://vercel.com) atau [netlify.com](https://netlify.com).
2. Login dengan akun GitHub Anda.
3. Klik **Add New Project** -> **Import Git Repository**.
4. Pilih repositori `jurnal-tahfidz`.
5. Pengaturan build otomatis terdeteksi:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Klik **Deploy**. Aplikasi akan langsung online dengan domain HTTPS gratis (contoh: `jurnal-tahfidz.vercel.app`).

---

## 💻 Menjalankan di Komputer Lokal

```bash
# 1. Clone repositori
git clone https://github.com/<username>/<nama-repo>.git
cd <nama-repo>

# 2. Pasang dependensi
npm install

# 3. Jalankan server lokal
npm run dev

# 4. Buka di browser:
# http://localhost:3000
```

---

## 🌟 Fitur Utama

- **Pindai QR Santri Instan**: Deteksi otomatis santri via kamera live atau unggah foto untuk input setoran cepat.
- **Kartu Identitas QR Santri**: Tampilan kartu santri siap cetak dan unduh sebagai kartu pengenal fisik.
- **Evaluasi 3 Dimensi**: Penilaian makhraj, tajwid, dan kelancaran dengan kalkulasi otomatis.
- **Notifikasi WhatsApp Wali Santri**: Pesan laporan hasil setoran siap kirim sekali klik ke orang tua/wali.
- **Peta Capaian 30 Juz & Rapor Digital**: Ringkasan mutqin juz per juz lengkap dengan legalisir musyrif.
- **Integrasi Google Sheets & Drive**: Backup cloud dua arah otomatis dan rekap data real-time.
