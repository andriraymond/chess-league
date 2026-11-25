#  CHESS LEAGUE
## Product Requirements, Functional Specification & Development Blueprint

**Versi:** 1.0  
**Status:** Dokumen dasar pengembangan  
**Platform:** Web Application  
**Framework:** Next.js, TypeScript  
**Database:** MongoDB Atlas  
**ORM:** Prisma  
**Deployment:** Vercel

---

# BAGIAN 1. PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1.1. Latar Belakang

 Chess League merupakan sistem pengelolaan kompetisi catur internal kantor yang digunakan untuk mengatur peserta, jadwal pertandingan, hasil pertandingan, klasemen, dan riwayat liga bulanan.

Pertandingan dilakukan secara langsung menggunakan papan catur fisik. Website berfungsi sebagai pusat administrasi dan pencatatan kompetisi, bukan sebagai platform untuk bermain catur secara online.

Sistem dirancang agar setiap bulan dapat memiliki liga tersendiri, dengan data dan riwayat pertandingan yang tetap tersimpan.

## 1.2. Tujuan Sistem

1. Mengelola peserta liga catur kantor.
2. Menghasilkan pasangan pertandingan secara otomatis.
3. Menghindari pertemuan ulang dengan lawan yang pernah dihadapi selama masih tersedia pasangan baru.
4. Mencatat hasil pertandingan menggunakan format BO3.
5. Menghitung poin dan klasemen secara otomatis.
6. Menyimpan riwayat pertandingan setiap bulan.
7. Menyediakan statistik dan Hall of Fame.
8. Memungkinkan beberapa admin mengelola liga sesuai kewenangannya.

## 1.3. Ruang Lingkup

### Fitur utama

- Manajemen akun dan hak akses.
- Manajemen liga bulanan.
- Manajemen peserta.
- Pengacakan jadwal pertandingan.
- Sistem BO3.
- Input hasil setiap game.
- Perhitungan poin otomatis.
- Klasemen.
- Riwayat pertandingan.
- Statistik pemain.
- Hall of Fame.
- Audit log aktivitas admin.

### Di luar ruang lingkup versi pertama

- Bermain catur langsung melalui website.
- Integrasi dengan Chess.com atau Lichess.
- Sistem rating FIDE.
- Turnamen online.
- Sistem taruhan atau hadiah uang.
- Aplikasi mobile native.

---

# BAGIAN 2. ATURAN BISNIS KOMPETISI

## 2.1. Format Pertandingan

Setiap pertandingan menggunakan sistem Best of 3 (BO3).

Pemain yang pertama mendapatkan dua kemenangan dinyatakan sebagai pemenang pertandingan.

Contoh:

| Game | Pemain A | Pemain B |
|---|---|---|
| Game 1 | Menang | Kalah |
| Game 2 | Kalah | Menang |
| Game 3 | Menang | Kalah |

Hasil akhir: Pemain A menang 2–1.

Jika satu game berakhir remis, game tersebut tidak menambah skor kemenangan kedua pemain dan harus dimainkan ulang.

Catatan: Game yang remis tetap dicatat dalam riwayat, tetapi tidak dihitung sebagai kemenangan. Karena itu, jumlah permainan fisik dapat lebih dari tiga.

## 2.2. Sistem Poin

| Hasil pertandingan | Poin |
|---|---:|
| Menang | 2 |
| Kalah | 0 |
| Seri | Tidak tersedia |

Tidak ada tambahan poin berdasarkan kemenangan 2–0 atau 2–1.

Poin hanya diberikan setelah pertandingan dinyatakan selesai.

## 2.3. Sistem Pengacakan Lawan

Sistem harus mengacak pasangan pertandingan pada setiap ronde.

Prioritas pengacakan:

1. Mengutamakan pasangan pemain yang belum pernah bertemu.
2. Mengurangi jumlah pertemuan ulang.
3. Jika harus mengulang, mengutamakan pasangan dengan jumlah pertemuan sebelumnya paling sedikit.
4. Mengusahakan jumlah pertandingan setiap pemain tetap seimbang.
5. Mengacak urutan pasangan yang memiliki prioritas sama.

Sistem tidak boleh memasangkan satu pemain dengan dua lawan dalam ronde yang sama.

