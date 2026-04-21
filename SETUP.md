# Quizz — Panduan Setup Lengkap

Panduan untuk menjalankan aplikasi Quiz Bahasa Arab dari nol. Ikuti langkah per langkah.

---

## 1. Buat Proyek Supabase (Database & Auth)

1. Buka [https://app.supabase.com](https://app.supabase.com) → **New Project**
2. Pilih nama proyek (misal: `quizz-arabic`) dan catat password database
3. Setelah project siap (~2 menit), buka menu **SQL Editor**
4. Copy-paste dan jalankan file ini secara berurutan:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_functions.sql`
5. Buka **Project Settings → API** → catat:
   - `Project URL` (SUPABASE_URL)
   - `anon/public` key (SUPABASE_ANON_KEY)
   - `service_role` key (simpan aman, jangan share!)

---

## 2. Setup Admin Panel (Next.js Web)

Panel untuk ustadz/admin mengisi soal dan memantau progress.

```bash
cd web
cp .env.local.example .env.local
# Edit .env.local dengan nilai dari Supabase di atas
npm install
npm run dev
```

Buka [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

### Isi `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### Deploy ke Vercel (gratis):
```bash
npx vercel --prod
```
Tambahkan env vars yang sama di Vercel Dashboard → Settings → Environment Variables.

---

## 3. Buat Akun Admin Pertama

1. Di Supabase Dashboard → **Authentication → Users** → **Invite user**
2. Masukkan email ustadz
3. Setelah user terbuat, jalankan di SQL Editor:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = 'USER_ID_DARI_SUPABASE';
   ```

---

## 4. Mengisi Soal (Admin Panel)

1. Login ke admin panel → **Pelajaran**
2. Klik pelajaran (Qiraah/Imla'/Balaghah) yang sudah otomatis ada
3. Klik **Kelola Wahdah & Soal** → pilih wahdah
4. Klik **+ Tambah Soal** → isi form:
   - Tipe: MCQ, Susun Kata, Cocokkan
   - Prompt Arab
   - Opsi jawaban (tandai yang benar dengan klik huruf)
   - Penjelasan (opsional)
5. Klik **Publish ke Wahdah** → soal langsung live

### Import massal (CSV):
Format CSV:
```
type,prompt_ar,choice_a,choice_b,choice_c,choice_d,correct,explanation_ar
mcq,ما إعراب الكلمة...?,فاعل,مفعول به,مبتدأ,خبر,a,الكلمة فاعل لأن...
```
Upload via **Import CSV** di halaman soal.

---

## 5. Setup Mobile App (Expo / React Native)

Aplikasi untuk murid.

```bash
cd mobile
cp .env.example .env
# Edit .env dengan Supabase URL dan key
npm install
npx expo start
```

Scan QR code dengan aplikasi **Expo Go** di HP Android/iPhone.

### Isi `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
EXPO_PUBLIC_API_URL=https://your-vercel-app.vercel.app
```

### Build APK untuk distribusi:
```bash
npx eas build --platform android --profile preview
```
Perlu akun Expo (gratis): [expo.dev](https://expo.dev)

---

## Struktur Proyek

```
quizz/
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql   # Tabel database (9 tabel)
│       └── 002_functions.sql        # Fungsi kalkulasi XP, level, badge
├── web/                             # Next.js — Admin panel + API
│   ├── src/
│   │   ├── app/
│   │   │   ├── (admin)/            # Halaman admin panel
│   │   │   │   ├── dashboard/      # Statistik & aktivitas
│   │   │   │   ├── lessons/        # Kelola pelajaran & wahdah
│   │   │   │   └── questions/      # Input & edit soal
│   │   │   └── api/                # REST API endpoints
│   │   │       ├── auth/
│   │   │       ├── lessons/
│   │   │       ├── units/
│   │   │       ├── attempts/
│   │   │       ├── leaderboard/
│   │   │       └── admin/
│   │   └── types/database.ts       # TypeScript types
│   └── .env.local.example
└── mobile/                          # Expo — Aplikasi murid
    ├── app/
    │   ├── (auth)/                  # Login & Register
    │   │   ├── login.tsx
    │   │   └── register.tsx
    │   └── (app)/                   # Main app (butuh login)
    │       ├── lessons/             # Daftar pelajaran
    │       ├── quiz/[unitId].tsx    # Quiz engine
    │       └── leaderboard/         # Leaderboard
    └── src/
        ├── lib/
        │   ├── supabase.ts          # Supabase client
        │   └── api.ts               # API calls ke Next.js
        └── hooks/
            └── useAuth.ts           # Auth hook
```

---

## Gamifikasi — Ringkasan

| Elemen | Aturan |
|--------|--------|
| XP per soal | 10 XP benar pertama, 5 XP setelah salah |
| XP bonus lulus wahdah | +50 XP, +30 jika sempurna (100%) |
| XP checkpoint | +200 XP, 2× multiplier jika bintang 3 |
| Level | `floor(sqrt(total_xp / 100)) + 1` |
| Bintang | 3★=100%, 2★=80-99%, 1★=lulus, 0★=gagal |
| Hearts | Mulai 3, -1 tiap salah, regen 1/30 menit |
| Streak | +1 tiap hari aktif, reset jika >24 jam vakum |

---

## API Endpoints (Ringkasan)

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/api/auth/register` | Daftar murid baru |
| GET | `/api/lessons` | List pelajaran + progress |
| GET | `/api/lessons/:id/units` | List wahdah untuk dashboard |
| GET | `/api/units/:id/questions` | Ambil soal (tanpa bocor jawaban) |
| POST | `/api/attempts` | Mulai sesi quiz |
| POST | `/api/attempts/:id/answer` | Kirim jawaban (server validates) |
| POST | `/api/attempts/:id/finish` | Selesai, hitung XP & buka wahdah next |
| GET | `/api/leaderboard` | Ranking (filter by kelas/pelajaran) |
| POST | `/api/admin/questions` | Tambah soal (admin only) |
| POST | `/api/admin/import` | Bulk import dari CSV |

---

## Butuh Bantuan?

- Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Expo docs: [docs.expo.dev](https://docs.expo.dev)
- Next.js docs: [nextjs.org/docs](https://nextjs.org/docs)
