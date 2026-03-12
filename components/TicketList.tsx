"use client";

import { TICKET_STATUSES, TICKET_TYPES, type Ticket, type TicketListFilters } from "@/types/ticket";

interface Props {
  tickets: Ticket[];
  selectedId: number | null;
  filters: TicketListFilters;
  onFiltersChange: (next: TicketListFilters) => void;
  onSelect: (id: number) => void;
}

export default function TicketList({
  tickets,
  selectedId,
  filters,
  onFiltersChange,
  onSelect
}: Props): React.JSX.Element {
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <strong>Tickets</strong>
          <div className="muted">{tickets.length} ticket(s)</div>
        </div>
      </div>

      <div className="toolbar">
        <select
          value={filters.type ?? "all"}
          onChange={(e) => onFiltersChange({ ...filters, type: e.target.value as TicketListFilters["type"] })}
        >
          <option value="all">Tous les types</option>
          {TICKET_TYPES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select
          value={filters.status ?? "all"}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              status: e.target.value as TicketListFilters["status"]
            })
          }
        >
          <option value="all">Tous les statuts</option>
          {TICKET_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select
          value={filters.sortBy ?? "updatedAt"}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              sortBy: e.target.value as TicketListFilters["sortBy"]
            })
          }
        >
          <option value="updatedAt">Tri: maj</option>
          <option value="createdAt">Tri: creation</option>
          <option value="priority">Tri: priorite</option>
          <option value="status">Tri: statut</option>
          <option value="title">Tri: titre</option>
        </select>

        <select
          value={filters.sortOrder ?? "desc"}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              sortOrder: e.target.value as TicketListFilters["sortOrder"]
            })
          }
        >
          <option value="desc">Descendant</option>
          <option value="asc">Ascendant</option>
        </select>
      </div>

      <div className="ticket-list">
        {tickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎫</div>
            <p><strong>Aucun ticket trouvé</strong></p>
            <p>Créez votre premier ticket pour démarrer.</p>
          </div>
        ) : null}

        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className={`ticket-row${selectedId === ticket.id ? " active" : ""}`}
            onClick={() => onSelect(ticket.id)}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                onSelect(ticket.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="ticket-row-top">
              <span className="ticket-id">#{ticket.id}</span>
              <span className="ticket-title">{ticket.title}</span>
            </div>
            <div className="ticket-chips">
              <span className={`chip status-${ticket.status.toLowerCase().replace(" ", "-")}`}>
                {ticket.status}
              </span>
              <span className={`chip priority-${ticket.priority.toLowerCase()}`}>
                {ticket.priority}
              </span>
              <span className="chip default">{ticket.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}