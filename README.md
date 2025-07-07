# 📊 InsightIQ — Simulasi & Analisis Perilaku Pengguna Secara Lokal

**InsightIQ** bantu kamu memantau dan menganalisis perilaku pengguna di aplikasi, seperti klik, scroll, waktu interaksi, dan lain-lain. Semua data disimpan lokal di PostgreSQL, dan bisa divisualisasikan lewat dashboard.

## 🔧 Fungsinya Apa Aja?

- Simulasi interaksi pengguna (atau bisa juga pakai data nyata).
- Catat event ke PostgreSQL: klik, hover, waktu tinggal, dst.
- Analisa data: clustering pakai KMeans, segmentasi pengguna.
- Dashboard visual (Streamlit) buat lihat grafik & statistik.

## 🛠 Teknologi yang Dipakai

- Python · scikit-learn · pandas · matplotlib
- PostgreSQL (via pgAdmin 4)
- Streamlit buat tampilannya

## 💡 Cocok Buat Apa?

InsightIQ cocok untuk developer dan UX designer yang mau tauu gimana pengguna pakai aplikasi — tapi tanpa ngirim data ke server mana pun. Semua tetap di laptop kamu, tapi tetap powerful buat analisis. Konsepnya mirip alat analitik internal yang biasa dipakai tim produk besar.
