# react-songs

React frontend for the song/tab management app. Lets authenticated users browse their song library, view guitar tabs with auto-scroll, and manage videos per song.

## What the app does

After logging in with Google, users can:

- Browse their personal song library, sorted by artist then title
- Search songs by title or artist
- View guitar tab text with configurable auto-scroll speed
- Watch associated YouTube videos alongside the tab
- Add, edit, and delete songs (title, artist, tab text, videos)
- Log out, which clears the session on both the frontend and backend

## Tech stack

| Layer | Technology |
|---|---|
| UI | React 19 |
| Build tool | Vite (rolldown-vite) |
| Auth | Google OAuth via `@react-oauth/google` |
| Icons | Font Awesome |
| Tests | Vitest, React Testing Library |

## Running locally

**Prerequisites:** Node.js 20+, the [express-songs](../express-songs) backend running on port 3001.

```bash
# 1. Install dependencies
npm install

# 2. Create a .env file (see Environment variables below)

# 3. Start the dev server
npm run dev
```

The app starts on `http://localhost:3002` by default. All `/api` requests are proxied to `http://localhost:3001` by Vite, so cookies work without any CORS configuration in the browser.

## Environment variables

Create a `.env` file in the project root:

| Variable | Required | Description |
|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID from Google Cloud Console |
| `PORT` | No | Dev server port (defaults to `3002`) |
| `BACKEND_PORT` | No | Port the backend is running on, used by the Vite proxy (defaults to `3001`) |

`VITE_`-prefixed variables are baked into the bundle at build time by Vite.

## Running tests

```bash
npm test          # watch mode
npm run test:run  # single run (used in CI)
```

Tests use Vitest with jsdom and React Testing Library. All external dependencies (API calls, Google OAuth) are mocked.

## How authentication works

```
User clicks "Sign in with Google"
    │
    ▼
Google OAuth popup → returns a credential token (JWT)
    │
    ▼
googleAuth.jsx POSTs { token } to /api/auth/google
    │
    ▼
Backend verifies token, creates/looks up user, returns:
  - Set-Cookie: session_jwt (HttpOnly — JS cannot read this)
  - JSON body: { name, email, user_id }
    │
    ▼
Frontend stores { name, email, user_id } in a user_data cookie
and in React state. The session_jwt cookie is managed entirely
by the browser and sent automatically with every API request.
    │
    ▼
On reload: App.jsx reads user_data cookie to restore state
without an additional network request
```

**Logout** calls `POST /api/auth/logout`, which clears the HttpOnly `session_jwt` cookie on the server. The frontend then clears `user_data` and resets React state to show the login screen.

**Expired or invalid sessions:** If any API call returns 401, the unauthorized handler registered in `api.js` automatically calls logout and returns the user to the login screen.

## How the frontend and backend interact

In development, Vite proxies all `/api` requests to `http://localhost:3001`. This means both the frontend and backend are same-origin from the browser's perspective, so cookies are sent automatically without any special configuration.

In production, the React app is served as a static build from EC2. The backend runs on the same domain (`song-project.xyz`), so `/api` requests go to the same host and cookies work the same way.

All API calls live in `src/services/api.js`. Every fetch uses `credentials: 'include'` to ensure the session cookie is sent. No token handling is needed in the frontend — the browser attaches the cookie automatically.

If a 401 response is received, the module-level `unauthorizedHandler` is invoked, which logs the user out and clears all session state.

## Page navigation

The app uses state-based routing — no React Router. `currentPage` in `App.jsx` controls which component is rendered:

| Value | Component | Description |
|---|---|---|
| `yourSongs` | `YourSongs` | Default — user's song library with pagination |
| `searchResults` | `SearchResults` | Search results for a query |
| `songDisplay` | `SongDisplay` | Tab view with video panel for a single song |

The `Menu` component provides navigation between pages. The current page is persisted to `localStorage` so it survives a refresh.

## Deployment

Pushes to `master` trigger a GitHub Actions pipeline:

```
push to master
    │
    ▼
[test job]
  npm ci
  npm run test:run
    │
    ▼ (on success)
[deploy job]
  npm ci
  npm run build
  rsync dist/ → EC2 /home/ec2-user/react-songs/dist/
```

The backend serves the `dist/` directory, or a web server (nginx, etc.) can be pointed at it directly.

### Required GitHub secrets and variables

| Name | Type | Description |
|---|---|---|
| `EC2_HOST` | Secret | Public IP or hostname of the EC2 instance |
| `EC2_USER` | Secret | SSH user (e.g. `ec2-user`) |
| `EC2_SSH_KEY` | Secret | Private SSH key for the EC2 instance |
| `VITE_GOOGLE_CLIENT_ID` | Secret | Google OAuth client ID (baked into the bundle at build time) |
| `FRONTEND_PORT` | Variable | Dev server port (e.g. `3002`) |
| `BACKEND_PORT` | Variable | Backend port used by the Vite proxy (e.g. `3001`) |
