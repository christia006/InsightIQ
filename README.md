# 📊 InsightIQ — Simulasi & Analisis Perilaku Pengguna Secara Lokal

InsightIQ adalah platform untuk memantau dan menganalisis perilaku pengguna di aplikasi, seperti klik, scroll, dan waktu interaksi — semuanya **disimpan secara lokal** di PostgreSQL dan divisualisasikan lewat dashboard interaktif.

![Tampilan Dashboard](images/visual%20hasil%20perilaku.png)

---

## 🚀 Fitur Utama

- 🔍 **Tracking Event Klik & Scroll**  
- 📊 **Visualisasi Interaktif Heatmap dan Grafik**  
- 🧠 **Analisis Pola dengan KMeans Clustering**  
- 🛡️ **Privasi Terjaga - Tidak Butuh Cloud!**  
- 📁 **Penyimpanan Lokal via PostgreSQL**

---

## 🎯 Contoh Kasus Nyata 

| **Domain**       | **Studi Kasus**                                                                 | **Solusi dengan InsightIQ**                                                                                          |
|------------------|----------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| **E-commerce**   | Mengetahui bagian halaman mana yang paling sering diklik atau diabaikan         | Sistem mencatat event klik dan scroll, lalu divisualisasikan sebagai heatmap interaktif untuk optimasi desain UI/UX. |
| **EdTech**       | Melacak durasi belajar siswa dan interaksi dengan materi pelajaran               | InsightIQ menyimpan data interaksi siswa (durasi, klik modul, ujian), lalu mengelompokkan siswa berdasarkan pola belajar. |
| **SaaS Produk**  | Mengidentifikasi fitur yang sering digunakan vs yang jarang digunakan            | Event log dianalisis dan diklaster menggunakan algoritma KMeans; hasil segmentasi ditampilkan dalam dashboard lokal. |
| **Perbankan**    | Mendeteksi pola interaksi nasabah saat menggunakan aplikasi mobile banking       | Event scroll dan klik pada fitur transaksi disimpan secara lokal untuk analisis preferensi pengguna yang aman.      |
| **Kesehatan**    | Menilai keterlibatan pasien dalam platform manajemen penyakit kronis             | Sistem mencatat interaksi pasien dengan dashboard kesehatan dan notifikasi, kemudian menganalisis tren keterlibatan tanpa cloud. |
| **Pemerintahan** | Melacak interaksi warga dengan portal layanan publik secara anonim dan aman     | Event tracking dilakukan secara lokal untuk memastikan privasi data sesuai kebijakan, dan hasil divisualisasikan di sistem lokal. |

---

## 🛠 Teknologi yang Dipakai

- **Python** (event handler & preprocessing)
- **pandas**, **scikit-learn**, **matplotlib** (analisis & visualisasi)
- **PostgreSQL** (penyimpanan data event)
- **Streamlit** (dashboard interaktif)
- **JavaScript** (`script.js` untuk menangkap event klik/scroll)

---

## 📂 Struktur Gambar

| Nama File Gambar                | Keterangan                                  |
|-------------------------------|---------------------------------------------|
| `input tampilan.png`          | Ilustrasi tampilan awal aplikasi            |
| `script.png`                  | Cuplikan kode tracking JavaScript           |
| `visual hasil perilaku.png`   | Contoh hasil visualisasi dari InsightIQ     |

---

## 📸 Tampilan Tambahan

### Input Halaman
![Input Halaman](images/input%20tampilan.png)

### Script Tracking
![Script Tracking](images/script.png)

---

## 📦 Cara Menjalankan

1. Clone repo ini:
   ```bash
   git clone https://github.com/christia006/InsightIQ.git
   cd InsightIQ
