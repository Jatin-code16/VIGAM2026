# 🎬 VIGAM 2026 - Where Bollywood Meets Binary

> A full-stack college farewell event registration + QR check-in web app built for ~600 students across IT, Cyber Security, Data Science and MCA branches.

![VIGAM 2026](https://img.shields.io/badge/VIGAM-2026-FFD700?style=for-the-badge&labelColor=0A0A0A)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&labelColor=0A0A0A)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&labelColor=0A0A0A)
![Vercel](https://img.shields.io/badge/Vercel-Hosting-000000?style=for-the-badge&logo=vercel&labelColor=0A0A0A)

---

## 🌟 Live Demo

**Registration:** https://vigam-2026.vercel.app/

**Admin Panel:** https://vigam-2026.vercel.app/admin

**Gate Check-in:** https://vigam-2026.vercel.app/checkin

**Dinner Check-in:** https://vigam-2026.vercel.app/dinner

---

## ✨ Features

### 👨‍🎓 Senior Flow
- ERP ID verification with cinematic loading animation
- Profile auto-fill from college database
- Photo upload with Polaroid-style preview (auto-compressed in the browser)
- Random Bollywood-themed superlative assignment
- Digital QR pass with countdown timer
- Automatic email confirmation with QR attached

### ⚡ Junior Flow
- ERP ID verification
- Volunteer coordination screen
- Digital QR entry pass
- Automatic email confirmation

### 🎭 Demo Mode
- "Not a student? Try the demo" on the landing page
- Full senior or junior flow with any ID
- Nothing is saved, no email is sent, and the demo QR (`VIGAM2026-DEMO|…`) is rejected at the gate

### 🖥️ Admin Dashboard
- Live registration statistics
- Student table with photos and QR codes
- Search and filter by branch, role, status
- Export attendance as CSV
- Download all QR passes as ZIP
- Download all student photos as ZIP
- Real-time updates via Supabase Realtime

### 🚪 Gate & 🍽️ Dinner Check-in
- Camera-based QR scanner
- Manual ERP ID entry fallback
- Full-screen result flash (Green/Yellow/Red)
- Live "inside" / "at dinner" counters
- Dinner requires a gate check-in first
- Auto-reset after 3 seconds for next scan

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 + Vite | UI framework |
| Styling | Tailwind CSS v4 + inline styles | Bollywood cinematic theme |
| Database | Supabase (PostgreSQL) | Student data, RLS, Postgres functions |
| Auth | Supabase Auth | Staff login (admin / gate / dinner) |
| Storage | Supabase Storage | Photos + emailed QR images |
| QR Generation | qrcode.react, qrcode | Digital pass QR |
| QR Scanning | jsQR | Gate check-in scanner |
| Email | Brevo API | Registration confirmation |
| Deployment | Vercel | Hosting + serverless function |

---

## 🔐 Security Model

- **The anon key cannot read or write the `students` table.** Row Level Security only lets
  `admin` staff read it, and nobody can update it directly.
- **All writes go through Postgres functions** (`supabase/migrations/`):
  - `lookup_student` returns only name / branch / year / role for the "is this you?" screen
  - `register_student` registers atomically: one registration per student, unique ranks, server-side validation
  - `gate_check_in` / `dinner_check_in` are staff-only and atomic, so two scanners can't admit the same pass
  - `event_counts` returns public aggregate counts
- **QR passes carry a random token** (`VIGAM2026|<uuid>`), not the ERP ID, so they can't be forged.
- **Staff log in with Supabase Auth.** Access is controlled by the `staff` table, not by passwords in the code.
- **The email endpoint only takes an ERP ID.** It reads the recipient from the database with the
  service-role key and sends at most once, within 15 minutes of registration.
- **Photo uploads are restricted.** Only a real, unregistered student can upload, only as
  `<erp_id>_<random uuid>.jpg`, JPEG only, max 2MB. Registration only accepts a photo the student
  actually uploaded, never an outside URL.
- **Security headers** in `vercel.json`: Content-Security-Policy, HSTS, `X-Frame-Options: DENY`,
  `nosniff`, Referrer-Policy, and a Permissions-Policy that allows only the camera. If Supabase is on a
  custom domain, add it to `img-src` and `connect-src` in the CSP.
- **CSV export is safe in Excel.** Cells that a spreadsheet would run as formulas are neutralised.

**Who can register:** only ERP IDs on the verified list from the HOD. Registration checks the ID
against the database, and the confirmation email always goes to the student's own institute inbox.

---

## 📁 Project Structure

```
vigam2026/
├── api/
│   └── send-email.js             # Vercel serverless function (Brevo)
├── supabase/
│   └── migrations/               # RLS policies + Postgres functions
├── public/
│   └── favicon.svg
├── src/
│   ├── admin/
│   │   └── AdminDashboard.jsx    # Admin control panel
│   ├── checkin/
│   │   ├── ScanStation.jsx       # Shared scanner screen (gate + dinner)
│   │   ├── CheckIn.jsx           # Gate check-in
│   │   ├── DinnerCheckIn.jsx     # Dinner check-in
│   │   └── QRScanner.jsx         # Camera QR scanner
│   ├── components/
│   │   ├── StaffGate.jsx         # Supabase Auth login for staff screens
│   │   └── UI.jsx                # Shared UI components
│   ├── constants/
│   │   ├── event.js              # Dates, branches, QR format
│   │   └── superlatives.js       # Bollywood superlatives list
│   ├── hooks/
│   │   ├── useCountdown.js
│   │   └── useRegistration.js    # Registers once, caches the pass, sends email
│   ├── pages/                    # Splash → Branch → Verify → Profile → Photo → Superlative → Pass
│   ├── utils/
│   │   ├── db.js                 # All Supabase calls
│   │   └── session.js
│   ├── App.jsx                   # Routes
│   ├── index.css                 # Global styles + animations
│   ├── main.jsx                  # Entry point
│   └── supabaseClient.js         # Supabase connection
├── .env.example
├── vercel.json
└── package.json
```

---

## 🗄️ Database Schema

```sql
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  erp_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  branch TEXT NOT NULL,           -- IT, Cyber, DS, MCA
  phone TEXT,                     -- +91XXXXXXXXXX format
  email TEXT,                     -- erp_id@rungta.org
  year INTEGER NOT NULL,          -- 1-4 for BTech, 1-2 for MCA
  role TEXT NOT NULL DEFAULT 'junior', -- set on registration from branch + year
  photo_url TEXT,                 -- Supabase Storage URL
  superlative TEXT,               -- Bollywood award title (seniors)
  registered_at TIMESTAMP WITH TIME ZONE,
  is_registered BOOLEAN DEFAULT FALSE,
  is_present BOOLEAN DEFAULT FALSE,
  registered_rank INTEGER,
  wants_to_volunteer BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP WITH TIME ZONE
  -- added by the migration:
  -- qr_token UUID UNIQUE, email_sent_at, is_at_dinner, dinner_checked_at
);
```

The migration also creates the `staff` table. Registration has no deadline or on/off switch.

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v18+
- Supabase account
- Brevo account (email)
- Vercel account

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/vigam2026.git
cd vigam2026
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in the two `VITE_` values.
Set all four server values in **Vercel → Project Settings → Environment Variables**:

| Variable | Where | Notes |
|----------|-------|-------|
| `VITE_SUPABASE_URL` | `.env` + Vercel | Public |
| `VITE_SUPABASE_ANON_KEY` | `.env` + Vercel | Public |
| `SUPABASE_URL` | Vercel | Server only |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel | Server only. **Never** prefix with `VITE_` |
| `BREVO_API_KEY` | Vercel | Server only |
| `BREVO_SENDER_EMAIL` | Vercel | A sender verified in Brevo |

### 3. Supabase

1. Run [`supabase/migrations/20261030000000_security_hardening.sql`](supabase/migrations/20261030000000_security_hardening.sql)
   in the SQL editor. It creates the `students` table (if missing), the `staff` table, and the
   `photos` / `qrcodes` buckets. It's safe to run more than once.
2. Import the HOD's verified student list into `students` (`erp_id`, `name`, `branch`, `year`,
   optionally `email`). Table Editor → students → Insert → Import CSV works.
3. In **Storage → Policies**, delete any older policies that let anon update or delete objects.
4. Create staff accounts (**Authentication → Users → Add user**), then grant roles:

```sql
insert into staff (user_id, role)
select id, 'admin' from auth.users where email = 'director@example.com';

insert into staff (user_id, role)
select id, 'gate' from auth.users where email in ('gate1@example.com', 'gate2@example.com');

insert into staff (user_id, role)
select id, 'dinner' from auth.users where email = 'dinner@example.com';
```

Roles: `admin` → dashboard + both scanners · `gate` → `/checkin` · `dinner` → `/dinner`.
Turning off public sign-ups (**Authentication → Providers → Email**) is recommended, but not
required: a signed-up user without a `staff` row has no access.

### 4. Run locally

```bash
npm run dev        # frontend only (https://localhost:5173, self-signed cert for camera access)
npx vercel dev     # frontend + /api/send-email
```

---

## 🌐 Deployment

Push to GitHub and import the repo in Vercel (framework: Vite, build: `npm run build`, output: `dist`).
`vercel.json` rewrites every non-`/api` route to `index.html` so deep links like `/admin` work.

**CI/CD:** Every `git push` to `main` triggers automatic redeployment.

---

## 📱 QR Code Format

```
VIGAM2026|<qr_token>
Example: VIGAM2026|11f63f73-f240-4379-a7e2-4756b84d8351
```

The token is generated when the student registers. Passes in the old `VIGAM2026|ERP_ID|NAME`
format are no longer accepted. Staff can still check people in manually by ERP ID.

---

## 🎭 Superlatives

20 Bollywood-themed superlatives randomly assigned to seniors:
- "The Shah Rukh Khan of the Batch 🌟"
- "Most Likely to Debug at 3AM 💻"
- "The Human Stack Overflow 🔍"
- ...and 17 more!

Add/edit in `src/constants/superlatives.js`

---

## 👨‍💻 Built By

**Jatin Naik** - B.Tech IT Student, Rungta College

Built with ❤️ for VIGAM 2026 - the farewell event that brings Bollywood to Binary!

---

## 📄 License

MIT License — feel free to use for your own college events!

---

*🎬 VIGAM 2026 — Where Bollywood Meets Binary*
