# PRD 2 — Donor: Listings, Pledges & Chat
**Owner:** Person B · **Branch:** `feature/donor`
**Prerequisite:** Person A's `feature/foundation` merged to `main` (provides `User.js`, `authMiddleware.js`, stub `Donation.js`/`Match.js`/`Message.js`, stub `quotaService.checkQuota()` returning `true`, and the stub `GET /api/requirements` router mounted by `server.js`)

## Why you own this
The donor journey — list an item, browse requirements, pledge, chat, track status, rate — is one continuous flow that shares the `Donation`, `Match`, and `Message` collections end to end. Splitting it across people would mean two people editing the same `Match.js` file constantly.

## Your scope — files you touch (and ONLY these)
- Backend: `server/models/Donation.js`, `server/models/Match.js`, `server/models/Message.js`, `server/controllers/donationController.js`, `server/controllers/matchController.js`, `server/controllers/messageController.js`, `server/routes/donationRoutes.js`, `server/routes/matchRoutes.js`, `server/routes/messageRoutes.js`
- Frontend: `client/src/pages/donor/*`, `client/src/components/donor/*`

Stub files for these already exist from foundation — fill them in. You may add as many new files as needed inside `pages/donor/`, `components/donor/`, or alongside your own models/controllers, but nowhere else.

**Do not touch:** `server.js`, `App.jsx`, `User.js`, `server/models/Requirement.js`, `server/controllers/requirementController.js`, `server/controllers/adminController.js`, `server/services/quotaService.js`, `client/src/pages/ngo/*`, `client/src/pages/admin/*`.

## API endpoints you own
- `POST /api/donations`
- `GET /api/donations/mine`
- `POST /api/matches`
- `GET /api/matches/mine`
- `POST /api/matches/:id/rate-ngo`
- `POST /api/messages`
- `GET /api/messages/:matchId`

**Not yours:** `GET /api/requirements` (the requirement board data) is implemented in `requirementController.js`, owned by the NGO domain (see PRD 3). You call it as a plain API request from `RequirementBoard.jsx` — you don't touch that controller file. Likewise, `PATCH /api/matches/:id/confirm-receipt`, `POST /api/matches/:id/usage-update`, and `POST /api/matches/:id/rate-donor` write to fields on your `Match.js` schema but are implemented and routed from the NGO domain's own controller file — you own the schema, they own those three write endpoints.

## Features to build
1. **CreateListing.jsx** — form: itemType, condition (`new`/`good`/`fair`), photos[], quantity → `POST /api/donations`, status starts `listed`.
2. **MyDonations.jsx** — lists own donations with status.
3. **RequirementBoard.jsx** — fetches `GET /api/requirements` (NGO-owned endpoint) and renders the open board; response shape is frozen as `{_id, ngoId, itemType, quantityNeeded, urgency, beneficiaryGroup, status}` — if you need a field that isn't there, ask the NGO owner to add it, don't guess.
4. **Pledge flow** (inside `RequirementBoard.jsx`) — donor selects a listing + requirement → `POST /api/matches`; `matchController.js` calls `quotaService.checkQuota(ngoId, category)` (stub returns `true` until PRD 3 replaces it); on `false`, set Match status `rejected` and show "This NGO has reached its limit — try another NGO."
5. **MatchStatus.jsx** — shows Match progressing through `pending_quota_check → confirmed → handover_scheduled → received → completed`, plus any `usageUpdates[]` once the NGO posts them.
6. **ChatWindow.jsx** — messages scoped to `matchId`; server-side check that requester is `donorId` or `ngoId` on that Match.
7. **Privacy audit** — no component anywhere in `pages/donor/*` renders a counterparty's raw `phone`/`email`; only `name` + `area` + the chat thread.

## Integration contract
Nobody imports your components directly — the NGO and Admin domains only ever reach your data through the API endpoints above, never through your React files. No exported component contract needed here.

## UI notes
Use the shared design tokens and `Layout.jsx`/`Navbar.jsx` from foundation — don't redefine fonts/accent color. This is a status-tracking + form-heavy flow: favor a list-then-detail layout (donation list → tap into status/chat) over tabs.

## Merge instructions
Your diff should be contained to the files listed above. If your PR touches `server.js`, `App.jsx`, or any NGO/Admin folder, undo it before opening the PR. Rebase daily once foundation is merged. Re-test your pledge flow against the real `checkQuota()` once PRD 3 replaces the stub, before your final merge.
