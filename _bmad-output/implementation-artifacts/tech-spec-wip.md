---
title: "NextJS Ticketing Application MVP"
slug: "nextjs-ticketing-mvp"
created: "2026-03-12"
status: "Implementation Complete"
stepsCompleted: [1]
tech_stack: ["NextJS", "TypeScript", "SQLite", "React"]
files_to_modify: []
code_patterns: []
test_patterns: []
---

# Tech-Spec: NextJS Ticketing Application MVP

**Created:** 2026-03-12

## Overview

### Problem Statement

Need a lightweight, self-contained ticketing system for managing four types of tickets (Support utilisateur, Component upgrade, Incidents, Améliorations) with basic CRUD operations, built with modern web stack.

### Solution

Build a full-stack NextJS (TypeScript) application with SQLite backend for persistent storage, featuring a dual-pane interface (list + detail view) with inline editing capabilities, mock user authentication, and auto-managed database.

### Scope

**In Scope:**

- Create tickets with: title, description, type (Support/Upgrade/Incident/Amélioration), status, priority, assigned-to, timestamps, comments
- View all tickets in a filterable/sortable list
- Split-view detail panel for ticket inspection
- Edit tickets (any user, any field)
- Change status per ticket
- Filter by type and status
- Sort by various fields
- Comments on tickets (inline)
- SQLite database with automatic migrations
- Mock user system (dev environment)

**Out of Scope:**

- User authentication/permissions system
- Email notifications
- Multi-tenancy
- Real-time collaboration
- Analytics/reporting
- Deployment pipeline

## Context for Development

### Codebase Patterns

- NextJS TypeScript fullstack (API routes + React components)
- Functional components with React hooks
- Client-side data fetching with fetch API
- SQLite for local storage with auto-migrations
- Mock user context (hardcoded dev user)

### Files to Reference

| File                            | Purpose                                 |
| ------------------------------- | --------------------------------------- |
| `app/page.tsx`                  | Main ticket list + split view container |
| `app/api/tickets/route.ts`      | GET/POST tickets endpoint               |
| `app/api/tickets/[id]/route.ts` | GET/PUT/DELETE single ticket            |
| `app/api/db/init.ts`            | Database initialization + migrations    |
| `lib/db.ts`                     | SQLite connection + queries             |
| `components/TicketList.tsx`     | List view (filterable, sortable)        |
| `components/TicketDetail.tsx`   | Detail pane (read + inline edit)        |
| `types/ticket.ts`               | TypeScript interfaces                   |

### Technical Decisions

- **Database**: SQLite stored in `.db` file at project root for simplicity
- **Migrations**: Auto-run on app startup (check schema version, apply pending)
- **State Management**: React hooks + server state (no Redux/Zustand MVP)
- **Editing**: Inline form in detail pane, real-time validation feedback
- **Comments**: Stored as array in tickets table (JSON field) for MVP simplicity

## Implementation Plan

### Tasks

- [x] Create SQLite schema with migration versioning and indexes
- [x] Implement auto-migration on first DB access
- [x] Create database helper functions for create/read/update/list
- [x] Implement `GET /api/tickets` with filters and sort support
- [x] Implement `POST /api/tickets` with payload validation
- [x] Implement `GET /api/tickets/[id]` with 404 handling
- [x] Implement `PUT /api/tickets/[id]` with partial updates and validation
- [x] Implement `POST /api/tickets/[id]/comments` for comment persistence
- [x] Create `TicketList` with filter/sort toolbar
- [x] Create `TicketDetail` split pane with inline editing
- [x] Create `TicketForm` modal for ticket creation
- [x] Wire list, detail, creation, and refresh flows in app shell
- [x] Add loading/error states in UI and API
- [x] Add TypeScript domain types shared across UI and API
- [x] Add global styles for responsive desktop/mobile split view
- [x] Run TypeScript validation and production build successfully

### Acceptance Criteria

**Feature: Create Ticket**

- Given user is on list view, When they click "Create Ticket", Then a form modal appears
- When form is submitted with all required fields, Then ticket is created and appears in list
- When required fields are missing, Then validation error displays

**Feature: View Tickets List**

- Given user loads app, When page renders, Then all tickets display in a table with columns: title, type, status, priority, assignee
- When user clicks filter button, Then can filter by type and status
- When user clicks sort, Then list reorders by selected column
- When user clicks a ticket, Then detail pane loads on the right side

**Feature: View Ticket Detail**

- Given ticket is selected, When detail pane is visible, Then all fields display (title, description, type, status, priority, assignee, created_at, comments)
- When user hovers over editable fields, Then edit affordance appears

**Feature: Edit Ticket (Inline)**

- Given user is viewing ticket detail, When they click an editable field, Then field becomes inline editor
- When they save changes, Then API request is sent and detail pane updates
- When API succeeds, Then list view also reflects changes
- When API fails, Then error message displays and field reverts

**Feature: Change Status**

- Given ticket detail is open, When user clicks status dropdown, Then available statuses appear (Open, In Progress, Resolved, Closed)
- When new status is selected, Then ticket updates

**Feature: Add Comment**

- Given ticket detail is open, When user enters text in comment box and clicks "Add", Then comment appears in list
- When page refreshes, Then comments persist

### Acceptance Criteria

- [ ] SQLite database initializes on app startup with correct schema
- [ ] All CRUD operations work end-to-end
- [ ] List filters by type and status correctly
- [ ] Sorting works on all relevant columns
- [ ] Inline editing updates both API and UI
- [ ] Comments persist and display correctly
- [ ] No console errors or TypeScript violations
- [ ] Form validation prevents invalid data
- [ ] App loads in < 2 seconds

## Additional Context

### Dependencies

- `next`: Latest stable
- `typescript`: Latest
- `sqlite3` or `better-sqlite3`: For database
- `tailwindcss` (optional, for styling)

### Testing Strategy

**Manual Testing:**

- Create 5 test tickets with different types
- Test all filters/sorts
- Edit various fields, verify persistence
- Refresh page, verify data persists
- Add comments, refresh, verify persistence

**Edge Cases:**

- Empty list behavior
- Very long strings in title/description
- Special characters in fields
- Concurrent updates (if multiple tabs)

### Notes

- MVP keeps it simple: mock users, no real permissions
- Can extend later with real auth, multi-user tracking, notifications
- SQLite sufficient for single-user MVP; swap to PostgreSQL if multi-user needed
- Consider adding a "seed data" script for testing with sample tickets
