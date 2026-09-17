# PRD 1 — Foundation: MongoDB Schema, Auth & App Shell
**Owner:** Person A (or whoever is free first) · **Branch:** `feature/foundation`

## Why you own this
Schema design, auth, and the routing shell are the only things that genuinely need one brain — the Donor, NGO, and Admin PRDs all build against what you produce, so nobody needs to sync live once you're done. Push and merge to `main` **first**; everyone else branches off your commit.

## Tech stack (fixed for the whole team)
- Frontend: React (Vite) + Tailwind CSS
- Backend: Node.js + Express
- DB: MongoDB + Mongoose
- Auth: JWT + bcrypt (email/phone + password, OTP optional for donors)
- AI / 3rd-party: none for MVP (Technology Baseline was "None so far" — Phase 2 only)

## Your scope

### 1. Mongoose schema setup
Create `server/models/` with these schemas exactly as-is (frozen after you commit — role PRDs only add role-specific fields to files they own, never touch `User.js`):
- `User.js` — id, name, email, phone, passwordHash, role (`donor`/`ngo`/`admin`), status (`pending`/`verified`/`rejected`/`suspended`), vettingDocs[], area, rating, created_at
- `Donation.js` — donorId, itemType, condition, photos[], quantity, status *(owned by Donor PRD after foundation merge — you create the empty schema file, Donor PRD fills in logic)*
- `Requirement.js` — ngoId, itemType, quantityNeeded, urgency, beneficiaryGroup, status *(owned by NGO PRD)*
- `Match.js` — donationId, requirementId, donorId, ngoId, status, conditionOnReceipt, usageUpdates[], donorRating, ngoRating *(owned by Donor PRD; NGO PRD writes to `conditionOnReceipt`/`usageUpdates` via API, never the file)*
- `Message.js` — matchId, senderId, content, created_at *(owned by Donor PRD)*

You are only writing the **shape** of these files (schema + `module.exports`) so nobody's PRD blocks on a missing model. Leave a `// TODO: <role> PRD implements logic here` comment at the bottom of each non-User schema.

### 2. Role-based access matrix (write once, in `docs/access_matrix.md`)
Implement exactly this access matrix — every role PRD's route guards must match it:

| Table | Donor | NGO | Admin |
|---|---|---|---|
| users | SELECT/UPDATE own | SELECT/UPDATE own | full |
| donations | SELECT/INSERT/UPDATE own | SELECT own-Match-linked only | full |
| requirements | SELECT all (read-only) | SELECT/INSERT/UPDATE/DELETE own | full |
| matches | SELECT/INSERT own; UPDATE own rating field | SELECT where ngoId=self; UPDATE own rating/receipt/usage fields | full |
| messages | SELECT/INSERT where matchId is theirs | SELECT/INSERT where matchId is theirs | SELECT all (dispute review) |

### 3. Auth endpoints (`server/controllers/authController.js`)
- `POST /api/auth/register` — create `User` (role passed in body)
- `POST /api/auth/login` — password login, returns JWT
- `POST /api/auth/otp/request` / `POST /api/auth/otp/verify` — donor OTP path
- `GET /api/auth/me` — current user's profile + role
- JWT verification + role-guard middleware (`middleware/authMiddleware.js`, `middleware/requireRole.js`) — write once, every role PRD imports but never edits

### 4. App shell (frontend)
- `App.jsx` — routes: `/login`, `/signup`, `/donor` (role-guarded), `/ngo` (role-guarded), `/admin` (role-guarded)
- `components/shared/Navbar.jsx`, `ProtectedRoute.jsx`, `Layout.jsx`
- `context/AuthContext.jsx`, `services/api.js` (base axios instance)
- Design tokens in `index.css`: pick one accent color and font pairing and freeze it — this is a trust-and-logistics tool, not a marketing page. Avoid gradients/glassmorphism; dense, legible tables and dashboards.

### 5. Stub files for every role module — CRITICAL, do this before you stop
Create these as empty-but-real files so nobody else ever touches `server.js`/`App.jsx`:
- Backend: `controllers/donationController.js`, `matchController.js`, `messageController.js`, `requirementController.js`, `adminController.js`, and matching `routes/*.js` for each — each router just `module.exports = require('express').Router();`, and `server.js` already mounts all of them at `/api/donations`, `/api/matches`, `/api/messages`, `/api/requirements`, `/api/admin`
- `server/services/quotaService.js` — stub: `exports.checkQuota = async () => true;` (NGO PRD replaces this later)
- Frontend: `pages/donor/DonorDashboard.jsx`, `pages/ngo/NGODashboard.jsx`, `pages/admin/AdminDashboard.jsx` (each rendered by your role-guarded routes above) — all stub components (`export default () => <div>Coming soon</div>`)

## Merge instructions
Merge to `main` first. Tell the team the moment schemas, `access_matrix.md`, auth, the app shell, and all stub files are pushed — everyone else branches off that commit and only edits files inside their own role's folders (see each role's PRD), never `server.js`, `App.jsx`, or `User.js`.
