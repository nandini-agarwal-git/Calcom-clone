# CalClone — Cal.com Inspired Scheduling App

A full-stack scheduling/booking application that closely replicates Cal.com's design and user experience.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18 (SPA, React Router v6) |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| Styling | Custom CSS (Cal.com design system) |
| Email | Nodemailer (optional) |
| Deployment | Vercel (frontend) + Railway/Render (backend) |

---

## Features

- **Event Types** — Create, edit, delete, toggle active/inactive
- **Availability Schedules** — Weekly hours, timezone, multiple schedules
- **Date Overrides** — Block specific dates or set custom hours for a day
- **Public Booking Page** — Calendar picker, time slot selection, booking form
- **Double Booking Prevention** — Backend conflict detection
- **Bookings Dashboard** — Upcoming, past, cancelled tabs with cancel flow
- **Custom Questions** — Per event type (text, textarea, dropdown)
- **Buffer Times** — Before/after each meeting
- **Booking Confirmation Page** — With "Add to Google Calendar" button
- **Email Notifications** — Confirmation + cancellation (when SMTP configured)
- **Responsive Design** — Mobile, tablet, desktop
- **Rescheduling** — API endpoint ready

---

## Database Schema

```
users
  id, name, email, username, bio, avatar_url, timezone

event_types
  id, user_id, title, description, slug, duration, color,
  location_type, location, buffer_time_before, buffer_time_after,
  min_booking_notice, max_booking_days, requires_confirmation,
  custom_questions (JSONB), is_active

availability_schedules
  id, user_id, name, timezone, is_default

availability_rules
  id, schedule_id, day_of_week (0-6), start_time, end_time, is_available

date_overrides
  id, schedule_id, date, is_blocked, start_time, end_time

event_type_schedules  (join table)
  event_type_id, schedule_id

bookings
  id, event_type_id, uid, title, start_time, end_time,
  booker_name, booker_email, booker_phone, status,
  cancellation_reason, location, custom_answers (JSONB),
  reschedule_from
```

---

## Prerequisites

Make sure you have these installed:

- **Node.js** v18+ → https://nodejs.org
- **npm** v9+ (comes with Node)
- **PostgreSQL** v14+ → https://www.postgresql.org/download/
- **Git** → https://git-scm.com

---

## Local Setup — Step by Step

### Step 1 — Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/calcom-clone.git
cd calcom-clone
```

### Step 2 — Set up PostgreSQL

Open your PostgreSQL client (psql, pgAdmin, or TablePlus) and run:

```sql
CREATE DATABASE calcom_clone;
```

If you need to create a user too:
```sql
CREATE USER caluser WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE calcom_clone TO caluser;
```

### Step 3 — Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/calcom_clone
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Optional — Email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
FROM_EMAIL=your-email@gmail.com
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App passwords → Create one for "Mail".

### Step 4 — Configure frontend environment

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BASE_URL=http://localhost:3000
```

### Step 5 — Install all dependencies

From the **root** folder:
```bash
cd ..   # back to calcom-clone root
npm install          # installs concurrently
cd backend && npm install
cd ../frontend && npm install
cd ..
```

Or all at once:
```bash
npm run install:all
```

### Step 6 — Run database migrations

```bash
cd backend
npm run migrate
```

Expected output:
```
✅ All tables created successfully
```

### Step 7 — Seed sample data

```bash
npm run seed
```

Expected output:
```
✅ Seed data inserted successfully
   👤 User: alex@calclone.com
   📅 4 event types created
   📋 7 sample bookings created
```

### Step 8 — Start the application

Open **two terminal tabs**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
Output: `🚀 Server running on http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```
Output: Opens `http://localhost:3000` automatically

OR, from the root with one command:
```bash
npm run dev
```

---

## Accessing the App

