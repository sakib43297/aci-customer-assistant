# ACI Customer Assistant

ACI Customer Assistant is a full-stack ACI product ordering and customer support platform with an administrator sales ledger and Gemini-powered demand forecasting.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env`, set `ADMIN_ID`, `ADMIN_PASSWORD`, and a unique `JWT_SECRET`; optionally set `GEMINI_API_KEY`. The local SQLite database is created automatically beside `package.json`.
3. Run the app:
   `npm run dev`

## Docker deployment

The deploy Compose stack pulls one combined image, runs Express on private TCP
`0.0.0.0:8080`, and puts Nginx in front of it. Only Nginx is attached to
`acimisai_tunnel_network`; the app has no host port. Metrics and
documentation paths are restricted at Nginx.

1. Set deployment values in a shell or local `.env` file, especially
   `ADMIN_PASSWORD`, `JWT_SECRET`, and `TRUSTED_PROXY_CIDRS`.
2. Authenticate to `registry.acimisai.com`, pull the tagged image, and start the stack:
   `docker compose -f prod.docker-compose.yml pull && docker compose -f prod.docker-compose.yml up -d --force-recreate`
3. Verify the public endpoint:
   `curl http://localhost:2312/api/health`

The tunnel exposes Nginx; there is no direct localhost port in the deploy
stack. Its SQLite database is stored in `./data/aci-platform.sqlite`. To
stop the containers while keeping the database, run
`docker compose -f prod.docker-compose.yml down`.

Docker creates `./data` when absent. The image contains startup seed logic,
so the first start creates and seeds the project-local SQLite database. Ensure
the deployment user can write `./data`, and back it up before replacement.
Use the real tunnel/reverse-proxy CIDRs for `TRUSTED_PROXY_CIDRS`; do not use
a broad private-network default.

## Security runbook

- Authentication uses a 15-minute HS256 JWT in an HttpOnly cookie and a 7-day rotating refresh cookie whose hash is stored in SQLite. The browser never stores auth tokens in localStorage.
- All state-changing requests require the CSRF token returned by `GET /api/auth/csrf` in `X-CSRF-Token`.
- Product/category writes, order status, sales, forecasting, Gemini settings, and user administration require the server-side `admin` role. Normal users can only read their own orders; product/category browsing is public.
- Existing plaintext passwords are migrated transactionally to bcrypt. Accounts that have no verifiable password are marked `reset_required`; use the administrator password-reset endpoint rather than sharing a fallback password.
- Check health through the tunnel at `/api/health`. Protected metrics and
  documentation endpoints are private-client-only at Nginx.

## Verification

Run `npm run lint`, `npm test`, and `npm run build`. The build intentionally emits no public source maps. `build_push.sh [tag]` builds and pushes the combined image for `linux/amd64` to `registry.acimisai.com/aci-customer-assistant-app:<tag>`.
