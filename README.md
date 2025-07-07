# 📊 InsightIQ — Simulasi & Analisis Perilaku Pengguna Secara Lokal

**InsightIQ** bantu kamu memantau dan menganalisis perilaku pengguna di aplikasi, seperti klik, scroll, waktu interaksi, dan lain-lain. Semua data disimpan lokal di PostgreSQL, dan bisa divisualisasikan lewat dashboard.

---
## 🎯 Contoh Kasus Nyata 

| **Domain**       | **Studi Kasus**                                                                 | **Solusi dengan nsightIQ**                                                                                          |
|------------------|----------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| **E-commerce**   | Mengetahui bagian halaman mana yang paling sering diklik atau diabaikan         | Sistem mencatat event klik dan scroll, lalu divisualisasikan sebagai heatmap interaktif untuk optimasi desain UI/UX. |
| **EdTech**       | Melacak durasi belajar siswa dan interaksi dengan materi pelajaran               | `nsightIQ` menyimpan data interaksi siswa (durasi, klik modul, ujian), lalu mengelompokkan siswa berdasarkan pola belajar. |
| **SaaS Produk**  | Mengidentifikasi fitur yang sering digunakan vs yang jarang digunakan            | Event log dianalisis dan diklaster menggunakan algoritma KMeans; hasil segmentasi ditampilkan dalam dashboard lokal. |
| **Perbankan**    | Mendeteksi pola interaksi nasabah saat menggunakan aplikasi mobile banking       | Event scroll dan klik pada fitur transaksi disimpan secara lokal untuk analisis preferensi pengguna yang aman.      |
| **Kesehatan**    | Menilai keterlibatan pasien dalam platform manajemen penyakit kronis             | Sistem mencatat interaksi pasien dengan dashboard kesehatan dan notifikasi, kemudian menganalisis tren keterlibatan tanpa cloud. |
| **Pemerintahan** | Melacak interaksi warga dengan portal layanan publik secara anonim dan aman     | Event tracking dilakukan secara lokal untuk memastikan privasi data sesuai kebijakan, dan hasil divisualisasikan di sistem lokal. |


---

## 🛠 Teknologi yang Dipakai

- Python · scikit-learn · pandas · matplotlib
- PostgreSQL (via pgAdmin 4)
- Streamlit buat tampilannya

## 💡 Cocok Buat Apa?

InsightIQ cocok untuk developer dan UX designer yang mau tauu gimana pengguna pakai aplikasi — tapi tanpa ngirim data ke server mana pun. Semua tetap di laptop kamu, tapi tetap powerful buat analisis. Konsepnya mirip alat analitik internal yang biasa dipakai tim produk besar.
