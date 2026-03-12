import { NextRequest, NextResponse } from "next/server";
import { addComment } from "@/lib/db";

export const runtime = "nodejs";

function parseTicketId(rawId: string): number | null {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const params = await context.params;
  const id = parseTicketId(params.id);
  if (!id) {
    return NextResponse.json({ error: "Invalid ticket id" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as { content?: unknown; author?: unknown };
    if (typeof body.content !== "string" || body.content.trim().length === 0) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    if (body.author !== undefined && typeof body.author !== "string") {
      return NextResponse.json({ error: "Author must be a string" }, { status: 400 });
    }

    const comment = await addComment(id, {
      content: body.content,
      author: typeof body.author === "string" ? body.author : "mock.user"
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add comment", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}