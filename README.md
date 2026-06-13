# Trove

A collaborative experience-planning app for families and friend groups. Build curated lists of places, events, and things you want to do — then move them from discovery through planning to memory.

Use cases include vacation and travel planning, tracking restaurants and venues to try, coordinating around events and shows, logging memories after the fact, and being a tourist in your own city.

---

## Tech Stack

### Frontend
| Concern | Choice |
|---|---|
| Framework | React 18 |
| Build tool | Vite |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 |
| Component library | shadcn/ui (Radix primitives) |
| State / data fetching | TanStack Query v5 |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| Maps | react-map-gl (Mapbox GL JS) |
| Icons | Lucide React |

### Backend _(Phase 2 — not yet built)_
Python / FastAPI · SQLAlchemy 2.0 · PostgreSQL 16 · Alembic · Pydantic v2

---

## Project Structure

```
trove/
├── docker-compose.yml
├── .env.example
├── frontend/
│   └── src/
│       ├── components/ui/   # shadcn/ui primitives (don't hand-edit)
│       ├── features/        # Feature-scoped components
│       │   ├── lists/
│       │   ├── list-items/
│       │   ├── plans/
│       │   ├── memories/
│       │   └── map/
│       ├── hooks/           # Custom React hooks (TanStack Query wrappers)
│       ├── mock/            # In-memory mock data and store (Phase 1)
│       ├── services/        # Data access layer (swap mock → API in Phase 2)
│       ├── types/           # Shared TypeScript interfaces
│       └── routes/          # Page-level route components
└── backend/                 # FastAPI scaffold (Phase 2)
```

The **services layer** is the seam between Phase 1 (mock) and Phase 2 (real API). Components and hooks never call `fetch()` directly — everything goes through `src/services/`, which currently returns in-memory data with a simulated delay. In Phase 2, only the service functions change.

---

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- A [Mapbox](https://account.mapbox.com/) account and public token (`pk.*`)

### 1. Clone and configure

```bash
git clone <repo-url>
cd trove
cp .env.example .env
```

Open `.env` and set your Mapbox token:

```
VITE_MAPBOX_TOKEN=pk.your_token_here
```

### 2. Run with Docker

```bash
docker compose up
```

The app is available at **http://localhost:5173** with hot module reload.

### 3. Run without Docker (frontend only)

```bash
cd frontend
npm install
npm run dev
```

Same URL: **http://localhost:5173**

---

## Development Notes

**Mock data** lives in `src/mock/`. All lists, places, plans, and memories are seeded there. New items added at runtime are held in memory for the session only — a page refresh resets to the seed data.

**Adding a place** uses the [Mapbox Search Box API](https://docs.mapbox.com/api/search/search-box/) (`/suggest` → `/retrieve`). A valid `VITE_MAPBOX_TOKEN` is required; without one the search field is disabled and map pins won't render.

**TypeScript** is in strict mode. Run the type checker:

```bash
cd frontend && npx tsc --noEmit
```

---

## Roadmap

**Phase 1 (current)** — fully functional frontend with mock data.

**Phase 2** — FastAPI backend, PostgreSQL persistence, auth, photo upload, real API wired into the existing services layer.

**Phase 3** — real-time collaboration, public list sharing, event notifications, React Native app.