## 2.4. Jumlah Peserta

Versi pertama mendukung 5 sampai 10 peserta.

Jika jumlah peserta ganjil, satu pemain mendapatkan bye.

Bye tidak memberikan poin dan tidak dihitung sebagai pertandingan selesai.

Pemain yang mendapatkan bye harus diprioritaskan lebih rendah untuk mendapatkan bye kembali pada ronde berikutnya.

## 2.5. Target Pertandingan

Setiap liga memiliki pengaturan target pertandingan yang dapat ditentukan oleh admin liga.

Contoh:
- Target 6 pertandingan per pemain.
- Target 8 pertandingan per pemain.
- Target 10 pertandingan per pemain.

Target dapat berbeda antar liga.

Rekomendasi awal: gunakan 8 pertandingan per pemain sebagai nilai default, tetapi tetap dapat diubah admin.

Target pertandingan dihitung berdasarkan pertandingan yang telah selesai, bukan jumlah ronde atau jumlah bye.

## 2.6. Penentuan Peringkat

Urutan klasemen menggunakan:

1. Total poin.
2. Rekor pertemuan langsung (head-to-head).
3. Mini-table jika terdapat tiga pemain atau lebih dengan poin sama.
4. Playoff apabila masih seri setelah kriteria sebelumnya.

Catatan: Karena kemenangan bernilai 2 poin dan kekalahan 0 poin, jumlah poin selalu dua kali jumlah kemenangan. Jadi, jumlah kemenangan tidak perlu dijadikan kriteria pemecah seri setelah poin karena hasilnya akan selalu sama.

---

# BAGIAN 3. USER ROLES DAN HAK AKSES

## 3.1. Super Admin

Memiliki akses penuh ke seluruh sistem.

Hak akses:
- Melihat seluruh liga.
- Membuat liga.
- Mengubah dan mengarsipkan liga.
- Menghapus data sesuai kebijakan penghapusan.
- Menyetujui atau menolak pendaftaran admin.
- Menunjuk admin liga.
- Mengelola seluruh akun.
- Mengoreksi hasil pertandingan.
- Melihat audit log.
- Mengelola pengaturan global.

## 3.2. Admin Liga

Admin hanya dapat mengelola liga yang ditugaskan kepadanya.

Hak akses:
- Melihat dashboard liga.
- Mengatur peserta.
- Mengatur target pertandingan.
- Menghasilkan pasangan pertandingan.
- Mengonfirmasi jadwal.
- Menginput hasil BO3.
- Mengubah status pertandingan.
- Melihat klasemen dan statistik.
- Menyelesaikan liga jika memiliki izin.

## 3.3. Pengunjung Publik

Tidak perlu login.

Hak akses:
- Melihat seluruh liga yang telah dipublikasikan.
- Melihat peserta.
- Melihat jadwal.
- Melihat hasil pertandingan.
- Melihat klasemen.
- Melihat riwayat liga.
- Melihat statistik pemain.
- Melihat Hall of Fame.

Pengunjung publik tidak dapat mengubah data apa pun.

## 3.4. Pendaftaran Admin

Pendaftaran akun admin terbuka untuk publik.

Namun:
- Akun baru memiliki status PENDING.
- Akun PENDING tidak dapat mengelola liga.
- Super Admin harus menyetujui pendaftaran.
- Akun yang ditolak tidak mendapatkan hak akses admin.
- Pendaftaran publik tidak boleh memberikan pilihan role Super Admin.

Super Admin pertama dibuat melalui proses bootstrap atau seed database, bukan melalui formulir pendaftaran publik.

---

# BAGIAN 4. FUNCTIONAL SPECIFICATION DOCUMENT (FSD)

## 4.1. Modul Autentikasi

Fitur:
- Register.
- Login.
- Logout.
- Pemeriksaan status akun.
- Persetujuan admin.
- Pengelolaan sesi.

Kondisi:
- Pengguna yang belum login tidak dapat membuka halaman admin.
- Pengguna PENDING tidak dapat mengakses dashboard pengelolaan.
- Admin hanya dapat mengakses liga yang ditugaskan.
- Semua tindakan administratif harus diperiksa di server.

## 4.2. Modul Manajemen Liga

