# 📊 InsightIQ — Simulasi & Analisis Perilaku Pengguna Secara Lokal

**InsightIQ** adalah sistem simulasi dan analisis perilaku pengguna berbasis lokal. Dengan menyimpan data event pengguna ke dalam PostgreSQL, aplikasi ini memungkinkan analisis pola interaksi pengguna menggunakan algoritma machine learning tanpa mengirim data ke cloud.

## 🎯 Tujuan Proyek

- Merekam interaksi pengguna: klik, scroll, waktu tinggal, hover.
- Menyimpan semua data perilaku ke PostgreSQL untuk dianalisis.
- Menerapkan analisis clustering (KMeans) untuk menemukan pola pengguna.
- Menyediakan dashboard interaktif untuk analisis visual.

## 🧩 Fitur Utama

- Simulasi perilaku pengguna atau penggunaan real-time.
- Penyimpanan struktur event dan session di PostgreSQL.
- Analisis visual:
  - Heatmap interaksi
  - Segmentasi pengguna
  - Waktu rata-rata per sesi
- Semua berjalan secara lokal dan privat.

## 🛠️ Teknologi yang Digunakan

- Python · pandas · scikit-learn · matplotlib · seaborn
- PostgreSQL (pgAdmin 4) · SQLAlchemy
- Streamlit (untuk dashboard)

## 📌 Mengapa Google Akan Tertarik

InsightIQ mencerminkan alat internal Google yang dipakai untuk mengukur UX dan perilaku pengguna seperti Google Analytics, namun 100% lokal. Proyek ini menunjukkan:

- Integrasi ML dengan observability
- Arsitektur log event + analisis pola
- Visualisasi insight dari data mentah
- Fokus pada keamanan & privasi data
