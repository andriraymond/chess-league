# ♟️ Chess League

Sistem pengelolaan kompetisi catur internal kantor. Website berfungsi sebagai pusat administrasi dan pencatatan kompetisi — bukan platform bermain catur online.

**Stack:** Next.js · TypeScript · Tailwind CSS · shadcn/ui · Prisma · MongoDB Atlas · Vercel

---

## 📋 Development Progress

### PHASE 1 — Project Foundation ✅
> Tujuan: Menyiapkan fondasi aplikasi.

- [x] Membuat project Next.js dengan TypeScript
- [x] Menginstal Tailwind CSS
- [x] Menginstal shadcn/ui
- [x] Membuat struktur folder sesuai arsitektur
- [x] Menyiapkan environment variables (`.env.example`)
- [x] Menginstal dan mengonfigurasi Prisma
- [x] Mendefinisikan Prisma schema (User, League, Player, Round, Match, AuditLog)
- [x] Menyiapkan Prisma client singleton
- [x] Seed Super Admin pertama
- [x] TypeScript check: 0 error
- [x] Menghubungkan ke MongoDB Atlas (`DATABASE_URL` di `.env`)
- [x] Verifikasi koneksi database berhasil (`npx prisma db push`)

**Kriteria selesai:**
- [x] Semua file struktur siap
- [x] Prisma schema selesai & client di-generate
- [x] TypeScript valid (0 error)
- [x] Environment secret tidak masuk ke repository (.env.example saja)
- [x] Homepage dapat dibuka
- [x] Prisma dapat membaca database

---

### PHASE 2 — Authentication & Authorization ✅
> Tujuan: Membuat sistem akun dan hak akses.

- [x] Halaman Register
- [x] Halaman Login
- [x] Logout
- [x] Status akun PENDING dan APPROVED
- [x] Bootstrap Super Admin (`prisma/seed.ts`)
- [x] Dashboard Super Admin
- [x] Persetujuan akun admin (`/super-admin/users`)
- [x] Penugasan admin ke liga
- [x] Proteksi halaman dan fungsi server (`middleware.ts` + `permissions.ts`)

**Kriteria selesai:**
- [x] Pengunjung tidak dapat membuka dashboard admin
- [x] Akun PENDING tidak dapat mengelola liga
- [x] Admin tidak dapat mengakses liga yang bukan tanggung jawabnya
- [x] Pengunjung tidak dapat menaikkan role menjadi Super Admin

---

### PHASE 3 — League & Player Management ✅
> Tujuan: Membuat pengelolaan liga dan peserta.

- [x] Membuat liga
- [x] Mengatur bulan dan tahun
- [x] Mengatur target pertandingan
- [x] Mengubah status liga (DRAFT → ACTIVE / In Progress → COMPLETED → ARCHIVED)
- [x] Menambahkan admin liga
- [x] Menambah peserta
- [x] Mengedit peserta
- [x] Menonaktifkan peserta
- [x] Menampilkan daftar liga

**Kriteria selesai:**
- [x] Satu aplikasi dapat menyimpan banyak liga
- [x] Pemain dapat mengikuti beberapa liga
- [x] Data liga tidak tercampur
- [x] Peserta tidak harus memiliki akun login

---

### PHASE 4 — Pairing Engine ✅
> Tujuan: Menghasilkan jadwal pertandingan otomatis.

- [x] Membuat sistem ronde
- [x] Membaca riwayat pertemuan
- [x] Menghasilkan pasangan pemain (backtracking)
- [x] Meminimalkan rematch
- [x] Mengatur bye (peserta ganjil)
- [x] Menampilkan preview pasangan
- [x] Regenerate jadwal sebelum dikonfirmasi
- [x] Konfirmasi jadwal
- [x] Hapus ronde (beserta match di dalamnya)

**Kriteria selesai:**
- [x] Tidak ada pemain bertanding dua kali dalam satu ronde
- [x] Pasangan baru diprioritaskan
- [x] Rematch diminimalkan
- [x] Bye dibagikan secara adil
- [x] Jadwal tidak berubah setelah dikonfirmasi tanpa tindakan resmi