Setiap liga mempunyai:

- Nama liga.
- Slug URL.
- Bulan.
- Tahun.
- Deskripsi.
- Status.
- Target pertandingan.
- Tanggal mulai.
- Tanggal selesai.
- Daftar admin.
- Daftar peserta.

Status liga:

| Status | Keterangan |
|---|---|
| DRAFT | Sedang disiapkan |
| ACTIVE | Sedang berjalan |
| COMPLETED | Kompetisi selesai |
| ARCHIVED | Disimpan sebagai arsip |

Liga yang masih DRAFT tidak ditampilkan kepada publik. Liga yang telah dipublikasikan dapat dilihat oleh pengunjung.

Setiap bulan memiliki data liga sendiri. Data bulan sebelumnya tidak boleh tercampur dengan liga baru.

## 4.3. Modul Peserta

Fitur:
- Tambah peserta.
- Edit nama peserta.
- Nonaktifkan peserta.
- Melihat statistik peserta.
- Melihat riwayat pertandingan peserta.

Identitas pemain tidak harus memiliki akun login.

Satu pemain dapat mengikuti beberapa liga bulanan tanpa harus dibuat ulang sebagai identitas baru.

Peserta yang sudah memiliki riwayat pertandingan tidak boleh dihapus permanen melalui tindakan admin biasa.

## 4.4. Modul Pairing Engine

Fitur:
- Generate ronde.
- Preview pasangan.
- Regenerate pasangan sebelum dikonfirmasi.
- Menampilkan riwayat pertemuan.
- Menampilkan informasi bye.
- Konfirmasi jadwal.

Contoh tampilan preview:

| Pertandingan | Status lawan |
|---|---|
| Andi vs Budi | Belum pernah bertemu |
| Candra vs Dedi | Belum pernah bertemu |
| Eko | Bye |

Sistem harus mengutamakan pasangan baru dan meminimalkan pengulangan secara global, bukan sekadar memasangkan pemain satu per satu secara acak.

Untuk 5 sampai 10 peserta, algoritma pencarian kombinasi dengan backtracking atau bitmask dynamic programming dapat digunakan.

Pairing yang dibuat harus berstatus DRAFT sampai admin mengonfirmasi jadwal.

Setelah dikonfirmasi, sistem tidak boleh mengubah jadwal secara diam-diam.

## 4.5. Modul Pertandingan

Status pertandingan:

| Status | Keterangan |
|---|---|
| SCHEDULED | Menunggu dimainkan |
| IN_PROGRESS | Sedang berlangsung |
| COMPLETED | Selesai |
| CANCELLED | Dibatalkan |

Informasi pertandingan:
- Nama ronde.
- Pemain A.
- Pemain B.
- Skor kemenangan A.
- Skor kemenangan B.
- Detail game.
- Pemenang.
- Waktu selesai.

## 4.6. Modul Input Hasil BO3

Contoh alur:

Admin membuka pertandingan.

Admin memilih hasil Game 1:
- Pemain A menang.
- Pemain B menang.
- Remis.

Jika remis, sistem menyimpan hasil remis dan meminta pencatatan game berikutnya.

Jika salah satu pemain sudah mendapatkan dua kemenangan, sistem:
1. Menentukan pemenang.
2. Mengubah status pertandingan menjadi COMPLETED.
3. Memberikan 2 poin kepada pemenang.
4. Memberikan 0 poin kepada pemain yang kalah.
5. Memperbarui klasemen.
6. Menyimpan waktu penyelesaian pertandingan.

Sistem tidak boleh menerima input game tambahan setelah hasil akhir BO3 tercapai, kecuali melalui mekanisme koreksi admin yang memiliki otorisasi.

## 4.7. Modul Klasemen

Informasi klasemen:

| Kolom | Keterangan |
|---|---|
| Rank | Peringkat |
| Player | Nama pemain |
| Played | Jumlah pertandingan selesai |
| Won | Jumlah menang |
| Lost | Jumlah kalah |
| Points | Total poin |
| Bye | Jumlah bye |

Rumus:

Total pertandingan = Menang + Kalah

Total poin = Menang × 2

Bye tidak masuk dalam total pertandingan dan tidak menghasilkan poin.

