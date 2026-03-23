# 🎬 VIGAM 2026 - Where Bollywood Meets Binary

> A full-stack college farewell event registration + QR check-in web app built for ~600 students across IT, Cyber Security, Data Science and MCA branches.

![VIGAM 2026](https://img.shields.io/badge/VIGAM-2026-FFD700?style=for-the-badge&labelColor=0A0A0A)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&labelColor=0A0A0A)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&labelColor=0A0A0A)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=for-the-badge&logo=cloudflare&labelColor=0A0A0A)

---

## 🌟 Live Demo

**Registration:** https://vigam2026.pages.dev/

**Admin Panel:** https://vigam2026.pages.dev/admin

**Gate Check-in:** https://vigam2026.pages.dev/checkin

---

## ✨ Features

### 👨‍🎓 Senior Flow
- ERP ID verification with cinematic loading animation
- Profile auto-fill from college database
- Photo upload with Polaroid-style preview
- Random Bollywood-themed superlative assignment
- Digital QR pass with countdown timer
- Automatic email confirmation with QR attached

### ⚡ Junior Flow
- ERP ID verification
- Volunteer coordination screen
- Digital QR entry pass
- Automatic email confirmation

### 🖥️ Admin Dashboard
- Live registration statistics
- Student table with photos and QR codes
- Search and filter by branch, role, status
- Export attendance as CSV
- Download all QR passes as ZIP
- Download all student photos as ZIP
- Real-time updates via Supabase Realtime

### 🚪 Gate Check-in System
- Camera-based QR scanner
- Manual ERP ID entry fallback
- Full-screen result flash (Green/Yellow/Red)
- Live "students inside" counter
- Auto-reset after 3 seconds for next scan

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Vite | UI framework |
| Styling | Tailwind CSS + Inline styles | Bollywood cinematic theme |
| Database | Supabase (PostgreSQL) | Student data + Realtime |
| Storage | Supabase Storage | Photos + QR codes |
| QR Generation | qrcode.react | Digital pass QR |
| QR Scanning | jsQR | Gate check-in scanner |
| Animations | Framer Motion | Cinematic transitions |
| Email | Brevo API | Registration confirmation |
| Deployment | Cloudflare Pages | Hosting + Serverless functions |
| CI/CD | GitHub → Cloudflare | Auto deploy on push |
| WhatsApp | whatsapp-web.js | Bulk QR sending (Azure VM) |

---

## 📁 Project Structure

```
vigam2026/
├── api/                          # Vercel serverless (legacy)
├── functions/
│   └── api/
│       └── send-email.js         # Cloudflare Pages Function
├── public/
│   └── _redirects                # Cloudflare routing
├── src/
│   ├── admin/
│   │   └── AdminDashboard.jsx    # Admin control panel
│   ├── checkin/
│   │   ├── CheckIn.jsx           # Gate check-in system
│   │   └── QRScanner.jsx         # Camera QR scanner
│   ├── components/
│   │   ├── Loader.jsx            # Loading component
│   │   └── UI.jsx                # Shared UI components
│   ├── constants/
│   │   └── superlatives.js       # Bollywood superlatives list
│   ├── pages/
│   │   ├── Splash.jsx            # Landing screen
│   │   ├── BranchSelect.jsx      # Branch selection
│   │   ├── ERPVerify.jsx         # ERP verification
│   │   ├── ProfileConfirm.jsx    # Profile confirmation
│   │   ├── PhotoUpload.jsx       # Photo upload
│   │   ├── Superlative.jsx       # Award reveal
│   │   ├── SuccessPass.jsx       # Senior QR pass
│   │   ├── JuniorVolunteer.jsx   # Junior volunteer screen
│   │   ├── JuniorSuccess.jsx     # Junior QR pass
│   │   └── NotFound.jsx          # 404 page
│   ├── utils/
│   │   └── db.js                 # Supabase query helpers
│   ├── App.jsx                   # Routes
│   ├── index.css                 # Global styles + animations
│   ├── main.jsx                  # Entry point
│   └── supabaseClient.js         # Supabase connection
├── .env                          # Environment variables (never commit!)
├── vite.config.js                # Vite configuration
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
  role TEXT NOT NULL,             -- 'senior' or 'junior'
  photo_url TEXT,                 -- Supabase Storage URL
  qr_code_url TEXT,               -- Supabase Storage URL
  superlative TEXT,               -- Bollywood award title
  registered_at TIMESTAMP WITH TIME ZONE,
  is_registered BOOLEAN DEFAULT FALSE,
  is_present BOOLEAN DEFAULT FALSE,
  registered_rank INTEGER,
  wants_to_volunteer BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP WITH TIME ZONE
);
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v18+
- Python 3.8+ (for data import)
- Supabase account
- Brevo account (email)
- Cloudflare account

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/vigam2026.git
cd vigam2026
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Add to Cloudflare Pages environment variables:
```
BREVO_API_KEY=your_brevo_api_key
```

### 4. Set Up Supabase

Run this SQL in your Supabase SQL Editor:

```sql
-- Create students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  erp_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  branch TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  year INTEGER NOT NULL,
  role TEXT NOT NULL DEFAULT 'junior',
  photo_url TEXT,
  qr_code_url TEXT,
  superlative TEXT,
  registered_at TIMESTAMP WITH TIME ZONE,
  is_registered BOOLEAN DEFAULT FALSE,
  is_present BOOLEAN DEFAULT FALSE,
  registered_rank INTEGER,
  wants_to_volunteer BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON students FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON students FOR UPDATE USING (true);

-- Enable Realtime
ALTER TABLE students REPLICA IDENTITY FULL;
```

Create storage buckets: `photos` and `qrcodes` (both public)

### 5. Import Student Data

```bash
pip install pandas openpyxl supabase
python clean_data.py      # Clean Excel data first
python import_students.py # Import to Supabase
```

### 6. Run Locally

```bash
npm run dev
```

Open http://localhost:5173

---

## 📦 Data Import

The project includes two Python scripts for importing student data:

### `clean_data.py`
Reads 3 Excel files with different formats, cleans data and exports a single verified Excel with 5 sheets:
- ✅ Clean Data
- 📊 Summary
- ⚠️ Issues
- 🔁 Duplicates
- 📱 Phone Check

### `import_students.py`
Reads the cleaned Excel and imports to Supabase in batches of 50.

---

## 🌐 Deployment

### Cloudflare Pages (Recommended)

1. Push code to GitHub
2. Go to Cloudflare Pages → Create new project
3. Connect GitHub repository
4. Build settings:
   ```
   Framework: Vite
   Build command: npm run build
   Output directory: dist
   ```
5. Add environment variables
6. Deploy!

**CI/CD:** Every `git push` to `main` triggers automatic redeployment.

---

## 🔐 Admin Access

| URL | Password |
|-----|----------|
| `/admin` | Set in `AdminDashboard.jsx` |
| `/checkin` | Set in `CheckIn.jsx` |

> ⚠️ Change default passwords before going live!

---

## 📱 QR Code Format

QR codes follow this format:
```
VIGAM2026|ERP_ID|STUDENT_NAME
Example: VIGAM2026|6605029|Jatin Naik
```

---

## 📧 Email System

Powered by **Brevo API** via Cloudflare Pages Function:
- Triggered automatically after registration
- Includes QR code in email body
- QR attached as PNG file
- Works for both seniors and juniors

---

## 🎭 Superlatives

20 Bollywood-themed superlatives randomly assigned to seniors:
- "The Shah Rukh Khan of the Batch 🌟"
- "Most Likely to Debug at 3AM 💻"
- "The Human Stack Overflow 🔍"
- ...and 17 more!

Add/edit in `src/constants/superlatives.js`

---

## 📅 Event Day Checklist

### Day Before (April 7th)
- [ ] Download all QRs as ZIP from admin
- [ ] Download attendance CSV backup
- [ ] Brief volunteers on `/checkin`
- [ ] Print attendance sheet backup
- [ ] Charge power bank for gate device

### Event Day (April 8th)
- [ ] Open `/checkin` on gate device
- [ ] Keep `/admin` open for monitoring
- [ ] Have manual ERP entry ready as fallback
- [ ] Keep printed list as last resort

---

## 👨‍💻 Built By

**Jatin Naik** - B.Tech IT Student, Rungta College

Built with ❤️ for VIGAM 2026 - the farewell event that brings Bollywood to Binary!

---

## 📄 License

MIT License — feel free to use for your own college events!

---

*🎬 VIGAM 2026 — Where Bollywood Meets Binary*
