# MidasClick Frontend

React web app for browsing jobs, managing applicants, tracking applications, uploading resumes, and viewing analytics.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Zustand
- Tailwind CSS
- Clerk React SDK
- Recharts
- dnd-kit
- Vitest + Testing Library

## Environment

The frontend uses Vite environment variables.

From the repository root:

```powershell
Copy-Item .env.example.frontend frontend/.env
```

Local values:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-publishable-key
```

Production values usually look like:

```env
VITE_API_BASE_URL=https://midas-click.onrender.com/api/v1
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your-clerk-publishable-key
```

## Run Locally

From `frontend/`:

```powershell
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

The backend should be running on the URL configured in `VITE_API_BASE_URL`.

## Build

```powershell
npm run build
```

Preview the production build:

```powershell
npm run preview
```

## Tests

```powershell
npm run test
```

## Main Areas

- `src/pages/` - route-level pages
- `src/components/application/` - applicant cards, filters, creation modal
- `src/components/job/` - job cards, filters, creation modal
- `src/components/kanban/` - applicant board
- `src/components/auth/` - Clerk auth, profile switcher, auth bridge
- `src/store/` - shared Zustand state and cached data
- `src/api/client.ts` - typed API client and auth headers

## Routing Notes

The app uses client-side routing. Static hosts such as Netlify need a fallback redirect so refreshes work on nested routes. This repo includes:

```text
public/_redirects
```

## Extension Auth Bridge

The Chrome extension signs in through:

```text
/extension-auth?extensionId={chrome.runtime.id}
```

That page uses Clerk to get a session token and sends it back to the extension with `chrome.runtime.sendMessage`.
