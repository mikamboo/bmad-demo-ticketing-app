import path from "node:path";
import { open, type Database } from "sqlite";
import sqlite3 from "sqlite3";
import {
  type AddCommentInput,
  type CreateTicketInput,
  type Ticket,
  type TicketComment,
  type TicketListFilters,
  type TicketPriority,
  type TicketStatus,
  type TicketType,
  type UpdateTicketInput
} from "@/types/ticket";

const DB_PATH = path.join(process.cwd(), "tickets.db");

let dbPromise: Promise<Database> | undefined;

function toDbPriorityValue(priority: TicketPriority): number {
  if (priority === "High") {
    return 3;
  }
  if (priority === "Medium") {
    return 2;
  }
  return 1;
}

function fromDbTicket(row: Record<string, unknown>, comments: TicketComment[]): Ticket {
  return {
    id: Number(row.id),
    title: String(row.title),
    description: String(row.description),
    type: String(row.type) as TicketType,
    status: String(row.status) as TicketStatus,
    priority: String(row.priority) as TicketPriority,
    assignee: String(row.assignee),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    comments
  };
}

async function migrate(db: Database): Promise<void> {
  await db.exec("PRAGMA foreign_keys = ON;");

  const meta = (await db.get("PRAGMA user_version")) as { user_version: number };
  const version = meta?.user_version ?? 0;

  if (version < 1) {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Open',
        priority TEXT NOT NULL DEFAULT 'Medium',
        priority_sort INTEGER NOT NULL DEFAULT 2,
        assignee TEXT NOT NULL DEFAULT 'Unassigned',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ticket_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        author TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_tickets_type ON tickets(type);
      CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
      CREATE INDEX IF NOT EXISTS idx_tickets_updated_at ON tickets(updated_at);
    `);

    await db.exec("PRAGMA user_version = 1;");
  }
}

export async function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = open({
      filename: DB_PATH,
      driver: sqlite3.Database
    }).then(async (db) => {
      await migrate(db);
      return db;
    });
  }
  return dbPromise;
}

async function getCommentsForTicketIds(ticketIds: number[]): Promise<Map<number, TicketComment[]>> {
  const db = await getDb();
  const map = new Map<number, TicketComment[]>();

  if (ticketIds.length === 0) {
    return map;
  }

  const placeholders = ticketIds.map(() => "?").join(",");
  const rows = (await db.all(
    `
      SELECT id, ticket_id, author, content, created_at
      FROM ticket_comments
      WHERE ticket_id IN (${placeholders})
      ORDER BY created_at ASC
    `,
    ticketIds
  )) as Array<Record<string, unknown>>;

  for (const row of rows) {
    const ticketId = Number(row.ticket_id);
    const comment: TicketComment = {
      id: Number(row.id),
      ticketId,
      author: String(row.author),
      content: String(row.content),
      createdAt: String(row.created_at)
    };

    const existing = map.get(ticketId) ?? [];
    existing.push(comment);
    map.set(ticketId, existing);
  }

  return map;
}

export async function listTickets(filters: TicketListFilters): Promise<Ticket[]> {
  const db = await getDb();
  const clauses: string[] = [];
  const values: string[] = [];

  if (filters.type && filters.type !== "all") {
    clauses.push("type = ?");
    values.push(filters.type);
  }

  if (filters.status && filters.status !== "all") {
    clauses.push("status = ?");
    values.push(filters.status);
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

  const sortByMap: Record<NonNullable<TicketListFilters["sortBy"]>, string> = {
    createdAt: "created_at",
    updatedAt: "updated_at",
    priority: "priority_sort",
    status: "status",
    title: "title"
  };

  const sortBy = sortByMap[filters.sortBy ?? "updatedAt"];
  const sortOrder = filters.sortOrder === "asc" ? "ASC" : "DESC";

  const rows = (await db.all(
    `
      SELECT id, title, description, type, status, priority, assignee, created_at, updated_at
      FROM tickets
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
    `,
    values
  )) as Array<Record<string, unknown>>;

  const ids = rows.map((row) => Number(row.id));
  const commentsMap = await getCommentsForTicketIds(ids);

  return rows.map((row) => fromDbTicket(row, commentsMap.get(Number(row.id)) ?? []));
}

export async function getTicketById(id: number): Promise<Ticket | null> {
  const db = await getDb();
  const row = (await db.get(
    `
      SELECT id, title, description, type, status, priority, assignee, created_at, updated_at
      FROM tickets
      WHERE id = ?
    `,
    [id]
  )) as Record<string, unknown> | undefined;

  if (!row) {
    return null;
  }

  const commentsMap = await getCommentsForTicketIds([id]);
  return fromDbTicket(row, commentsMap.get(id) ?? []);
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const db = await getDb();
  const now = new Date().toISOString();

  const status = input.status ?? "Open";
  const priority = input.priority ?? "Medium";
  const assignee = input.assignee?.trim() ? input.assignee.trim() : "Unassigned";

  const result = await db.run(
    `
      INSERT INTO tickets(title, description, type, status, priority, priority_sort, assignee, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.title.trim(),
      input.description.trim(),
      input.type,
      status,
      priority,
      toDbPriorityValue(priority),
      assignee,
      now,
      now
    ]
  );

  const ticket = await getTicketById(Number(result.lastID));
  if (!ticket) {
    throw new Error("Ticket creation failed");
  }

  return ticket;
}

export async function updateTicket(id: number, input: UpdateTicketInput): Promise<Ticket | null> {
  const db = await getDb();
  const existing = await getTicketById(id);
  if (!existing) {
    return null;
  }

  const nextTitle = input.title !== undefined ? input.title.trim() : existing.title;
  const nextDescription = input.description !== undefined ? input.description.trim() : existing.description;
  const nextType = input.type ?? existing.type;
  const nextStatus = input.status ?? existing.status;
  const nextPriority = input.priority ?? existing.priority;
  const nextAssignee = input.assignee !== undefined ? input.assignee.trim() || "Unassigned" : existing.assignee;

  await db.run(
    `
      UPDATE tickets
      SET title = ?, description = ?, type = ?, status = ?, priority = ?, priority_sort = ?, assignee = ?, updated_at = ?
      WHERE id = ?
    `,
    [
      nextTitle,
      nextDescription,
      nextType,
      nextStatus,
      nextPriority,
      toDbPriorityValue(nextPriority),
      nextAssignee,
      new Date().toISOString(),
      id
    ]
  );

  return getTicketById(id);
}

export async function addComment(ticketId: number, input: AddCommentInput): Promise<TicketComment> {
  const db = await getDb();
  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    throw new Error("Ticket not found");
  }

  const author = input.author?.trim() ? input.author.trim() : "mock.user";
  const now = new Date().toISOString();

  const result = await db.run(
    `
      INSERT INTO ticket_comments(ticket_id, author, content, created_at)
      VALUES (?, ?, ?, ?)
    `,
    [ticketId, author, input.content.trim(), now]
  );

  return {
    id: Number(result.lastID),
    ticketId,
    author,
    content: input.content.trim(),
    createdAt: now
  };
}