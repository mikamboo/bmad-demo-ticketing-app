"use client";

import { TICKET_PRIORITIES, TICKET_STATUSES, TICKET_TYPES, type Ticket } from "@/types/ticket";

interface Props {
  tickets: Ticket[];
  loading: boolean;
  onSelectTicket: (id: number) => void;
}

function statusChipClass(status: string): string {
  return `chip status-${status.toLowerCase().replace(/\s+/g, "-")}`;
}

function priorityChipClass(priority: string): string {
  return `chip priority-${priority.toLowerCase()}`;
}

export default function Dashboard({ tickets, loading, onSelectTicket }: Props): React.JSX.Element {
  const byStatus = Object.fromEntries(
    TICKET_STATUSES.map((s) => [s, tickets.filter((t) => t.status === s).length])
  ) as Record<string, number>;

  const byType = Object.fromEntries(
    TICKET_TYPES.map((type) => [type, tickets.filter((t) => t.type === type).length])
  ) as Record<string, number>;

  const byPriority = Object.fromEntries(
    TICKET_PRIORITIES.map((p) => [p, tickets.filter((t) => t.priority === p).length])
  ) as Record<string, number>;

  const total = tickets.length;
  const recentTickets = tickets.slice(0, 5);

  if (loading && total === 0) {
    return (
      <div className="dashboard">
        <div className="stat-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div className="stat-card" key={i}>
              <div className="skeleton skeleton-text" style={{ width: "50%" }} />
              <div className="skeleton" style={{ height: "2rem", width: "40%", marginTop: "0.5rem" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome */}
      <div className="dashboard-welcome">
        <div>
          <h1>Bonjour, Michael 👋</h1>
          <p>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-header"><span className="stat-label">Total</span><span className="stat-icon">🗂️</span></div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-header"><span className="stat-label">Ouverts</span><span className="stat-icon">🔵</span></div>
          <div className="stat-value">{byStatus["Open"] ?? 0}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-header"><span className="stat-label">En cours</span><span className="stat-icon">⏳</span></div>
          <div className="stat-value">{byStatus["In Progress"] ?? 0}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-header"><span className="stat-label">Résolus</span><span className="stat-icon">✅</span></div>
          <div className="stat-value">{(byStatus["Resolved"] ?? 0) + (byStatus["Closed"] ?? 0)}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-header"><span className="stat-label">Haute priorité</span><span className="stat-icon">🔴</span></div>
          <div className="stat-value">{byPriority["High"] ?? 0}</div>
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="bar-grid">
        <div className="panel">
          <div className="panel-header">
            <strong>Par type</strong>
          </div>
          <div className="bar-list">
            {TICKET_TYPES.map((type) => {
              const count = byType[type] ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div className="bar-row" key={type}>
                  <div className="bar-label-row">
                    <span>{type}</span>
                    <span className="bar-count">{count}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <strong>Par priorité</strong>
          </div>
          <div className="bar-list">
            {TICKET_PRIORITIES.map((priority) => {
              const count = byPriority[priority] ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const barColor =
                priority === "High"
                  ? "var(--danger)"
                  : priority === "Medium"
                    ? "var(--warning)"
                    : "var(--muted)";
              return (
                <div className="bar-row" key={priority}>
                  <div className="bar-label-row">
                    <span className={priorityChipClass(priority)}>{priority}</span>
                    <span className="bar-count">{count}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent tickets */}
      <div className="panel">
        <div className="panel-header">
          <strong>Tickets récents</strong>
          <span className="chip default">5 derniers</span>
        </div>
        {recentTickets.length === 0 ? (
          <div style={{ padding: "1rem" }} className="muted">
            Aucun ticket. Créez votre premier ticket pour démarrer !
          </div>
        ) : (
          <div>
            {recentTickets.map((ticket) => (
              <div
                className="ticket-row"
                key={ticket.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectTicket(ticket.id)}
                onKeyUp={(e) => {
                  if (e.key === "Enter") onSelectTicket(ticket.id);
                }}
              >
                <div className="ticket-row-top">
                  <span className="ticket-id">#{ticket.id}</span>
                  <span className="ticket-title">{ticket.title}</span>
                </div>
                <div className="ticket-chips">
                  <span className={statusChipClass(ticket.status)}>{ticket.status}</span>
                  <span className={priorityChipClass(ticket.priority)}>{ticket.priority}</span>
                  <span className="chip default">{ticket.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
