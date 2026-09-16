<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# ACI Customer Assistant

ACI Customer Assistant is a full-stack ACI product ordering and customer support platform with an administrator sales ledger and Gemini-powered demand forecasting.

View your app in AI Studio: https://ai.studio/apps/48c5bf29-ca12-453c-8697-c1331e087ad9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env`, set `ADMIN_ID`, `ADMIN_PASSWORD`, and a unique `JWT_SECRET`; optionally set `GEMINI_API_KEY`. The local SQLite database is created automatically beside `package.json`.
3. Run the app:
   `npm run dev`

## Docker deployment

The production Compose stack builds one combined image, runs Express on private
TCP `0.0.0.0:8080`, and puts Nginx in front of it. Only Nginx is attached to
`acimisai_tunnel_network`; Prometheus and Grafana stay on the private bridge
and bind only to configurable loopback host ports. Metrics and documentation
paths are restricted at Nginx.

1. Set deployment values in a shell or local `.env` file, especially
   `ADMIN_PASSWORD`, `JWT_SECRET`, and `GRAFANA_ADMIN_PASSWORD`.
2. Authenticate to `registry.acimisai.com`, pull the tagged image, and start the stack:
   `docker compose pull && docker compose up -d --force-recreate`
3. Verify the public endpoint:
   `curl http://localhost:2312/api/health`

The app is available at `http://localhost:2312`. To stop the container while
keeping the named database volume, run `docker compose down`.

## Security runbook

- Authentication uses a 15-minute HS256 JWT in an HttpOnly cookie and a 7-day rotating refresh cookie whose hash is stored in SQLite. The browser never stores auth tokens in localStorage.
- All state-changing requests require the CSRF token returned by `GET /api/auth/csrf` in `X-CSRF-Token`.
- Product/category writes, order status, sales, forecasting, Gemini settings, and user administration require the server-side `admin` role. Normal users can only read their own orders; product/category browsing is public.
- Existing plaintext passwords are migrated transactionally to bcrypt. Accounts that have no verifiable password are marked `reset_required`; use the administrator password-reset endpoint rather than sharing a fallback password.
- Check health with `curl http://localhost:2312/api/health`. Prometheus is at the configured loopback port and scrapes only `app:8080/metrics`; Grafana is at its configured loopback port.

## Verification

Run `npm run lint`, `npm test`, and `npm run build`. The build intentionally emits no public source maps. `build_push.sh [tag]` builds and pushes the combined image for `linux/amd64` to `registry.acimisai.com/aci-customer-assistant-app:<tag>`.