| URL | Description |
|-----|-------------|
| `http://localhost:3000/event-types` | Admin dashboard (Event Types) |
| `http://localhost:3000/bookings` | Bookings dashboard |
| `http://localhost:3000/availability` | Availability settings |
| `http://localhost:3000/settings` | Profile settings |
| `http://localhost:3000/alex` | Public booking page |
| `http://localhost:3000/alex/30min` | Specific event booking page |
| `http://localhost:5000/api/health` | Backend health check |

---

## API Endpoints

### Users
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/users` | Get current user |
| PUT | `/api/users` | Update profile |

### Event Types
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/event-types` | List all event types |
| POST | `/api/event-types` | Create event type |
| PUT | `/api/event-types/:id` | Update event type |
| DELETE | `/api/event-types/:id` | Delete event type |
| PATCH | `/api/event-types/:id/toggle` | Toggle active/inactive |

### Availability
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/availability` | List all schedules |
| POST | `/api/availability` | Create schedule |
| PUT | `/api/availability/:id` | Update schedule + rules |
| POST | `/api/availability/:id/overrides` | Add date override |
| DELETE | `/api/availability/:id/overrides/:overrideId` | Remove override |

### Bookings
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/bookings` | List bookings (filter by ?upcoming=true/false, ?status=) |
| GET | `/api/bookings/:id` | Get single booking |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking |
| POST | `/api/bookings/:id/reschedule` | Reschedule booking |

### Public (no auth)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/public/:username` | Public profile + event types |
| GET | `/api/public/:username/:slug` | Single event type details |
| GET | `/api/public/:username/:slug/dates?month=&year=` | Available dates for calendar |
| GET | `/api/public/:username/:slug/slots?date=YYYY-MM-DD` | Available time slots |
| POST | `/api/public/:username/:slug/book` | Create a booking |

---

## Deploying to GitHub

### Step 1 — Initialize git

```bash
cd calcom-clone
git init
git add .
git commit -m "Initial commit: CalClone full-stack scheduling app"
```

### Step 2 — Create GitHub repository

1. Go to https://github.com/new
2. Repository name: `calcom-clone`
3. Keep it Public or Private
4. Do NOT initialize with README (we already have one)
5. Click **Create repository**

### Step 3 — Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/calcom-clone.git
git branch -M main
git push -u origin main
```

---

## Deploying to Vercel + Railway

### Deploy Backend on Railway (recommended)

Railway gives you a free PostgreSQL + Node.js server.

1. Go to https://railway.app and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo** → select `calcom-clone`
3. Click **Add Service** → **PostgreSQL** — Railway creates a DB automatically
4. Click your Node service → **Settings** → set:
   - **Root Directory**: `backend`
   - **Start Command**: `node src/index.js`
5. Go to **Variables** tab and add:
   ```
   DATABASE_URL    = (copy from Railway PostgreSQL → Connect → DATABASE_URL)
   NODE_ENV        = production
   FRONTEND_URL    = https://your-app.vercel.app
   PORT            = 5000
   ```
6. Railway auto-deploys. Copy your backend URL (e.g. `https://calcom-clone-production.up.railway.app`)
7. Run migrations on Railway — in the Railway shell or locally:
   ```bash
   DATABASE_URL=your-railway-db-url npm run migrate
   DATABASE_URL=your-railway-db-url npm run seed
   ```

### Alternative: Deploy Backend on Render

1. Go to https://render.com → New Web Service → Connect GitHub repo
2. **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `node src/index.js`
5. Add all environment variables from `.env.example`
6. Create a PostgreSQL database on Render, copy the External URL to `DATABASE_URL`

---

### Deploy Frontend on Vercel

1. Go to https://vercel.com → **New Project** → Import from GitHub → select `calcom-clone`
2. **Framework Preset**: Create React App
3. **Root Directory**: `frontend`
4. Under **Environment Variables**, add:
   ```
   REACT_APP_API_URL     = https://your-backend.railway.app/api
   REACT_APP_BASE_URL    = https://your-app.vercel.app
   ```
5. Click **Deploy**

> After deploy, copy the Vercel URL and update `FRONTEND_URL` in your Railway backend variables.

