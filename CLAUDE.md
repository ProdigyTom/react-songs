# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `npm run dev` - starts Vite dev server with HMR
- **Build**: `npm run build` - production build
- **Lint**: `npm run lint` - runs ESLint
- **Preview**: `npm run preview` - preview production build
- **Test (watch)**: `npm test` - runs Vitest in watch mode
- **Test (single run)**: `npm run test:run` - runs all tests once

## Architecture

This is a React 19 songs/tabs application using Vite (via rolldown-vite) with React Compiler enabled.

### Authentication Flow
- Google OAuth via `@react-oauth/google` wraps the app in `main.jsx`
- User state stored in cookies (`user_data`) and React state
- API calls use `session_jwt` from user object for Bearer token auth

### Page Navigation
The app uses state-based routing via `currentPage` in `App.jsx`:
- `yourSongs` - User's song library (default)
- `searchResults` - Search results page
- `songDisplay` - Individual song/tab view

### Key Structure
- `src/components/` - React components (Login, Header, Menu, YourSongs, SearchResults, SongDisplay)
- `src/services/api.js` - API client (expects backend at `http://localhost:3000/api`)
- `src/css/` - Component stylesheets

### Backend Dependency
Requires a separate backend server running on port 3000 with endpoints:
- `GET /api/songs` - list songs (supports `limit`, `offset`, `query` params)
- `GET /api/tabs/:songId` - fetch tab content
