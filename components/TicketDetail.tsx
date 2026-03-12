"use client";

import { useEffect, useMemo, useState } from "react";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TICKET_TYPES,
  type Ticket,
  type UpdateTicketInput
} from "@/types/ticket";

interface Props {
  ticket: Ticket | null;
  onUpdated: (ticket: Ticket) => void;
  onClose: () => void;
}

function prettyDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR");
}

export default function TicketDetail({ ticket, onUpdated, onClose }: Props): React.JSX.Element {
  const [draft, setDraft] = useState<UpdateTicketInput>({});
  const [message, setMessage] = useState<string>("");
  const [commentText, setCommentText] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft({});
    setMessage("");
  }, [ticket?.id]);

  const effective = useMemo(() => {
    if (!ticket) {
      return null;
    }

    return {
      title: draft.title ?? ticket.title,
      description: draft.description ?? ticket.description,
      type: draft.type ?? ticket.type,
      status: draft.status ?? ticket.status,
      priority: draft.priority ?? ticket.priority,
      assignee: draft.assignee ?? ticket.assignee
    };
  }, [ticket, draft]);

  async function save(): Promise<void> {
    if (!ticket || !effective) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(effective)
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Erreur de mise a jour");
      }

      const payload = (await response.json()) as { ticket: Ticket };
      onUpdated(payload.ticket);
      setDraft({});
      setMessage("Modifications enregistrees.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur inattendue");
    } finally {
      setSaving(false);
    }
  }

  async function addComment(): Promise<void> {
    if (!ticket || !commentText.trim()) {
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText, author: "mock.user" })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Erreur d ajout de commentaire");
      }

      const refreshed = await fetch(`/api/tickets/${ticket.id}`);
      const payload = (await refreshed.json()) as { ticket: Ticket };
      onUpdated(payload.ticket);
      setCommentText("");
      setMessage("Commentaire ajoute.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur inattendue");
    } finally {
      setSaving(false);
    }
  }

  if (!ticket || !effective) {
    return (
      <div className="panel">
        <div className="panel-header">
          <strong>Détail ticket</strong>
          <button className="btn ghost" type="button" onClick={onClose}>✕</button>
        </div>
        <div className="detail-content">
          <p className="muted">Sélectionnez un ticket dans la liste pour voir les détails.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <strong>#{ticket.id} — {effective.title}</strong>
          <div className="muted">Créé le {prettyDate(ticket.createdAt)}</div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn primary" type="button" onClick={save} disabled={saving}>
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
          <button className="btn ghost" type="button" onClick={onClose} title="Fermer le détail">
            ✕
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="field">
          <label htmlFor="title-edit">Titre</label>
          <input
            id="title-edit"
            value={effective.title}
            onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div className="field">
          <label htmlFor="description-edit">Description</label>
          <textarea
            id="description-edit"
            rows={4}
            value={effective.description}
            onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="fields-grid">
          <div className="field">
            <label htmlFor="type-edit">Type</label>
            <select
              id="type-edit"
              value={effective.type}
              onChange={(e) => setDraft((prev) => ({ ...prev, type: e.target.value as UpdateTicketInput["type"] }))}
            >
              {TICKET_TYPES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="status-edit">Statut</label>
            <select
              id="status-edit"
              value={effective.status}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  status: e.target.value as UpdateTicketInput["status"]
                }))
              }
            >
              {TICKET_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="priority-edit">Priorité</label>
            <select
              id="priority-edit"
              value={effective.priority}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  priority: e.target.value as UpdateTicketInput["priority"]
                }))
              }
            >
              {TICKET_PRIORITIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="assignee-edit">Assigné à</label>
            <input
              id="assignee-edit"
              value={effective.assignee}
              onChange={(e) => setDraft((prev) => ({ ...prev, assignee: e.target.value }))}
            />
          </div>
        </div>

        <div className="field">
          <div className="section-title" style={{ marginBottom: "0.5rem" }}>Commentaires</div>
          <label htmlFor="new-comment">Nouveau commentaire</label>
          <textarea
            id="new-comment"
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <div className="actions">
            <button className="btn" type="button" onClick={addComment} disabled={saving}>
              Ajouter
            </button>
          </div>
        </div>

        <div className="comments">
          {ticket.comments.length === 0 ? <div className="muted">Pas encore de commentaires.</div> : null}
          {ticket.comments.map((comment) => (
            <div className="comment" key={comment.id}>
              <div className="content">{comment.content}</div>
              <div className="meta">
                {comment.author} • {prettyDate(comment.createdAt)}
              </div>
            </div>
          ))}
        </div>

        <div className="muted">Dernière mise à jour : {prettyDate(ticket.updatedAt)}</div>
        {message ? <div className={message.startsWith("Erreur") || message.startsWith("err") ? "error-msg" : "success-msg"}>{message}</div> : null}
      </div>
    </div>
  );
}