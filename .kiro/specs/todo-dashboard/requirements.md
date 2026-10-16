# Requirements – To-Do List Life Dashboard

## Overview

Sebuah halaman web satu-file (single-page) berbasis HTML, CSS, dan vanilla JavaScript
yang berfungsi sebagai dasbor kehidupan harian. Pengguna dapat memantau waktu,
mengelola tugas, menjalankan timer fokus, dan menyimpan tautan favorit — semua tanpa
server atau framework eksternal.

---

## Constraints (Batasan Teknis)

| ID  | Constraint |
|-----|-----------|
| TC-1 | Hanya menggunakan HTML, CSS, dan vanilla JavaScript. |
| TC-2 | Tidak boleh menggunakan React, Vue, Angular, atau framework JS/CSS lainnya. |
| TC-3 | Tidak boleh menggunakan backend atau database server. |
| TC-4 | Semua data persisten disimpan di **browser LocalStorage**. |
| TC-5 | Harus berjalan di browser modern (Chrome, Firefox, Edge, Safari terbaru). |
| TC-6 | Struktur file: `index.html`, `css/style.css`, `js/script.js`. |

---

## Functional Requirements (Kebutuhan Fungsional)

### FR-1 · Tanggal & Waktu Live
- **FR-1.1** Menampilkan tanggal lengkap (nama hari, nama bulan, tanggal, tahun).
- **FR-1.2** Menampilkan waktu saat ini dalam format jam:menit:detik + AM/PM.
- **FR-1.3** Jam diperbarui setiap detik secara otomatis tanpa reload halaman.

### FR-2 · Sapaan Berdasarkan Waktu
- **FR-2.1** Menampilkan sapaan yang berubah sesuai jam:
  - 05.00–11.59 → "Good morning"
  - 12.00–16.59 → "Good afternoon"
  - 17.00–20.59 → "Good evening"
  - 21.00–04.59 → "Good night"
- **FR-2.2** Sapaan diperbarui otomatis bersamaan dengan jam.

### FR-3 · Focus Timer (25 Menit)
- **FR-3.1** Menampilkan countdown bertuliskan `MM:SS`, diawali `25:00`.
- **FR-3.2** Tombol **Start** memulai hitungan mundur.
- **FR-3.3** Tombol **Stop** menjeda timer; timer dapat dilanjutkan kembali.
- **FR-3.4** Tombol **Reset** mengembalikan timer ke `25:00`.
- **FR-3.5** Saat timer mencapai `00:00`, tampilkan pesan selesai dan nonaktifkan tombol Start/Stop.
- **FR-3.6** Warna display berubah sesuai status: default / berjalan / dijeda / selesai.

### FR-4 · To-Do List
- **FR-4.1** Pengguna dapat **menambah** tugas melalui input teks + tombol Add (atau tekan Enter).
- **FR-4.2** Pengguna dapat **mengedit** teks tugas melalui modal dialog.
- **FR-4.3** Pengguna dapat **menandai selesai** (done) tugas melalui checkbox; teks dicoret.
- **FR-4.4** Pengguna dapat **menghapus** tugas.
- **FR-4.5** Tersedia **filter tab** untuk menampilkan: All / Active / Done.
- **FR-4.6** Menampilkan ringkasan jumlah tugas (aktif · selesai · total).
- **FR-4.7** Tugas disimpan ke LocalStorage; tetap ada setelah halaman di-refresh.

### FR-5 · Quick Links
- **FR-5.1** Pengguna dapat menambah tautan dengan **nama** dan **URL**.
- **FR-5.2** URL yang tidak diawali `http://` atau `https://` otomatis ditambahkan `https://`.
- **FR-5.3** Tautan tampil sebagai chip/badge yang dapat diklik; terbuka di tab baru.
- **FR-5.4** Pengguna dapat **menghapus** tautan.
- **FR-5.5** Tautan disimpan ke LocalStorage.

---

## Challenge Requirements (Tantangan Tambahan)

### CH-1 · Light/Dark Mode
- **CH-1.1** Tersedia tombol toggle di header untuk berpindah tema terang/gelap.
- **CH-1.2** Ikon tombol berubah (🌙 / ☀️) sesuai tema aktif.
- **CH-1.3** Pilihan tema disimpan ke LocalStorage dan dimuat ulang saat halaman dibuka.

### CH-2 · Custom Name pada Sapaan
- **CH-2.1** Tersedia input teks untuk memasukkan nama pengguna.
- **CH-2.2** Nama tampil dalam sapaan: "Good morning, [Nama]! 👋"
- **CH-2.3** Nama disimpan ke LocalStorage dan dimuat ulang saat halaman dibuka.

### CH-3 · Pencegahan Tugas Duplikat
- **CH-3.1** Saat menambah tugas baru, sistem memeriksa apakah teks yang sama sudah ada (case-insensitive).
- **CH-3.2** Saat mengedit tugas, sistem memeriksa duplikat terhadap tugas lain (mengecualikan tugas yang sedang diedit).
- **CH-3.3** Jika duplikat terdeteksi, tampilkan pesan peringatan dan batalkan penambahan/penyimpanan.

---

## Non-Functional Requirements (Kebutuhan Non-Fungsional)

| ID    | Requirement |
|-------|-------------|
| NFR-1 | **Responsif**: Tampilan menyesuaikan layar desktop (≥769px) dan mobile (≤768px). |
| NFR-2 | **Aksesibilitas**: Elemen interaktif memiliki atribut `aria-label`; modal menggunakan `role="dialog"` dan `aria-modal`. |
| NFR-3 | **Keamanan**: Teks yang dimasukkan pengguna di-escape sebelum dimasukkan ke DOM (`escapeHtml`). |
| NFR-4 | **Kode bersih**: Komentar bagian tersedia; nama variabel dan fungsi deskriptif. |
| NFR-5 | **Tanpa dependensi eksternal**: Tidak ada CDN, tidak ada npm package. |
