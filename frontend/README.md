# Frontend (Rsbuild + React + TypeScript)

This directory contains the React frontend powered by Rsbuild.

## Scripts

- `npm run dev` Start dev server (default http://localhost:5173)
- `npm run build` Production build
- `npm run preview` Preview production build

## Environment Variables

Create a `.env` (already scaffolded) with:
```
VITE_BACKEND_URL=http://localhost:3000
VITE_API_PREFIX=/api
```
Adjust these to point to your backend deployment.

## Backend Integration
- All API calls go through `src/apiClient.ts` using `import.meta.env.VITE_BACKEND_URL` + `VITE_API_PREFIX`.
- Dev proxy in `rsbuild.config.ts` proxies `/api` to backend.
- Ensure backend enables CORS for the frontend origin (e.g., http://localhost:5173).

## Health Check
The component `HealthCheck` calls `/health` endpoint expecting `{ data: { status: string } }` or `{ status: 'ok' }` pattern. Adjust mapping logic if backend differs.

## Next Ideas
- Add React Query or SWR for data fetching.
- Introduce routing (e.g., React Router) for multiple views.
- Implement auth context and session persistence.
- Add ESLint + Prettier unified config at monorepo root.

## Troubleshooting
If you see module not found for @rsbuild/* run `npm install` inside `frontend/`.
If environment variables don't apply, restart dev server.
