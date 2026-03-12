"use client";

import { useState } from "react";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TICKET_TYPES,
  type CreateTicketInput,
  type Ticket
} from "@/types/ticket";

interface Props {
  onClose: () => void;
  onCreated: (ticket: Ticket) => void;
}

const DEFAULT_FORM: CreateTicketInput = {
  title: "",
  description: "",
  type: "Support utilisateur",
  status: "Open",
  priority: "Medium",
  assignee: ""
};

export default function TicketForm({ onClose, onCreated }: Props): React.JSX.Element {
  const [form, setForm] = useState<CreateTicketInput>(DEFAULT_FORM);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === "Escape") onClose();
  }

  async function submit(): Promise<void> {
    setError("");

    if (!form.title.trim() || !form.description.trim()) {
      setError("Titre et description sont obligatoires.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur de creation");
      }

      const data = (await response.json()) as { ticket: Ticket };
      onCreated(data.ticket);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onKeyDown={handleKeyDown}>
      <div className="modal">
        <div className="panel-header">
          <strong>Nouveau ticket</strong>
          <button className="btn ghost" onClick={onClose} type="button" title="Fermer (Échap)">✕</button>
        </div>
        <div className="body">
          <div className="field">
            <label htmlFor="title">Titre</label>
            <input
              id="title"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="modal-form-grid">
            <div className="field">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as CreateTicketInput["type"] }))}
              >
                {TICKET_TYPES.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="priority">Priorité</label>
              <select
                id="priority"
                value={form.priority}
                onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as CreateTicketInput["priority"] }))}
              >
                {TICKET_PRIORITIES.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="status">Statut</label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as CreateTicketInput["status"] }))}
              >
                {TICKET_STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="assignee">Assigné à</label>
              <input
                id="assignee"
                value={form.assignee}
                placeholder="mock.user"
                onChange={(e) => setForm((prev) => ({ ...prev, assignee: e.target.value }))}
              />
            </div>
          </div>

          {error ? <p className="error-msg">{error}</p> : null}

          <div className="actions">
            <button className="btn" onClick={onClose} type="button" disabled={submitting}>
              Annuler
            </button>
            <button className="btn primary" onClick={submit} type="button" disabled={submitting}>
              {submitting ? "Création..." : "Créer le ticket"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}