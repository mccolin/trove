# CLAUDE.md — Trove

## Project Overview

**Trove** is a collaborative experience-planning app for families and friend groups. Users build curated Lists of Places, Events, and Occurrences — things they want to do, visit, or attend — and move items through a lifecycle from discovery → planned → remembered.

The name evokes a treasure trove: a curated, personal collection of the experiences that matter to you.

Primary use cases:
- Vacation and travel planning
- Tracking restaurants, venues, and experiences to try
- Group coordination around events, shows, and activities
- Logging memories after experiences happen
- Being a tourist in your own city

---

## Development Philosophy

- **Frontend-first**: The initial phase is a fully functional frontend with local/mock data. No backend is required to run the app in Phase 1.
- **Mobile-aware from day one**: All views must be responsive and work well on both desktop and mobile browsers. React is chosen partly for its React Native migration path.
- **Simple over clever**: Prefer readable, conventional code over clever abstractions. This is a learning-oriented project — clarity matters.
- **Dockerized from the start**: Every service runs in Docker. A developer should be able to clone the repo, copy `.env.example` to `.env`, and run `docker compose up` to get a fully working local environment.

---

## Tech Stack

### Frontend
| Concern | Choice |
|---|---|
| Framework | React 18 |
| Build tool | Vite |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Component library | shadcn/ui |
| State management | React Context + hooks (→ Zustand when complexity warrants) |
| Routing | React Router v6 |
| Maps | react-map-gl (Mapbox GL JS) |
| Data fetching | TanStack Query (React Query) — even against mock data, to build the right patterns |
| Forms | React Hook Form + Zod |
| Icons | Lucide React (ships with shadcn/ui) |

### Backend (Phase 2 — not built yet)
| Concern | Choice |
|---|---|
| Framework | Python / FastAPI |
| Language | Python 3.12+ |
| ORM | SQLAlchemy 2.0 (async) |
| Migrations | Alembic |
| Validation | Pydantic v2 |
| Auth | TBD (JWT likely) |

### Infrastructure & Data
| Concern | Choice |
|---|---|
| Database | PostgreSQL 16 |
| Local orchestration | Docker Compose |
| Environment config | `.env` file (`.env.example` committed, `.env` gitignored) |

---

## Repository Structure

```
trove/
├── CLAUDE.md                  # This file
├── .env.example               # All required environment variables with placeholders
├── .env                       # Local secrets — gitignored
├── docker-compose.yml         # Orchestrates all services
│
├── frontend/                  # React + Vite app
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/        # Shared/reusable UI components
│       │   └── ui/            # shadcn/ui generated components (do not hand-edit)
│       ├── features/          # Feature-scoped components and logic
│       │   ├── lists/
│       │   ├── list-items/
│       │   ├── places/
│       │   ├── events/
│       │   ├── occurrences/
│       │   ├── plans/
│       │   ├── memories/
│       │   └── map/
│       ├── hooks/             # Custom React hooks
│       ├── lib/               # Utilities, helpers, shadcn utils
│       ├── mock/              # Mock data and mock API layer (Phase 1)
│       ├── services/          # API client functions (called by React Query)
│       ├── store/             # Zustand stores (if/when added)
│       ├── types/             # Shared TypeScript types and interfaces
│       └── routes/            # React Router route definitions
│
├── backend/                   # FastAPI app (scaffolded in Phase 2)
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic/
│   └── app/
│       ├── main.py
│       ├── models/
│       ├── schemas/
│       ├── routers/
│       └── db/
│
└── db/                        # Database init scripts and seed data
    └── init.sql
```

---

## Docker Setup

### Services (docker-compose.yml)
| Service | Description | Port |
|---|---|---|
| `frontend` | Vite dev server with HMR | 5173 |
| `backend` | FastAPI with uvicorn (Phase 2) | 8000 |
| `db` | PostgreSQL 16 (Phase 2) | 5432 |

### Getting Started
```bash
cp .env.example .env
# Fill in VITE_MAPBOX_TOKEN and any other required values
docker compose up
```

The frontend is available at `http://localhost:5173`.

### Frontend Dockerfile (development)
- Based on `node:20-alpine`
- Mounts `./frontend` as a volume for hot module reload
- Runs `vite --host` so HMR works inside Docker

