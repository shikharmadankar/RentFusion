# RentFusion

Rent Anything. Anytime. Anywhere.

Peer-to-peer multi-category rental marketplace. This repo is the foundation slice:
database schema, phone/OTP authentication (real Twilio integration), and the landing
page UI. It's built to extend — every other module in the original spec (listings,
booking flow, payments, dashboard, admin panel) plugs into this schema and this
folder structure.

## What's built in this pass

- **`backend/database/schema.sql`** — full normalized PostgreSQL schema: users, OTPs,
  refresh tokens, profiles, addresses, categories, rental items + images/videos,
  availability calendar, rental requests, bookings, extensions, condition reports,
  returns, damage reports, maintenance, payments, security deposits, coupons,
  reviews, wishlists, messages, notifications, admin logs.
- **`backend/src`** — Express API: health check, categories endpoint, and a complete
  passwordless phone/OTP auth flow (send OTP → verify → JWT access + refresh tokens
  → refresh → logout), rate-limited, using **Twilio Verify** for real SMS delivery.
- **`frontend/src`** — Vite + React landing page: preloader, nav, hero with live
  search bar, scrolling category ticker, 20-category catalog grid, "how it works"
  loop, featured items, trust stats, CTA, footer, and a working OTP login screen
  (auto-advancing 6-digit input, resend countdown) wired to the real API.

## Design direction

The visual language is a **rental ledger / swing-tag** system rather than a generic
SaaS look: deep ink-green canvas, warm paper cards, an amber "price tag" accent used
as the signature element (`SwingTag` component) for category chips, price badges,
and hero decoration. Type pairs a condensed display face (Barlow Condensed) for
headlines with Inter for body text and IBM Plex Mono for prices/specs/stamps —
literally styled like a price tag.

## Getting started

### 1. Database

```bash
createdb rentfusion
cd backend
cp .env.example .env   # then fill in DATABASE_URL and the secrets below
npm install
npm run db:migrate     # applies schema.sql
npm run db:seed        # seeds the 20 categories
```

### 2. Twilio (real OTP SMS)

You asked for real OTP delivery, so the backend uses **Twilio Verify** (not raw SMS +
homemade OTP hashing) — Twilio handles code generation, expiry, and throttling for you.

1. Create a Twilio account: https://console.twilio.com
2. Under **Verify → Services**, create a new Verify Service and copy its **Service SID**.
3. From the console dashboard, copy your **Account SID** and **Auth Token**.
4. In `backend/.env`, set:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
5. On a Twilio trial account, you can only send OTPs to phone numbers you've verified
   in the console (Verified Caller IDs). Upgrade the account to SMS any number.

### 3. Backend

```bash
cd backend
npm run dev   # http://localhost:5000
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173 (proxies /api to the backend)
```

## Environment variables

See `backend/.env.example` for the full list (JWT secrets, Twilio, Cloudinary,
Razorpay, Google Maps, SMTP). Only `DATABASE_URL`, `JWT_ACCESS_SECRET`,
`JWT_REFRESH_SECRET`, and the three `TWILIO_*` values are required to run auth
end-to-end; the rest are needed as later modules (uploads, payments, maps, email)
are built out.

## Folder structure

```
rentfusion/
├── backend/
│   ├── database/schema.sql
│   └── src/
│       ├── config/db.js
│       ├── controllers/authController.js
│       ├── middleware/auth.js
│       ├── routes/{authRoutes,categoryRoutes}.js
│       ├── services/twilioService.js
│       ├── scripts/{migrate,seed}.js
│       ├── utils/jwt.js
│       └── server.js
└── frontend/
    └── src/
        ├── components/
        │   ├── ui/SwingTag.jsx
        │   ├── layout/{Preloader,Navbar,Footer}.jsx
        │   └── landing/{Hero,CategoryTicker,CategoryGrid,HowItWorks,FeaturedItems,TrustAndCTA}.jsx
        ├── pages/{Landing,Login}.jsx
        ├── lib/api.js
        └── App.jsx
```

## Next slices (not yet built)

Roughly in the order they'd naturally get built, each is its own vertical slice on
top of this schema:

1. **Item listing flow** — multi-step form, Cloudinary photo/video upload, category
   pages with filters/sort.
2. **Booking flow** — request → accept/reject → Razorpay payment → calendar lock
   (the `availability_calendar` + `bookings` tables are ready for this).
3. **Dashboard** — stats cards, FullCalendar integration, rental history.
4. **Real-time layer** — Socket.io notifications + in-app chat (the `io` instance is
   already wired into `server.js`; `messages`/`notifications` tables are ready).
5. **Return & condition tracking** — pre/post photos, damage reports (tables ready).
6. **Admin panel** — listing approval, fraud flags, reports.

## Security notes already in place

- OTP codes are never generated or stored by our backend — Twilio Verify owns that,
  so there's no OTP hash to leak.
- Refresh tokens are stored hashed (SHA-256), not raw, and are revocable.
- `helmet`, CORS allowlist, and per-route rate limiting are on the OTP endpoints to
  blunt SMS-bombing abuse.
- All monetary and PII columns use parameterized queries — no string-built SQL.