---

## Common Issues & Fixes

### ❌ `ECONNREFUSED` — Backend can't connect to DB
- Make sure PostgreSQL is running: `pg_ctl status` or check Services on Windows
- Verify `DATABASE_URL` in `backend/.env` has correct credentials
- Try connecting manually: `psql postgresql://user:pass@localhost:5432/calcom_clone`

### ❌ `relation "users" does not exist`
- You forgot to run migrations: `cd backend && npm run migrate`

### ❌ CORS error in browser
- Make sure `FRONTEND_URL` in backend `.env` matches exactly where your frontend runs (no trailing slash)
- Default: `FRONTEND_URL=http://localhost:3000`

### ❌ `npm run dev` fails — "concurrently not found"
- Run `npm install` from the **root** `calcom-clone/` directory first

### ❌ React app shows blank page after Vercel deploy
- Make sure `REACT_APP_API_URL` is set in Vercel environment variables
- Check `frontend/vercel.json` exists (SPA rewrites)
- Redeploy after adding env vars

### ❌ No time slots showing on booking page
- Make sure you ran `npm run seed` to create availability rules
- Check the event type is linked to a schedule (seed does this automatically)
- Verify the date is within max booking window (default 60 days)

---

## Project Structure

```
calcom-clone/
├── package.json                  # Root scripts (concurrently)
├── .gitignore
├── vercel.json
├── README.md
│
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── vercel.json
│   └── src/
│       ├── index.js              # Express app entry
│       ├── db/
│       │   ├── pool.js           # PostgreSQL pool
│       │   ├── migrate.js        # Creates all tables
│       │   └── seed.js           # Sample data
│       ├── controllers/
│       │   ├── users.js
│       │   ├── eventTypes.js
│       │   ├── availability.js
│       │   ├── bookings.js
│       │   └── public.js         # Public booking logic
│       ├── routes/
│       │   ├── users.js
│       │   ├── eventTypes.js
│       │   ├── availability.js
│       │   ├── bookings.js
│       │   └── public.js
│       └── utils/
│           └── email.js          # Nodemailer email service
│
└── frontend/
    ├── package.json
    ├── .env.example
    ├── vercel.json
    └── src/
        ├── App.js                # Routes
        ├── index.js
        ├── context/
        │   └── AppContext.js     # Global user state
        ├── utils/
        │   ├── api.js            # Axios API calls
        │   └── helpers.js        # Date/formatting utils
        ├── styles/
        │   └── globals.css
        ├── components/
        │   ├── ui/
        │   │   ├── Button.js
        │   │   ├── Input.js      # Input, Textarea, Select
        │   │   ├── Modal.js
        │   │   └── Badge.js      # Badge, Toggle, Avatar, Spinner
        │   └── dashboard/
        │       ├── DashboardLayout.js  # Sidebar navigation
        │       └── EventTypeForm.js    # Create/edit form
        └── pages/
            ├── EventTypesPage.js       # Dashboard: event types
            ├── BookingsPage.js         # Dashboard: bookings list
            ├── AvailabilityPage.js     # Dashboard: schedule editor
            ├── SettingsPage.js         # Dashboard: profile settings
            ├── PublicProfilePage.js    # /:username
            ├── PublicBookingPage.js    # /:username/:slug
            └── BookingConfirmPage.js   # /booking/confirmed
```

---

## Assumptions Made

1. **Single default user** — No authentication system. One admin user is assumed logged in on all dashboard pages (simulated via "get first user from DB").
2. **Username is `alex`** — Public URLs follow the pattern `/alex/event-slug`. The username can be changed via Settings.
3. **Timezone display** — Times are stored in UTC and displayed in the browser's local timezone on the public booking page.
4. **Email is optional** — The app works fully without SMTP credentials. Bookings are confirmed in the DB regardless.
5. **Slot generation** — Available time slots are computed server-side per request based on schedule rules, existing bookings, buffer times, and min notice period.

---

## License

MIT — free to use and modify.
