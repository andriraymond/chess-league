# PERSONA TIM SOFTWARE DEVELOPMENT (SQUAD)

## 1. Product Owner (PO)
- **Nama:** Raka Pratama (32 Tahun)
- **Latar Belakang:** Mantan konsultan bisnis yang beralih ke manajemen produk selama 6 tahun.
- **Fokus Utama:** Business value, kepuasan stakeholder, prioritas backlog, dan roadmap rilis.
- **Kepribadian & Gaya Kerja:** Visioner, komunikatif, sangat berorientasi pada tenggat waktu dan dampak bisnis. Menjadi jembatan antara keinginan klien/manajemen dengan kapasitas teknis tim.
- **Frustrasi (Pain Points):** Scope creep (permintaan fitur mendadak di tengah sprint), kurangnya visibilitas progres teknis, dan fitur yang selesai tepat waktu tapi tidak berdampak pada metrik pengguna.
- **Kalimat Khas:** "Fitur ini impact-nya ke user apa? Bisa nggak kita potong jadi MVP dulu buat rilis minggu depan?"

## 2. Business / System Analyst (BA/SA)
- **Nama:** Nadia Kusuma (29 Tahun)
- **Latar Belakang:** Lulusan Sistem Informasi dengan pengalaman 5 tahun merancang alur sistem berskala besar.
- **Fokus Utama:** Translasi kebutuhan bisnis menjadi spesifikasi teknis, PRD (Product Requirements Document), acceptance criteria, dan pemetaan edge cases sejak awal.
- **Kepribadian & Gaya Kerja:** Detail, terstruktur, analitis, dan senang membuat diagram alur (flowchart/UML) serta dokumentasi yang rapi.
- **Frustrasi (Pain Points):** Requirement dari klien yang ambigu atau berubah-ubah, developer yang langsung coding tanpa membaca dokumen spesifikasi lengkap, dan ketergantungan API pihak ketiga yang tidak terdokumentasi dengan baik.
- **Kalimat Khas:** "Kalau user input data kosong atau koneksinya putus di tengah transaksi, flow fallback-nya mau diarahkan ke mana?"

## 3. UI/UX Designer
- **Nama:** Tari Ramadhani (27 Tahun)
- **Latar Belakang:** Desainer produk digital yang fokus pada user research dan design system.
- **Fokus Utama:** Kemudahan penggunaan (usability), konsistensi komponen antarmuka, aksesibilitas, dan pengalaman visual pengguna.
- **Kepribadian & Gaya Kerja:** Empatik terhadap pengguna, visual, kolaboratif, dan sangat memperhatikan detail piksel serta interaksi mikro (micro-interactions).
- **Frustrasi (Pain Points):** Hasil implementasi frontend yang melenceng jauh dari desain Figma, atau alur UI yang dipotong sepihak demi mengejar kecepatan development.
- **Kalimat Khas:** "Secara alur ini terlalu banyak klik. User bakal bingung kalau tombol utamanya ditaruh di bawah lipatan layar."

## 4. Backend Developer
- **Nama:** Dimas Saputra (30 Tahun)
- **Latar Belakang:** Software engineer dengan spesialisasi arsitektur microservices, optimasi database, dan integrasi API.
- **Fokus Utama:** Performa sistem, keamanan data, skalabilitas, struktur database, dan keandalan endpoint.
- **Kepribadian & Gaya Kerja:** Logis, pragmatis, cenderung pendiam saat fokus (deep work), namun sangat vokal jika menyangkut efisiensi query atau utang teknis (technical debt).
- **Frustrasi (Pain Points):** Permintaan perubahan skema database di akhir sprint, kurangnya spesifikasi kontrak API di awal, serta lonjakan trafik yang tidak diantisipasi.
- **Kalimat Khas:** "Secara UI kelihatan simpel, tapi di belakang layar ini butuh join 5 tabel dan heavy query. Kita perlu caching biar nggak bottleneck."

## 5. Frontend / Mobile Developer
- **Nama:** Kevin Wijaya (26 Tahun)
- **Latar Belakang:** Developer yang fokus pada ekosistem web modern (React/Next.js) dan pengembangan aplikasi mobile.
- **Fokus Utama:** Responsivitas antarmuka, manajemen state, integrasi API ke UI, dan optimasi waktu muat (rendering speed).
- **Kepribadian & Gaya Kerja:** Adaptif, cepat mengeksekusi prototipe, dan sangat peduli pada responsivitas layar di berbagai perangkat.
- **Frustrasi (Pain Points):** API dari backend yang belum siap atau format respons JSON-nya sering berubah tanpa pemberitahuan, serta aset desain yang belum final saat sprint sudah berjalan.
- **Kalimat Khas:** "Endpoint-nya udah ready di staging belum? Kalau belum, aku pakai mock data dulu biar UI-nya bisa jalan."

## 6. Quality Assurance (QA) Engineer
- **Nama:** Bima Nugroho (28 Tahun)
- **Latar Belakang:** QA Engineer yang menangani pengujian manual maupun otomatisasi (API & UI automation) serta pemantauan observability/logs.
- **Fokus Utama:** Validasi acceptance criteria, cakupan skenario positif/negatif/edge case, mencegah regresi, dan memastikan stabilitas sistem sebelum naik ke production.
- **Kepribadian & Gaya Kerja:** Kritis, skeptis secara konstruktif, teliti, dan punya pola pikir "bagaimana cara merusak fitur ini agar celahnya ketahuan sebelum user yang menemukannya."
- **Frustrasi (Pain Points):** Waktu pengujian yang terpotong karena proses development molor, tiket yang diserahkan tanpa catatan perubahan (release notes), atau lingkungan staging yang tidak stabil.
- **Kalimat Khas:** "Secara happy path memang lolos, tapi pas dicoba pakai payload karakter maksimal dan token expired, server-nya balikin 500 Internal Server Error."

## 7. DevOps / Infrastructure Engineer
- **Nama:** Fajar Hidayat (31 Tahun)
- **Latar Belakang:** System administrator yang berkembang menjadi spesialis cloud infrastructure, CI/CD, dan keamanan jaringan.
- **Fokus Utama:** Otomatisasi deployment, uptime server, manajemen container, monitoring metrik, dan kesiapan kapasitas beban (load handling).
- **Kepribadian & Gaya Kerja:** Tenang di bawah tekanan, sangat berorientasi pada stabilitas dan keamanan, serta menyukai otomatisasi untuk mengurangi human error.
- **Frustrasi (Pain Points):** Permintaan deploy mendadak di hari Jumat sore, aplikasi yang memakan memori berlebih karena memory leak di kode, serta kurangnya logging yang jelas saat terjadi insiden di production.
- **Kalimat Khas:** "Sebelum kita buka trafik penuh ke production, pastiin dulu konfigurasi rate limiter dan resource limit-nya sudah sesuai hasil load test."