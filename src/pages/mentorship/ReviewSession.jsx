import React, { useState, useEffect } from "react";
import { useReviewSocket } from "../../hooks/useReviewSocket";
import { mentorshipService } from "../../services/mentorship";
import {
  ChevronLeft,
  Check,
  CheckCircle2,
  MessageSquare,
  Send,
} from "lucide-react";
import "./Mentorship.css";

export default function ReviewSession({ roomId, onBack }) {
  // Use anonymous details unless user context is available
  const [user] = useState({
    id: `user_${Math.random()}`,
    name: `User_${Math.floor(Math.random() * 1000)}`,
    color: "#cc1111",
  });
  const {
    connected,
    annotations,
    activeUsers,
    addAnnotation,
    resolveAnnotation,
    syncCursor,
  } = useReviewSocket(roomId, user);

  const [request, setRequest] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    // roomId is something like 'req_uuid' or 'review-uuid'
    const id = roomId.replace("review-", "");
    mentorshipService.getRequestById(id).then(setRequest).catch(console.error);
  }, [roomId]);

  const handleLineClick = (line) => {
    setSelectedLine(line);
    syncCursor(line, 0);
  };

  const handleAddAnnotation = (e) => {
    e.preventDefault();
    if (selectedLine !== null && draft.trim()) {
      addAnnotation(selectedLine, draft);
      setDraft("");
      setSelectedLine(null);
    }
  };

  const handleCompleteReview = async () => {
    if (!request) return;
    try {
      await mentorshipService.updateRequestStatus(request.id, "completed", {
        rating: 5,
      });
      setRequest({ ...request, status: "completed" });
    } catch (e) {
      console.error("Failed to complete review");
    }
  };

  if (!request)
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#fff" }}>
        Loading review session...
      </div>
    );

  const lines = request.codeSnippet.split("\n");

  return (
    <div className="review-session">
      <div className="review-header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={onBack}
            className="btn"
            style={{ background: "transparent", border: "none", color: "#fff" }}
          >
            <ChevronLeft />
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{request.title}</h2>
            <div style={{ fontSize: "0.8rem", color: "var(--t2)" }}>
              Status: {request.status.toUpperCase()}{" "}
              {connected ? "• Socket Connected" : "• Connecting..."}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {Object.values(activeUsers).map((u) => (
              <div
                key={u.id}
                title={u.name}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: u.color || "var(--c1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                {u.name.substring(0, 2).toUpperCase()}
              </div>
            ))}
          </div>
          {request.status !== "completed" && (
            <button
              className="btn btn-primary"
              onClick={handleCompleteReview}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <CheckCircle2 size={18} /> Complete Review
            </button>
          )}
        </div>
      </div>

      <div className="review-workspace">
        <div className="code-area">
          <pre
            style={{
              margin: 0,
              fontFamily: "monospace",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            {lines.map((lineText, idx) => {
              const lineNum = idx + 1;
              const hasAnnotation = annotations.some(
                (a) => a.line === lineNum && !a.resolved
              );
              return (
                <div
                  key={lineNum}
                  className={`code-line ${hasAnnotation ? "annotated" : ""} ${selectedLine === lineNum ? "selected" : ""}`}
                  onClick={() => handleLineClick(lineNum)}
                  style={{
                    background:
                      selectedLine === lineNum
                        ? "rgba(255,255,255,0.1)"
                        : undefined,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "40px",
                      color: "var(--t2)",
                      userSelect: "none",
                    }}
                  >
                    {lineNum}
                  </span>
                  <span>{lineText || " "}</span>
                </div>
              );
            })}
          </pre>
        </div>

        <div className="annotations-sidebar">
          <div style={{ padding: "16px", borderBottom: "1px solid var(--b2)" }}>
            <h3
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <MessageSquare size={18} /> Annotations
            </h3>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {selectedLine !== null && (
              <form onSubmit={handleAddAnnotation} className="annotation-form">
                <div style={{ fontSize: "0.85rem", color: "var(--t2)" }}>
                  Commenting on line {selectedLine}
                </div>
                <textarea
                  autoFocus
                  placeholder="Leave a comment..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--b2)",
                    color: "#fff",
                    borderRadius: "8px",
                    minHeight: "80px",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedLine(null)}
                    className="btn"
                    style={{
                      background: "transparent",
                      color: "var(--t1)",
                      border: "1px solid var(--b2)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Send size={16} /> Post
                  </button>
                </div>
              </form>
            )}

            {annotations
              .filter((a) => !a.resolved)
              .map((a) => (
                <div key={a.id} className="annotation-thread">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--c1)",
                        fontWeight: "bold",
                      }}
                    >
                      Line {a.line}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--t2)" }}>
                      {a.author}
                    </div>
                  </div>
                  <p
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "0.9rem",
                      lineHeight: "1.4",
                    }}
                  >
                    {a.text}
                  </p>
                  <button
                    onClick={() => resolveAnnotation(a.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#22c55e",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      padding: 0,
                    }}
                  >
                    <Check size={14} /> Resolve
                  </button>
                </div>
              ))}

            {annotations.filter((a) => !a.resolved).length === 0 &&
              selectedLine === null && (
                <div
                  style={{
                    padding: "32px",
                    textAlign: "center",
                    color: "var(--t2)",
                  }}
                >
                  Click on any line of code to add an annotation.
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