### Backend Dockerfile (development, Phase 2)
- Based on `python:3.12-slim`
- Mounts `./backend` as a volume for live reload via `uvicorn --reload`

---

## Environment Variables

All variables live in `.env`. The `.env.example` file must be kept up to date whenever a new variable is added.

```
# Mapbox
VITE_MAPBOX_TOKEN=your_mapbox_public_token_here

# Backend (Phase 2)
DATABASE_URL=postgresql+asyncpg://trove:trove@db:5432/trove
SECRET_KEY=changeme

# PostgreSQL (Phase 2)
POSTGRES_USER=trove
POSTGRES_PASSWORD=trove
POSTGRES_DB=trove
```

Note: All frontend environment variables must be prefixed with `VITE_` to be exposed by Vite.

---

## Data Model

Trove uses a three-layer model separating global/shared knowledge (Places, Events, Occurrences) from personal/group curation (Lists, ListItems, Plans, Memories).

```
Place ──────────────────────────────────────────┐
                                                 ↓
Event ──────────────── has many ──────────── Occurrence
                                                 ↑
                          ListItem points to one of:
                          - Place (general interest in a location)
                          - Event (general intent, no specific date/venue)
                          - Occurrence (specific event at a place on a date)
                                                 ↑
                                               List
```

### Global / Shared Models

#### `Place`
A physical location. Canonical, shared across all users.
```
id, name, description, address, lat, lng,
category, imageUrl, websiteUrl,
externalIds { mapboxId, googlePlaceId },
createdAt, updatedAt
```

#### `Event`
An abstract happening or series (a tour, a festival, a sports season). Not tied to a specific date or venue.
```
id, name, description, imageUrl, websiteUrl,
category, startDate (optional), endDate (optional),
createdAt, updatedAt
```

#### `Occurrence`
A specific instance of an Event at a Place on a date. This is what you actually attend.
Examples: "Weezer at The Mann Center on July 12", "Eagles vs Cowboys at Lincoln Financial Field on Nov 3"
```
id, eventId, placeId,
date, time, durationMinutes,
name (optional override), description (optional override),
ticketUrl, imageUrl,
createdAt, updatedAt
```

### User / List-Scoped Models

#### `List`
A named, curated collection of ListItems. Owned by a user, optionally shared with others.
```
id, name, description, coverImageUrl,
ownerId, memberIds[],
tags[],
createdAt, updatedAt
```

#### `ListItem`
A user's personal intent to experience something. Points to exactly one of: Place, Event, or Occurrence.
The polymorphic target captures the specificity of the user's intent.
```
id, listId,
targetType (place | event | occurrence),
targetId,
notes, priority (low | medium | high),
status (wanted | planned | done),
categoryId, tags[],
createdAt, updatedAt
```

#### `Category`
User-defined groupings within a List (e.g. "Restaurants", "Hiking", "Live Music").
```
id, listId, name, color
```

#### `Plan`
A concrete scheduled intention attached to a ListItem. Represents "we are actually doing this."
```
id, listItemId,
date, time, durationMinutes,
attendeeIds[], notes,
createdAt, updatedAt
```

#### `Memory`
A personal log created after completing a ListItem or Plan. Private to the user/group.
```
id, listItemId, planId (optional),
rating (1–5), notes,
photos[] (stored as URLs in Phase 1),
tags[], visitedAt,
createdAt, updatedAt
```

#### `User` (minimal for Phase 1)
```
id, name, avatarUrl
```

---

## Key Features & UI Behavior

### Lists View (home screen)
- Grid or list of the user's Lists
- Create new List flow: name, description, optional cover image

### List Detail View (main screen)
- Left/main panel: ListItems, filterable by category / tag / status
- Right panel (desktop) / toggle tab (mobile): Map showing pins for items with a known location
- Selecting a ListItem opens a detail drawer/panel

### Adding a ListItem (critical flow)
- Typeahead search input that queries Mapbox Geocoding (for Places) and suggests matches
- User selects a result → Place created or matched, ListItem pre-populated
- User can also search for Events or Occurrences from the global catalog
- Alternatively, user can manually enter all details
- The target type (Place / Event / Occurrence) is set based on what the user selects or enters

### ListItem Detail Drawer
- Shows target details (name, location, date if Occurrence, etc.)
- User notes, priority, status, tags, category
- Action buttons: Add Plan, Add Memory, Mark as Done
- Shows attached Plans and Memories inline

