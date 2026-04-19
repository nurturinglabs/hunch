"use client";

// Lightweight Markdown editor (textarea + live preview).
// PRD called for a rich text editor (Tiptap) but for v1 we keep it boring:
// Markdown is what Claude outputs and what we render to the parent.

import { useState } from "react";

export default function ReportEditor(props: {
  assessmentId: string;
  initialDraft: string;
  aiStatus: string;
  aiError?: string | null;
  finalized: boolean;
}) {
  const { assessmentId, initialDraft, aiStatus, aiError, finalized } = props;
  const [markdown, setMarkdown] = useState(initialDraft);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function save(action: "save" | "finalize") {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const r = await fetch(`/api/admin/reports/${assessmentId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ markdown, action }),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error || "Failed.");
      setMsg(action === "finalize" ? "Sent to parent." : "Saved.");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function retryAI() {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`/api/admin/reports/${assessmentId}/retry`, {
        method: "POST",
      });
      if (!r.ok) throw new Error("Retry failed.");
      setMsg("Re-running analysis. Refresh in a moment.");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-serif text-xl">Report draft</h2>
        <div className="text-xs text-hunch-muted">
          AI status: <strong>{aiStatus}</strong>
        </div>
      </div>

      {aiStatus === "failed" && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded p-3 text-sm">
          <div className="text-red-800">AI failed: {aiError}</div>
          <button
            onClick={retryAI}
            disabled={busy}
            className="mt-2 underline text-red-900"
          >
            Retry analysis
          </button>
        </div>
      )}

      {finalized && (
        <div className="mb-3 bg-green-50 border border-green-200 rounded p-3 text-sm text-green-900">
          Report finalized and emailed to parent.
        </div>
      )}

      <textarea
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        className="w-full h-[60vh] border border-hunch-ink/15 rounded-lg p-3 font-mono text-sm bg-white"
        placeholder={
          aiStatus === "running"
            ? "AI is drafting… refresh in a minute."
            : "Markdown report draft will appear here."
        }
      />

      {err && <div className="mt-2 text-sm text-red-700">{err}</div>}
      {msg && <div className="mt-2 text-sm text-green-700">{msg}</div>}

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => save("save")}
          disabled={busy || !markdown.trim()}
          className="border border-hunch-ink/15 bg-white rounded-lg px-4 py-2"
        >
          Save draft
        </button>
        <button
          onClick={() => save("finalize")}
          disabled={busy || !markdown.trim()}
          className="bg-hunch-accent text-white rounded-lg px-4 py-2"
        >
          Finalize & send to parent
        </button>
      </div>
    </div>
  );
}
