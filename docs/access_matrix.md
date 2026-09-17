# Access Control Matrix

| Endpoint Prefix              | Donor | NGO | Admin | Notes                              |
|------------------------------|:-----:|:---:|:-----:|-----------------------------------|
| `POST /api/auth/register`    | ✅    | ✅  | ✅    | Public                            |
| `POST /api/auth/login`       | ✅    | ✅  | ✅    | Public                            |
| `GET  /api/auth/me`          | ✅    | ✅  | ✅    | Authenticated                     |
| `GET  /api/donations`        | ✅    | ✅  | ✅    | All authenticated users           |
| `POST /api/donations`        | ✅    | ❌  | ❌    | Donor only                        |
| `PATCH/DELETE /api/donations/:id` | ✅ | ❌ | ❌  | Donor only                        |
| `GET  /api/matches`          | ✅    | ✅  | ✅    | All authenticated                 |
| `POST /api/matches`          | ✅    | ❌  | ❌    | Donor only                        |
| `PATCH /api/matches/:id`     | ✅    | ❌  | ✅    | Donor or Admin                    |
| `GET/POST /api/messages/:matchId` | ✅ | ✅ | ✅ | Authenticated; scope enforced in controller |
| `GET  /api/requirements`     | ✅    | ✅  | ✅    | All authenticated                 |
| `POST /api/requirements`     | ❌    | ✅  | ❌    | NGO only                          |
| `PATCH/DELETE /api/requirements/:id` | ❌ | ✅ | ❌ | NGO only                    |
| `POST /api/ngo/match-actions/:matchId/confirm-receipt` | ❌ | ✅ | ❌ | NGO only |
| `POST /api/ngo/match-actions/:matchId/usage-update`    | ❌ | ✅ | ❌ | NGO only |
| `POST /api/ngo/match-actions/:matchId/rate-donor`      | ❌ | ✅ | ❌ | NGO only |
| `GET  /api/admin/vetting`    | ❌    | ❌  | ✅    | Admin only                        |
| `PATCH /api/admin/vetting/:id/approve` | ❌ | ❌ | ✅ | Admin only                  |
| `PATCH /api/admin/vetting/:id/reject`  | ❌ | ❌ | ✅ | Admin only                  |
| `GET  /api/admin/users`      | ❌    | ❌  | ✅    | Admin only                        |
| `PATCH /api/admin/users/:id/deactivate` | ❌ | ❌ | ✅ | Admin only                 |
| `GET  /api/admin/disputes`   | ❌    | ❌  | ✅    | Admin only                        |
| `PATCH /api/admin/disputes/:id/resolve` | ❌ | ❌ | ✅ | Admin only                |
| `GET/PUT /api/admin/quotas/:ngoId`    | ❌ | ❌ | ✅ | Admin only                   |
| `GET  /api/admin/analytics`  | ❌    | ❌  | ✅    | Admin only                        |
