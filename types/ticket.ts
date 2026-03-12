export const TICKET_TYPES = [
  "Support utilisateur",
  "Component upgrade",
  "Incidents",
  "Ameliorations"
] as const;

export const TICKET_STATUSES = ["Open", "In Progress", "Resolved", "Closed"] as const;

export const TICKET_PRIORITIES = ["Low", "Medium", "High"] as const;

export type TicketType = (typeof TICKET_TYPES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export interface TicketComment {
  id: number;
  ticketId: number;
  author: string;
  content: string;
  createdAt: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
  createdAt: string;
  updatedAt: string;
  comments: TicketComment[];
}

export interface CreateTicketInput {
  title: string;
  description: string;
  type: TicketType;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignee?: string;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  type?: TicketType;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignee?: string;
}

export interface AddCommentInput {
  content: string;
  author?: string;
}

export interface TicketListFilters {
  type?: TicketType | "all";
  status?: TicketStatus | "all";
  sortBy?: "createdAt" | "updatedAt" | "priority" | "status" | "title";
  sortOrder?: "asc" | "desc";
}