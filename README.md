# FreightPulse — Frontend

AI-powered freight & logistics intelligence dashboard for MENA. Tracks shipping
rates, port congestion and carrier advisories, pushes real-time alerts over
WebSocket, and renders AI-generated route intelligence briefs.

Built with Next.js (App Router) + TypeScript + Tailwind + shadcn/ui, Recharts
for charts, react-leaflet for the port map, and Zustand for alert state.

**Live:** https://freight-pulse-frontend.vercel.app

## Requirements

- Node.js 20+
- The FreightPulse backend running and reachable (see [Backend](#backend))

## Getting started

```bash
npm install
cp .env.example .env      # then fill in the values below
npm run dev
```

The app runs at http://localhost:3000.

## Environment variables

| Variable | Required | What it does |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | server-side only | Base REST URL, e.g. `http://localhost:8000/api/v1`. In the browser the app calls the relative `/api/v1` instead and lets the rewrite below proxy it, which avoids CORS preflight. |
| `NEXT_PUBLIC_WS_URL` | yes | Alerts socket, e.g. `ws://localhost:8000/api/v1/ws/alerts` |
| `NEXT_PUBLIC_API_KEY` | yes | Sent as the `X-API-Key` header on every request |
| `NEXT_PUBLIC_USER_ID` | yes | **Must be the UUID that owns the API key** — the backend rejects a non-UUID user id with a 403 during WebSocket auth |
| `NEXT_PUBLIC_USE_MOCKS` | no | `true` serves the fixtures in `mocks/` instead of calling the backend |
| `INTERNAL_BACKEND_URL` | no | Proxy target for the `/api/v1/*` rewrite (default `http://localhost:8000`) |

Everything prefixed `NEXT_PUBLIC_` is embedded in the client bundle — never put
a secret there.

## Backend

Browser requests go to the relative `/api/v1`, which
[`next.config.ts`](next.config.ts) rewrites to `INTERNAL_BACKEND_URL`. Server
components call the backend directly using `NEXT_PUBLIC_API_URL`.

If pages render but every panel is empty, check the backend first:

```bash
curl -H "X-API-Key: $NEXT_PUBLIC_API_KEY" http://localhost:8000/api/v1/carriers
```

With no backend available, set `NEXT_PUBLIC_USE_MOCKS=true` to work off the
fixtures in `mocks/`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve a production build |
| `npm run lint` | ESLint |
| `npm test` | Jest + React Testing Library |
| `npm run test:watch` | Jest in watch mode |
| `npm run test:e2e` | Playwright end-to-end tests |

## Project layout

```
app/            Routes (dashboard, rates, ports, carriers, route-brief, alerts)
                plus error.tsx / global-error.tsx / loading.tsx boundaries
components/
  common/       Shared primitives: SeverityBadge, EmptyState, LoadingSpinner,
                ErrorBoundary
  ui/           shadcn/ui components (generated — avoid hand-editing)
hooks/          useWebSocketAlerts (live alerts + reconnect + REST fallback)
stores/         Zustand alert store
lib/api/        REST client, one module per resource
mocks/          JSON fixtures for NEXT_PUBLIC_USE_MOCKS
__tests__/      Jest unit/component tests
e2e/            Playwright specs
```

## Real-time alerts

`useWebSocketAlerts` connects on app load and reconnects with exponential
backoff (1s → 30s cap). After three consecutive failures it falls back to
polling `/alerts` every 30 seconds until the socket recovers, so a flaky or
down backend degrades instead of silently going stale.

## Testing

```bash
npm test              # unit + component
npm run test:e2e      # end-to-end (needs the app running or lets Playwright start it)
```

## Deployment

Deployed on Vercel at https://freight-pulse-frontend.vercel.app — pushes to
the default branch redeploy it automatically.

No extra configuration is needed beyond setting the environment variables
above in the Vercel dashboard. Two of them decide whether the deployment can
reach any data at all:

- `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` must point at a **publicly
  reachable** backend. A `localhost` value works locally but leaves every
  panel on the deployed site empty.
- `NEXT_PUBLIC_*` values are baked in at build time, so changing one in the
  dashboard requires a redeploy to take effect.

A [`Dockerfile`](Dockerfile) is included as an alternative:

```bash
docker build -t freightpulse-frontend .
docker run -p 3000:3000 --env-file .env freightpulse-frontend
```
