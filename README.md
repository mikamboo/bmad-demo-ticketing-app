# 🎫 Ticketing App

A lightweight, self-contained ticketing system built with **Next.js**, **TypeScript**, and **SQLite**. No external database required — everything runs locally with automatic schema migrations.

## Features

- **Dashboard** — stat cards, progress bars by type & priority, recent tickets
- **Ticket management** — create, view, update tickets with inline editing
- **4 ticket types** — Support utilisateur, Component upgrade, Incidents, Améliorations
- **Filtering & sorting** — filter by type/status, sort by any field
- **Comments** — add comments per ticket
- **Split view** — list panel + detail panel, shown on ticket click
- **Auto-migration** — SQLite schema versioned via `PRAGMA user_version`, runs on first start
- **Mock user** — single hardcoded dev user (`mock.user`), no auth required

## Tech Stack

| Layer    | Technology                           |
| -------- | ------------------------------------ |
| Frontend | Next.js 15 App Router + React 19     |
| Language | TypeScript 5 (strict mode)           |
| Backend  | Next.js API Routes (Node.js runtime) |
| Database | SQLite via `sqlite` + `sqlite3`      |
| Styling  | Custom CSS (no Tailwind)             |

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The SQLite database file (`tickets.db`) is created automatically at the project root on first run.

## Scripts

| Command             | Description                    |
| ------------------- | ------------------------------ |
| `npm run dev`       | Start development server       |
| `npm run build`     | Build for production           |
| `npm run start`     | Start production server        |
| `npm run typecheck` | Run TypeScript check (no emit) |

## Project Structure

```
├── app/
│   ├── api/
│   │   └── tickets/
│   │       ├── route.ts          # GET /api/tickets, POST /api/tickets
│   │       └── [id]/
│   │           ├── route.ts      # GET /api/tickets/:id, PUT /api/tickets/:id
│   │           └── comments/
│   │               └── route.ts  # POST /api/tickets/:id/comments
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # App shell + navigation
├── components/
│   ├── Dashboard.tsx             # Stats, charts, recent tickets
│   ├── TicketDetail.tsx          # Inline-editable ticket panel
│   ├── TicketForm.tsx            # Create ticket modal
│   └── TicketList.tsx            # Filterable/sortable list panel
├── lib/
│   └── db.ts                     # SQLite singleton, migrations, CRUD helpers
└── types/
    └── ticket.ts                 # Shared TypeScript types & constants
```

## API Reference

| Method | Endpoint                    | Description                                         |
| ------ | --------------------------- | --------------------------------------------------- |
| GET    | `/api/tickets`              | List tickets (with filters & sort via query params) |
| POST   | `/api/tickets`              | Create a ticket                                     |
| GET    | `/api/tickets/:id`          | Get a single ticket                                 |
| PUT    | `/api/tickets/:id`          | Update a ticket (partial)                           |
| POST   | `/api/tickets/:id/comments` | Add a comment                                       |

### Query Parameters (GET /api/tickets)

| Param       | Values                                                                                  |
| ----------- | --------------------------------------------------------------------------------------- |
| `type`      | `all` \| `Support utilisateur` \| `Component upgrade` \| `Incidents` \| `Ameliorations` |
| `status`    | `all` \| `Open` \| `In Progress` \| `Resolved` \| `Closed`                              |
| `sortBy`    | `updatedAt` \| `createdAt` \| `priority` \| `status` \| `title`                         |
| `sortOrder` | `asc` \| `desc`                                                                         |

## Database

The schema is managed automatically via versioned migrations in `lib/db.ts`. The database file is excluded from version control via `.gitignore`.

**Tables:**

- `tickets` — id, title, description, type, status, priority, assignee, priority_sort, created_at, updated_at
- `ticket_comments` — id, ticket_id (FK cascade), author, content, created_at