Klasemen dihitung dari data pertandingan selesai, bukan dari angka yang diinput manual.

## 4.8. Modul Statistik

Statistik yang direncanakan:

- Total peserta.
- Total pertandingan.
- Total kemenangan.
- Total game remis.
- Pemain dengan kemenangan terbanyak.
- Pemain dengan pertandingan terbanyak.
- Rekor head-to-head.
- Riwayat performa pemain.
- Juara setiap bulan.

## 4.9. Modul Hall of Fame

Hall of Fame berisi:
- Juara liga bulanan.
- Runner-up.
- Jumlah gelar setiap pemain.
- Riwayat pencapaian.
- Statistik karier pemain.

Data Hall of Fame berasal dari liga yang sudah COMPLETED atau ARCHIVED dan memiliki hasil akhir yang sah.

## 4.10. Modul Audit Log

Setiap perubahan penting harus dicatat.

Contoh:
- Admin mengubah hasil pertandingan.
- Admin menambahkan peserta.
- Super Admin menyetujui akun.
- Admin mengonfirmasi ronde.
- Super Admin mengarsipkan liga.

Audit log minimal menyimpan:
- Aktor.
- Waktu.
- Jenis tindakan.
- Data sebelum perubahan.
- Data sesudah perubahan.
- Alasan perubahan jika berkaitan dengan koreksi.

---

# BAGIAN 5. SPESIFIKASI DATABASE

## 5.1. Teknologi

- MongoDB Atlas sebagai database.
- Prisma ORM sebagai lapisan akses database.
- ObjectId sebagai identifier.
- Relasi menggunakan referensi antar koleksi.
- Data game disimpan sebagai embedded array di dokumen pertandingan.

## 5.2. Koleksi Utama

| Collection | Fungsi |
|---|---|
| User | Data akun admin |
| League | Data liga |
| LeagueAdmin | Penugasan admin |
| Player | Identitas pemain |
| LeaguePlayer | Keanggotaan pemain dalam liga |
| Round | Data ronde |
| Match | Pertandingan |
| AuditLog | Riwayat aktivitas |

## 5.3. Hubungan Data

- Satu User dapat menjadi admin di beberapa League.
- Satu League dapat memiliki beberapa admin.
- Satu Player dapat mengikuti beberapa League.
- Satu League memiliki beberapa Round.
- Satu Round memiliki beberapa Match.
- Satu Match memiliki beberapa GameEntry.
- Satu User dapat memiliki beberapa AuditLog.

## 5.4. Konsep Model Prisma

Model utama yang perlu dibangun:

**User**
- id
- name
- email
- passwordHash
- role
- status
- createdAt
- updatedAt

**League**
- id
- name
- slug
- description
- month
- year
- status
- targetMatchesPerPlayer
- startDate
- endDate
- createdAt
- updatedAt

**LeagueAdmin**
- id
- leagueId
- userId
- assignedAt

**Player**
- id
- name
- email
- status
- createdAt
- updatedAt

**LeaguePlayer**
- id
- leagueId
- playerId
- status
- joinedAt
- matchesTarget

**Round**
- id
- leagueId
- roundNumber
- status
- createdAt
- publishedAt

**Match**
- id
- roundId
- playerAId
- playerBId
- status
- scoreA
- scoreB
- winnerPlayerId
- games
- completedAt

**GameEntry**
- gameNumber
- result
- playedAt
- note

GameEntry disimpan sebagai embedded type di dalam Match.

**AuditLog**
- id
- actorId
- leagueId
- action
- entity
- entityId
- oldData
- newData
- reason
- createdAt

Catatan teknis: rancangan ini merupakan model konseptual. Sebelum implementasi, schema.prisma harus divalidasi dengan versi Prisma yang dipilih. MongoDB tidak mendukung semua fitur relasional seperti database SQL. Gunakan unique index yang sesuai dan validasi relasi melalui service layer.

---

# BAGIAN 6. ARSITEKTUR TEKNOLOGI

## 6.1. Stack Utama

| Komponen | Teknologi |
|---|---|
| Frontend | Next.js App Router |
| Bahasa | TypeScript |
| UI | Tailwind CSS |
| Component | shadcn/ui |
| Icon | Lucide |
| Backend | Next.js Server Actions / Route Handlers |
| Authentication | Auth.js Credentials |
| Database | MongoDB Atlas |
| ORM | Prisma |
| Hosting | Vercel |

