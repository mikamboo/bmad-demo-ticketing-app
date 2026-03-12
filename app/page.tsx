"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Dashboard from "@/components/Dashboard";
import TicketDetail from "@/components/TicketDetail";
import TicketForm from "@/components/TicketForm";
import TicketList from "@/components/TicketList";
import type { Ticket, TicketListFilters } from "@/types/ticket";

type View = "dashboard" | "tickets";

export default function Page(): React.JSX.Element {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [view, setView] = useState<View>("dashboard");
  const [filters, setFilters] = useState<TicketListFilters>({
    type: "all",
    status: "all",
    sortBy: "updatedAt",
    sortOrder: "desc"
  });

  const queryString = useMemo(() => {
    const query = new URLSearchParams();
    if (filters.type) query.set("type", filters.type);
    if (filters.status) query.set("status", filters.status);
    if (filters.sortBy) query.set("sortBy", filters.sortBy);
    if (filters.sortOrder) query.set("sortOrder", filters.sortOrder);
    return query.toString();
  }, [filters]);

  const loadTickets = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/tickets?${queryString}`);
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Impossible de charger les tickets");
      }
      const payload = (await response.json()) as { tickets: Ticket[] };
      setTickets(payload.tickets);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const selectedTicket = tickets.find((t) => t.id === selectedId) ?? null;

  function handleSelect(id: number): void {
    setSelectedId(id);
    setView("tickets");
  }

  function handleCloseDetail(): void {
    setSelectedId(null);
  }

  function onCreated(ticket: Ticket): void {
    setShowCreate(false);
    setSelectedId(ticket.id);
    setView("tickets");
    void loadTickets();
  }

  function onUpdated(ticket: Ticket): void {
    setTickets((current) => current.map((item) => (item.id === ticket.id ? ticket : item)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="logo">
          <span className="logo-icon">🎫</span>
          Ticketing
        </span>
        <nav className="app-nav">
          <button
            type="button"
            className={`nav-btn${view === "dashboard" ? " active" : ""}`}
            onClick={() => setView("dashboard")}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`nav-btn${view === "tickets" ? " active" : ""}`}
            onClick={() => setView("tickets")}
          >
            {`Tickets${tickets.length > 0 ? ` (${tickets.length})` : ""}`}
          </button>
        </nav>
        <button className="btn primary" type="button" onClick={() => setShowCreate(true)}>
          + Nouveau ticket
        </button>
      </header>

      <main className="page">
        {error ? <div className="error-banner">{error}</div> : null}

        {view === "dashboard" ? (
          <Dashboard tickets={tickets} loading={loading} onSelectTicket={handleSelect} />
        ) : selectedId !== null ? (
          <div className="panel-shell">
            <TicketList
              tickets={tickets}
              selectedId={selectedId}
              onSelect={handleSelect}
              filters={filters}
              onFiltersChange={setFilters}
            />
            <TicketDetail ticket={selectedTicket} onUpdated={onUpdated} onClose={handleCloseDetail} />
          </div>
        ) : (
          <TicketList
            tickets={tickets}
            selectedId={null}
            onSelect={handleSelect}
            filters={filters}
            onFiltersChange={setFilters}
          />
        )}
      </main>

      {showCreate ? <TicketForm onClose={() => setShowCreate(false)} onCreated={onCreated} /> : null}
    </div>
  );
}