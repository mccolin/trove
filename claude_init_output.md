Phase 1 scaffold complete. Here's what was built:

  Structure

  - docker-compose.yml — frontend service on port 5173 with HMR volume mount
  - frontend/Dockerfile — node:20-alpine, npm run dev --host
  - Full src/ directory tree matching CLAUDE.md spec

  Frontend stack

  - Vite + React 18 + TypeScript (strict mode, @/ path alias)
  - Tailwind CSS v3 + shadcn CSS variables in index.css
  - shadcn/ui components: Button, Card, Badge, Input, Label, Textarea, Select, Tabs, Dialog, Avatar, Separator
  - TanStack Query for all data fetching (even against mock)
  - React Router v6 with /lists and /lists/:listId routes
  - React Hook Form + Zod on forms
  - react-map-gl wired up (shows a fallback message without a Mapbox token)

  Mock data layer

  All 8 core types populated: Places (6), Events (3), Occurrences (2), Lists (3), ListItems (8), Categories (7), Plans (2), Memories (2)

  Working UI

  - Lists page — grid of list cards, "New List" dialog
  - List detail page — filterable item list + map (desktop side-by-side, mobile tab toggle), item detail drawer with plans/memories, "Add to List" search dialog

  To run

  cp .env.example .env
  # optionally add your VITE_MAPBOX_TOKEN
  docker compose up

  Or locally without Docker: cd frontend && npm install && npm run dev
  