---

### PHASE 5 — Match & BO3 Result ✅
> Tujuan: Membangun pencatatan pertandingan.

- [x] Halaman detail pertandingan
- [x] Input Game 1, 2, dst.
- [x] Mencatat game remis
- [x] Menentukan pemenang otomatis (BO3: pertama capai 2 kemenangan)
- [x] Menyelesaikan pertandingan dan mengunci hasil
- [x] Mekanisme koreksi hasil oleh admin berotorisasi

**Kriteria selesai:**
- [x] Sistem tidak salah menentukan pemenang
- [x] Game remis tidak menambah skor kemenangan
- [x] Pemain pertama capai 2 kemenangan dinyatakan menang
- [x] Poin tidak diberikan dua kali

---

### PHASE 6 — Standings & Statistics ✅
> Tujuan: Membuat klasemen dan statistik otomatis.

- [x] Menghitung pertandingan selesai
- [x] Menghitung menang, kalah, poin
- [x] Mengurutkan klasemen (poin → head-to-head)
- [x] Statistik pemain & liga
- [x] Riwayat hasil

**Kriteria selesai:**
- [x] Klasemen sesuai seluruh hasil pertandingan
- [x] Koreksi hasil memperbarui klasemen
- [x] Bye tidak dihitung sebagai pertandingan
- [x] Poin hanya berasal dari pertandingan selesai

---

### PHASE 7 — Public Website & Hall of Fame ✅
> Tujuan: Menyediakan informasi kompetisi untuk pengunjung.

- [x] Homepage publik
- [x] Daftar liga publik (`/league`)
- [x] Detail liga, klasemen, pemain, jadwal (`/league/[slug]`)
- [x] Riwayat liga (`/league/[slug]/history`)
- [x] Statistik
- [x] Hall of Fame (`/hall-of-fame` — juara bulanan, runner-up, statistik karier)

**Kriteria selesai:**
- [x] Semua liga yang dipublikasikan dapat dilihat tanpa login
- [x] Liga lama tetap dapat diakses
- [x] Data sensitif akun tidak tampil di halaman publik
- [x] Tampilan responsif untuk desktop dan mobile

---

### PHASE 8 — Testing, Security & Deployment
> Tujuan: Memastikan aplikasi siap digunakan.

- [x] Unit test pairing engine (`tests/pairing.test.ts` — 6/6 pass)
- [x] Verifikasi production build (`npm run build` — 26 route sukses, 0 error)
- [x] Pengujian hak akses dan proteksi server (`middleware.ts` + `permissions.ts`)
- [ ] Pengujian BO3, perhitungan poin, multi-admin, audit log end-to-end
- [ ] Deployment ke Vercel
- [ ] Konfigurasi domain
- [ ] Backup database dan monitoring error

**Kriteria selesai:**
- [x] Unit test pairing & production build berhasil
- [x] Tidak ada akses ilegal ke fungsi admin
- [x] Data liga tersimpan secara persisten di MongoDB Atlas
- [ ] Website dapat diakses melalui domain publik

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy env variables
cp .env.example .env
# → isi DATABASE_URL dan AUTH_SECRET di .env

# Push schema ke database
npx prisma db push

# Seed Super Admin pertama
npm run prisma:seed

# Jalankan development server
npm run dev
```

## 🗂️ Struktur Folder

```
chess-league/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   ├── (auth)/
│   │   ├── admin/
│   │   ├── super-admin/
│   │   └── api/
│   ├── components/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   ├── permissions.ts
│   │   └── validations/
│   ├── services/
│   │   ├── league.service.ts
│   │   ├── player.service.ts
│   │   ├── pairing.service.ts
│   │   ├── match.service.ts
│   │   ├── standings.service.ts
│   │   └── audit.service.ts
│   └── types/
├── tests/
├── public/
├── .env.example
└── package.json
```