### Map Panel
- Pins rendered for all ListItems in the current List that resolve to a location
  - Place → uses Place lat/lng directly
  - Occurrence → uses its linked Place lat/lng
  - Event (no place) → no pin
- Clicking a pin highlights the corresponding ListItem and vice versa
- On mobile, map is accessible via a toggle/tab

### Plans
- Form: date, time, duration, attendees, notes
- Shown on ListItem detail and (future) a calendar/agenda view

### Memories
- Rich notes, star rating (1–5), photo URLs, tags, date visited
- Shown on ListItem detail after status is "done"

---

## Coding Conventions

### General
- TypeScript strict mode enabled (`"strict": true` in tsconfig)
- No `any` types — use `unknown` and narrow, or define proper interfaces
- All types and interfaces live in `src/types/` and are exported from an `index.ts` barrel file
- Prefer named exports over default exports (exception: route-level page components)

### React
- Functional components only — no class components
- Custom hooks for any non-trivial stateful logic (prefix with `use`)
- Keep components small; extract sub-components when a component exceeds ~150 lines
- Feature components live in `src/features/<feature>/` — not in `src/components/`
- `src/components/` is for truly shared, reusable UI primitives only

### Styling
- Tailwind utility classes only — no custom CSS files unless absolutely necessary
- Use shadcn/ui components as the base; extend via `className` prop with Tailwind
- Mobile-first responsive design: start with mobile layout, add `md:` / `lg:` breakpoints
- Do not hardcode colors — use Tailwind's theme tokens and shadcn CSS variables

### Data / API Layer
- All data fetching goes through `src/services/` functions — components never call `fetch()` directly
- All service functions are wrapped with TanStack Query (`useQuery` / `useMutation`)
- In Phase 1, service functions return mock data from `src/mock/`
- In Phase 2, service functions will call the FastAPI backend — the component layer should not change

### File Naming
- Components: `PascalCase.tsx`
- Hooks, utilities, services: `camelCase.ts`
- Types: `camelCase.types.ts` or grouped in `src/types/index.ts`

---

## Development Phases

### Phase 1 — Frontend (current)
- [ ] Project scaffold: Vite + React + TypeScript + Tailwind + shadcn/ui
- [ ] Docker Compose with frontend service only
- [ ] Mock data layer for all core types (Place, Event, Occurrence, List, ListItem, Plan, Memory)
- [ ] Lists home view and List creation flow
- [ ] List detail view with ListItem list and filters
- [ ] Add ListItem flow: typeahead search (Mapbox geocoding), manual entry, target type selection
- [ ] ListItem detail drawer
- [ ] Map panel with pins (react-map-gl)
- [ ] Plans: create and display
- [ ] Memories: create and display
- [ ] Category and tag filtering
- [ ] Responsive layout (desktop + mobile)

### Phase 2 — Backend & Persistence
- [ ] FastAPI app scaffold
- [ ] PostgreSQL + SQLAlchemy models matching the data model above
- [ ] Alembic migrations
- [ ] REST API endpoints for all entities
- [ ] Swap frontend mock layer for real API calls
- [ ] Auth (JWT or session-based)
- [ ] Photo upload (S3-compatible storage)
- [ ] Add `backend` and `db` services to Docker Compose

### Phase 3 — Enhancements (future)
- [ ] Global Place and Event pages (contributed by users, show all Occurrences)
- [ ] Follow a Place or Event (get notified of new Occurrences)
- [ ] Memory sharing / making a Memory public
- [ ] Real-time collaboration (WebSockets)
- [ ] Notifications / reminders for upcoming plans
- [ ] Public List sharing via link
- [ ] React Native mobile app (shares types and service layer logic)
- [ ] AI-powered item suggestions based on List contents

---

## Things to Avoid

- Do not use Create React App — use Vite
- Do not use Redux — use React Context or Zustand
- Do not install a separate icon library — Lucide is already available via shadcn/ui
- Do not write raw SQL — use SQLAlchemy ORM (Phase 2)
- Do not commit `.env` — only `.env.example`
- Do not put business logic in components — extract to hooks or services
- Do not use `px` units in Tailwind — use Tailwind's spacing scale
- Do not bypass the services layer — components never call `fetch()` directly
- Do not conflate the global catalog (Place, Event, Occurrence) with user data (List, ListItem) — they are separate concerns
