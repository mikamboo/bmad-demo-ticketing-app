import { NextRequest, NextResponse } from "next/server";
import { createTicket, listTickets } from "@/lib/db";
import { TICKET_PRIORITIES, TICKET_STATUSES, TICKET_TYPES, type CreateTicketInput } from "@/types/ticket";

export const runtime = "nodejs";

function isCreateTicketInput(body: unknown): body is CreateTicketInput {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const candidate = body as Record<string, unknown>;
  const hasValidTitle = typeof candidate.title === "string" && candidate.title.trim().length > 0;
  const hasValidDescription =
    typeof candidate.description === "string" && candidate.description.trim().length > 0;
  const hasValidType = typeof candidate.type === "string" && TICKET_TYPES.includes(candidate.type as never);

  const hasValidStatus =
    candidate.status === undefined ||
    (typeof candidate.status === "string" && TICKET_STATUSES.includes(candidate.status as never));
  const hasValidPriority =
    candidate.priority === undefined ||
    (typeof candidate.priority === "string" && TICKET_PRIORITIES.includes(candidate.priority as never));
  const hasValidAssignee = candidate.assignee === undefined || typeof candidate.assignee === "string";

  return (
    hasValidTitle &&
    hasValidDescription &&
    hasValidType &&
    hasValidStatus &&
    hasValidPriority &&
    hasValidAssignee
  );
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const params = request.nextUrl.searchParams;
    const tickets = await listTickets({
      type: (params.get("type") as never) ?? "all",
      status: (params.get("status") as never) ?? "all",
      sortBy: (params.get("sortBy") as never) ?? "updatedAt",
      sortOrder: (params.get("sortOrder") as never) ?? "desc"
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to list tickets", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    if (!isCreateTicketInput(body)) {
      return NextResponse.json({ error: "Invalid ticket payload" }, { status: 400 });
    }

    const ticket = await createTicket(body);
    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create ticket", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}