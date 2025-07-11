# 📊 InsightIQ — Simulasi & Analisis Perilaku Pengguna Secara Lokal

InsightIQ adalah platform untuk memantau dan menganalisis perilaku pengguna di aplikasi, seperti klik, scroll, dan waktu interaksi — semuanya **disimpan secara lokal** di PostgreSQL dan divisualisasikan lewat dashboard interaktif.

---

## 🚀 Fitur Utama

- 🔍 **Tracking Event Klik & Scroll**  
- 📊 **Visualisasi Interaktif Heatmap dan Grafik**  
- 🧠 **Analisis Pola dengan KMeans Clustering**  
- 🛡️ **Privasi Terjaga - Tidak Butuh Cloud!**  
- 📁 **Penyimpanan Lokal via PostgreSQL**

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

![Tampilan Dashboard](images/visual%20hasil%20perilaku.png)

### Script Tracking
![Script Tracking](images/script.png)

---

## 📦 Cara Menjalankan

1. Clone repo ini:
   ```bash
   git clone https://github.com/christia006/InsightIQ.git
   cd InsightIQ
