# Design – To-Do List Life Dashboard

## 1. Arsitektur Umum

Aplikasi ini adalah **Single-Page Application (SPA) statis** tanpa proses build.
Semua logika berjalan di sisi klien (browser).

```
Browser
  └── index.html          ← struktur halaman & elemen HTML
        ├── css/style.css ← seluruh gaya visual (CSS custom properties)
        └── js/script.js  ← seluruh logika aplikasi (vanilla JS)
                └── LocalStorage (API browser bawaan)
```

Tidak ada server, tidak ada bundler, tidak ada dependensi eksternal.

---

## 2. Struktur File

```
LifeDashboard/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── .kiro/
│   ├── README.md
│   └── specs/
│       └── todo-dashboard/
│           ├── requirements.md  ← kebutuhan fungsional & non-fungsional
│           ├── design.md        ← dokumen ini
│           └── tasks.md         ← daftar tugas implementasi
└── README.md
```

---

## 3. Layout & UI

### 3.1 Header (sticky)
```
┌─────────────────────────────────────────────┐
│  🗂️ Life Dashboard              [🌙 toggle] │
└─────────────────────────────────────────────┘
```
- Posisi `sticky top: 0` agar selalu terlihat saat scroll.
- Tombol toggle tema di sisi kanan.

### 3.2 Main Grid (2 kolom desktop, 1 kolom mobile)
```
┌──────────────────────────────────────────────────┐
│  CARD: Tanggal & Waktu + Sapaan   [span 2 col]   │
├──────────────────────┬───────────────────────────┤
│  CARD: Focus Timer   │  CARD: To-Do List [tall]  │
│                      │                           │
├──────────────────────┤                           │
│  CARD: Quick Links   │                           │
└──────────────────────┴───────────────────────────┘
```
> Pada mobile semua card menjadi 1 kolom penuh.

### 3.3 Edit Task Modal
- Overlay dengan backdrop blur.
- Box terpusat, animasi `scale` saat muncul.
- Dapat ditutup dengan tombol Cancel, klik backdrop, atau tekan `Escape`.

---

## 4. Sistem Tema (CSS Custom Properties)

Semua token warna didefinisikan di `:root` (tema terang) dan di-override di
`[data-theme="dark"]` pada elemen `<html>`.

| Token | Light | Dark |
|---|---|---|
| `--bg-page` | `#f0f4ff` | `#0f1117` |
| `--bg-card` | `#ffffff` | `#1a1d2e` |
| `--text-primary` | `#1a1d2e` | `#e8eaf6` |
| `--accent` | `#4f6ef7` | `#6b84ff` |
| `--success` | `#22c55e` | `#4ade80` |
| `--danger` | `#ef4444` | `#f87171` |

Transisi warna menggunakan `transition: .2s ease` pada `body` agar perpindahan tema terasa halus.

---

## 5. Desain Komponen

### 5.1 Tombol (`.btn`)
Sistem tombol berbasis kelas modifier:

| Kelas | Warna | Kegunaan |
|---|---|---|
| `.btn--primary` | Biru (accent) | Add task, Save name, Add link |
| `.btn--success` | Hijau | Timer Start |
| `.btn--warning` | Kuning | Timer Stop |
| `.btn--danger`  | Merah | Timer Reset |
| `.btn--ghost`   | Transparan | Cancel di modal |
| `.btn--icon`    | Transparan | Toggle tema di header |
| `.btn--sm`      | Modifier ukuran kecil | Save name |

### 5.2 Input (`.input`)
- Border berubah warna saat fokus (`--accent`) dengan ring shadow.
- Background menggunakan `--bg-input` agar tetap terbaca di kedua tema.

### 5.3 Task Item (`.task-item`)
```
[ ☐ ] Teks tugas                      [✏️ Edit] [🗑️ Delete]
```
- Animasi `slideIn` saat pertama kali ditambahkan.
- Status `done`: opacity dikurangi, teks dicoret, checkbox berubah hijau.

### 5.4 Link Chip (`.link-chip`)
```
[ 🔗 Nama Link  ✕ ]
```
- Tampil sebagai pill berbentuk bulat.
- Hover: background berubah ke warna accent, teks putih.

---

## 6. Alur Data (Data Flow)

### LocalStorage Keys

| Key | Tipe | Deskripsi |
|---|---|---|
| `tasks` | `Array<{id, text, done}>` | Daftar semua tugas |
| `quickLinks` | `Array<{id, name, url}>` | Daftar quick links |
| `userName` | `string` | Nama pengguna untuk sapaan |
| `theme` | `'light' \| 'dark'` | Preferensi tema |

### Alur Tambah Tugas
```
User ketik → tekan Enter/klik Add
  → trim & validasi (tidak kosong)
  → isDuplicate()? → tampilkan warning, stop
  → push ke array tasks
  → saveTasks() → lsSet('tasks', tasks)
  → renderTasks()
```

### Alur Toggle Tema
```
User klik toggle
  → baca currentTheme
  → set atribut data-theme pada <html>
  → update ikon tombol
  → lsSet('theme', newTheme)
```

---

## 7. Logika Timer

```
State: timerSeconds = 1500 (25 × 60)
       timerIsRunning = false
       timerInterval = null

Start → setInterval(timerTick, 1000)
         timerTick: timerSeconds-- → renderTimer()
         jika timerSeconds === 0 → clearInterval → status "selesai"

Stop  → clearInterval → timerIsRunning = false

Reset → clearInterval → timerSeconds = 1500 → renderTimer()
```

---

## 8. Keamanan & Validasi

| Aspek | Implementasi |
|---|---|
| XSS prevention | Semua teks dari pengguna melewati `escapeHtml()` sebelum disisipkan ke `innerHTML` |
| URL validation | Fungsi `isValidUrl()` menggunakan `new URL()` dan memeriksa protokol `http/https` |
| Input length | Atribut `maxlength` di HTML membatasi panjang input |
| Duplicate check | `normalizeText()` melakukan trim + lowercase sebelum membandingkan |

---

## 9. Responsivitas

| Breakpoint | Layout |
|---|---|
| ≥ 769px (desktop) | Grid 2 kolom; card datetime & todo span full-width |
| ≤ 768px (tablet/mobile) | Grid 1 kolom; semua card penuh |
| ≤ 400px (small phone) | Font timer & jam diperkecil; filter tabs wrap |