## 6.2. Struktur URL

**Public**
- /
- /league
- /league/[slug]
- /league/[slug]/standings
- /league/[slug]/players
- /league/[slug]/matches
- /league/[slug]/history
- /league/[slug]/matches/[matchId]

**Authentication**
- /auth/login
- /auth/register

**Admin**
- /admin
- /admin/leagues
- /admin/leagues/[id]
- /admin/leagues/[id]/players
- /admin/leagues/[id]/pairing
- /admin/leagues/[id]/matches
- /admin/leagues/[id]/settings

**Super Admin**
- /super-admin
- /super-admin/users
- /super-admin/leagues
- /super-admin/audit-logs
- /super-admin/settings

## 6.3. Struktur Folder

```text
-chess-league/
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
├── package.json
└── .env
```

---

# BAGIAN 7. ROADMAP PENGEMBANGAN BERTAHAP

Pengembangan dibagi menjadi 8 fase.

## PHASE 1. Project Foundation

Tujuan: Menyiapkan fondasi aplikasi.

Pekerjaan:
- Membuat project Next.js.
- Mengaktifkan TypeScript.
- Menginstal Tailwind CSS.
- Menginstal shadcn/ui.
- Menghubungkan MongoDB Atlas.
- Menginstal dan mengonfigurasi Prisma.
- Membuat struktur folder.
- Menyiapkan environment variables.

Output:
Aplikasi dapat dijalankan dan berhasil terhubung ke database.

Kriteria selesai:
- Homepage dapat dibuka.
- Prisma dapat membaca database.
- Tidak ada error koneksi.
- Environment secret tidak masuk ke repository.

## PHASE 2. Authentication & Authorization

Tujuan: Membuat sistem akun dan hak akses.

Pekerjaan:
- Register.
- Login.
- Logout.
- Status PENDING dan APPROVED.
- Bootstrap Super Admin.
- Dashboard Super Admin.
- Persetujuan akun admin.
- Penugasan admin ke liga.
- Proteksi halaman dan fungsi server.

Output:
Sistem login dan pengelolaan hak akses berfungsi.

Kriteria selesai:
- Pengunjung tidak dapat membuka dashboard admin.
- Akun PENDING tidak dapat mengelola liga.
- Admin tidak dapat mengakses liga yang bukan tanggung jawabnya.
- Pengunjung tidak dapat menaikkan role menjadi Super Admin.

## PHASE 3. League & Player Management

Tujuan: Membuat pengelolaan liga dan peserta.

Pekerjaan:
- Membuat liga.
- Mengatur bulan dan tahun.
- Mengatur target pertandingan.
- Mengubah status liga.
- Menambahkan admin liga.
- Menambah peserta.
- Mengedit peserta.
- Menonaktifkan peserta.
- Menampilkan daftar liga.

Output:
Admin dapat membuat liga bulanan dan mengelola peserta.

Kriteria selesai:
- Satu aplikasi dapat menyimpan banyak liga.
- Pemain dapat mengikuti beberapa liga.
- Data liga tidak tercampur.
- Peserta tidak harus memiliki akun login.

## PHASE 4. Pairing Engine

Tujuan: Menghasilkan jadwal pertandingan otomatis.

Pekerjaan:
- Membuat sistem ronde.
- Membaca riwayat pertemuan.
- Menghasilkan pasangan pemain.
- Meminimalkan rematch.
- Mengatur bye.
- Menampilkan preview.
- Regenerate jadwal.
- Mengonfirmasi jadwal.

Output:
Admin dapat membuat jadwal pertandingan secara otomatis.

Kriteria selesai:
- Tidak ada pemain bertanding dua kali dalam satu ronde.
- Pasangan baru diprioritaskan.
- Rematch diminimalkan.
- Bye dibagikan secara adil.
- Jadwal tidak berubah setelah dikonfirmasi tanpa tindakan resmi.

## PHASE 5. Match & BO3 Result

Tujuan: Membangun pencatatan pertandingan.

