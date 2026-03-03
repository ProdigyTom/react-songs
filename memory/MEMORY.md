# Project Memory

## Test Patterns
- Test files use Vitest with `@testing-library/react` and jsdom environment
- Tests live in `src/**/__tests__/` subdirectories matching the source tree
- CSS imports don't need to be mocked (handled silently by Vitest)
- Exception: `src/components/__tests__/AppAuthenticated.test.jsx` mocks its CSS explicitly (legacy pattern)
- Shared mock functions for `useToast` use `vi.hoisted`: `const mockShowToast = vi.hoisted(() => vi.fn())`
- Standard toast mock: `vi.mock('../../context/ToastContext', () => ({ useToast: () => mockShowToast }))`
- API mock: `vi.mock('../../services/api')` then `api.fetchSongs.mockResolvedValue(...)`
- `localStorage` is stubbed with `vi.stubGlobal` in `beforeEach` / `vi.unstubAllGlobals()` in `afterEach`
- Fake timers: `vi.useFakeTimers()` / `vi.useRealTimers()` for ToastContext timeout tests

## Coverage (as of last update)
All source files now have test coverage:
- `src/services/api.js` → `src/services/__tests__/api.test.js` (22 tests)
- `src/context/ToastContext.jsx` → `src/context/__tests__/ToastContext.test.jsx` (9 tests)
- `src/components/songTable.jsx` → `src/components/__tests__/SongTable.test.jsx` (19 tests)
- `src/components/songForm.jsx` → `src/components/__tests__/SongForm.test.jsx` (21 tests)
- `src/components/editSong.jsx` → `src/components/__tests__/EditSong.test.jsx` (3 tests)
- `src/components/createSong.jsx` → `src/components/__tests__/CreateSong.test.jsx` (4 tests)
- `src/App.jsx` → `src/App.test.jsx` (8 tests)
- `src/components/appAuthenticated.jsx` → updated with editSong/newSong/guard tests (12 total)

## Architecture
- React 19 + Vite (rolldown-vite) with React Compiler
- State-based routing via `currentPage` in `App.jsx` (values: yourSongs, searchResults, songDisplay, editSong, newSong)
- Google OAuth via `@react-oauth/google`
- User stored in cookies (`user_data`) and React state
- Toast notifications via `ToastContext` (4s auto-dismiss)
- `SongTable` is a shared component used by both `YourSongs` and `SearchResults`
- Backend API expected at `/api` (proxied to port 3001 in dev)

## Commands
- `npm run test:run` — single test run
- `npm test` — watch mode
