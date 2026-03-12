import { NextRequest, NextResponse } from "next/server";
import { getTicketById, updateTicket } from "@/lib/db";
import { TICKET_PRIORITIES, TICKET_STATUSES, TICKET_TYPES, type UpdateTicketInput } from "@/types/ticket";

export const runtime = "nodejs";

function parseTicketId(rawId: string): number | null {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

function isUpdatePayload(body: unknown): body is UpdateTicketInput {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const candidate = body as Record<string, unknown>;

  const titleOk = candidate.title === undefined || typeof candidate.title === "string";
  const descriptionOk = candidate.description === undefined || typeof candidate.description === "string";
  const typeOk =
    candidate.type === undefined ||
    (typeof candidate.type === "string" && TICKET_TYPES.includes(candidate.type as never));
  const statusOk =
    candidate.status === undefined ||
    (typeof candidate.status === "string" && TICKET_STATUSES.includes(candidate.status as never));
  const priorityOk =
    candidate.priority === undefined ||
    (typeof candidate.priority === "string" && TICKET_PRIORITIES.includes(candidate.priority as never));
  const assigneeOk = candidate.assignee === undefined || typeof candidate.assignee === "string";

  return titleOk && descriptionOk && typeOk && statusOk && priorityOk && assigneeOk;
}

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const params = await context.params;
  const id = parseTicketId(params.id);
  if (!id) {
    return NextResponse.json({ error: "Invalid ticket id" }, { status: 400 });
  }

  try {
    const ticket = await getTicketById(id);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load ticket", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const params = await context.params;
  const id = parseTicketId(params.id);
  if (!id) {
    return NextResponse.json({ error: "Invalid ticket id" }, { status: 400 });
  }

  try {
    const body: unknown = await request.json();
    if (!isUpdatePayload(body)) {
      return NextResponse.json({ error: "Invalid update payload" }, { status: 400 });
    }

    const ticket = await updateTicket(id, body);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update ticket", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}