Pekerjaan:
- Membuat halaman detail pertandingan.
- Input Game 1.
- Input Game 2.
- Input Game berikutnya jika diperlukan.
- Mencatat game remis.
- Menentukan pemenang otomatis.
- Menyelesaikan pertandingan.
- Mengunci hasil setelah selesai.
- Membuat mekanisme koreksi hasil.

Output:
Admin dapat mencatat pertandingan sampai ditemukan pemenang BO3.

Kriteria selesai:
- Sistem tidak salah menentukan pemenang.
- Game remis tidak menambah skor kemenangan.
- Pemain pertama yang mencapai dua kemenangan dinyatakan menang.
- Pertandingan tidak selesai sebelum ada pemenang.
- Poin tidak diberikan dua kali.

## PHASE 6. Standings & Statistics

Tujuan: Membuat klasemen dan statistik otomatis.

Pekerjaan:
- Menghitung pertandingan selesai.
- Menghitung menang dan kalah.
- Menghitung poin.
- Mengurutkan klasemen.
- Menangani head-to-head.
- Menampilkan statistik pemain.
- Menampilkan riwayat hasil.

Output:
Klasemen otomatis dan statistik liga.

Kriteria selesai:
- Klasemen sesuai seluruh hasil pertandingan.
- Koreksi hasil memperbarui klasemen.
- Bye tidak dihitung sebagai pertandingan.
- Poin hanya berasal dari pertandingan yang selesai.

## PHASE 7. Public Website & Hall of Fame

Tujuan: Menyediakan informasi kompetisi untuk pengunjung.

Pekerjaan:
- Homepage publik.
- Daftar liga.
- Detail liga.
- Klasemen publik.
- Daftar pemain.
- Jadwal dan hasil.
- Riwayat liga.
- Statistik.
- Hall of Fame.

Output:
Website dapat diakses publik tanpa login untuk melihat informasi liga.

Kriteria selesai:
- Semua liga yang telah dipublikasikan dapat dilihat.
- Liga lama tetap dapat diakses.
- Data sensitif akun tidak tampil di halaman publik.
- Tampilan responsif untuk desktop dan mobile.

## PHASE 8. Testing, Security & Deployment

Tujuan: Memastikan aplikasi siap digunakan.

Pekerjaan:
- Pengujian pairing.
- Pengujian BO3.
- Pengujian perhitungan poin.
- Pengujian hak akses.
- Pengujian multi-admin.
- Pengujian audit log.
- Optimasi performa.
- Deployment Vercel.
- Konfigurasi domain.
- Backup database.
- Monitoring error.

Output:
 Chess League siap digunakan secara online.

Kriteria selesai:
- Seluruh pengujian utama berhasil.
- Tidak ada akses ilegal ke fungsi admin.
- Data liga tersimpan secara persisten.
- Website dapat diakses melalui domain publik.

---

# BAGIAN 8. TESTING SCENARIOS

## 8.1. Testing BO3

| Skenario | Hasil yang diharapkan |
|---|---|
| A menang 2–0 | A menang, 2 poin |
| A menang 2–1 | A menang, 2 poin |
| B menang 2–0 | B menang, 2 poin |
| B menang 2–1 | B menang, 2 poin |
| Game remis | Tidak menambah skor kemenangan |
| Skor 1–1 | Pertandingan belum selesai |
| Skor 2–0 | Pertandingan selesai |
| Input setelah selesai | Ditolak kecuali koreksi resmi |

## 8.2. Testing Pairing

| Skenario | Hasil yang diharapkan |
|---|---|
| 6 pemain | 3 pasangan |
| 5 pemain | 2 pasangan dan 1 bye |
| 8 pemain | 4 pasangan |
| 9 pemain | 4 pasangan dan 1 bye |
| Pasangan belum pernah bertemu | Diprioritaskan |
| Semua pasangan sudah pernah bertemu | Rematch dengan frekuensi terendah |
| Pemain mendapatkan bye sebelumnya | Prioritas bye lebih rendah |
| Regenerate sebelum konfirmasi | Jadwal dapat berubah |
| Regenerate setelah konfirmasi | Ditolak tanpa proses resmi |

## 8.3. Testing Klasemen

| Skenario | Hasil yang diharapkan |
|---|---|
| Menang | +2 poin |
| Kalah | 0 poin |
| Pertandingan belum selesai | Tidak masuk poin |
| Bye | Tidak masuk poin |
| Hasil dikoreksi | Klasemen dihitung ulang |
| Pemain tidak aktif | Riwayat lama tetap tersedia |

---

# BAGIAN 9. KEAMANAN DAN INTEGRITAS DATA

1. Password harus disimpan dalam bentuk hash, bukan teks biasa.
2. Seluruh fungsi admin harus melakukan validasi otorisasi di server.
3. Data publik harus menggunakan DTO yang aman.
4. Super Admin pertama dibuat melalui seed atau bootstrap yang aman.
5. Penghapusan peserta yang memiliki riwayat dilakukan dengan soft delete atau penonaktifan.
6. Koreksi hasil wajib memiliki alasan dan audit log.
7. Pembuatan ronde harus mencegah duplikasi ketika dua admin bekerja bersamaan.
8. Operasi multi-dokumen yang membutuhkan konsistensi harus menggunakan mekanisme transaksi MongoDB yang sesuai.
9. Validasi pertandingan harus memastikan kedua pemain berasal dari liga yang sama.
10. Satu pemain tidak boleh muncul dua kali dalam ronde yang sama.

---

# BAGIAN 10. PRIORITAS MVP

MVP adalah versi pertama yang sudah dapat digunakan untuk mengelola kompetisi nyata.

Fitur yang wajib ada sebelum peluncuran:

- Login admin.
- Persetujuan admin.
- Membuat liga.
- Menambahkan peserta.
- Generate pairing.
- Mengonfirmasi jadwal.
- Input hasil BO3.
- Menghitung poin.
- Menampilkan klasemen.
- Menyimpan riwayat pertandingan.
- Halaman publik.
- Database online.

Fitur yang boleh menyusul:

- Hall of Fame lengkap.
- Statistik lanjutan.
- Grafik performa.
- Notifikasi.
- Ekspor PDF.
- Tema tampilan tambahan.
- Integrasi pihak ketiga.

---

# BAGIAN 11. KEPUTUSAN PRODUK YANG SUDAH DISETUJUI

| No. | Keputusan | Status |
|---:|---|---|
| 1 | Pertandingan dilakukan offline | Disepakati |
| 2 | Format pertandingan BO3 | Disepakati |
| 3 | Menang 2 poin | Disepakati |
| 4 | Kalah 0 poin | Disepakati |
| 5 | Game remis dimainkan ulang | Disepakati |
| 6 | Pairing diacak setiap ronde | Disepakati |
| 7 | Menghindari lawan yang pernah ditemui | Disepakati |
| 8 | Peserta awal 5–10 orang | Disepakati |
| 9 | Bye untuk jumlah peserta ganjil | Disepakati |
| 10 | Liga dibuat per bulan | Disepakati |
| 11 | Semua liga yang dipublikasikan dapat dilihat publik | Disepakati |
| 12 | Admin dapat mendaftar, tetapi menunggu persetujuan | Disepakati |
| 13 | Target pertandingan ditentukan admin liga | Disepakati |
| 14 | Database MongoDB Atlas | Disepakati |
| 15 | Framework Next.js | Disepakati |
| 16 | Prisma ORM | Disepakati |
| 17 | Deployment Vercel | Rencana |

---

# BAGIAN 12. SARAN URUTAN IMPLEMENTASI

Jangan mulai dengan membuat semua halaman sekaligus.

Urutan yang disarankan:

1. Selesaikan database dan koneksi MongoDB.
2. Selesaikan autentikasi dan hak akses.
3. Selesaikan manajemen liga dan peserta.
4. Selesaikan algoritma pairing beserta unit test.
5. Selesaikan pencatatan BO3.
6. Selesaikan perhitungan klasemen.
7. Selesaikan halaman publik.
8. Lakukan testing dan deployment.

**Prinsip pengembangan:** setiap fase harus menghasilkan fitur yang dapat diuji sebelum melanjutkan ke fase berikutnya.

**Target akhir:**  Chess League menjadi satu website terpusat untuk mengelola seluruh liga catur bulanan, dengan data yang tersimpan permanen, pairing otomatis, hasil pertandingan akurat, dan klasemen yang selalu diperbarui.