import React, { useState, useEffect } from "react";
import { mentorshipService } from "../../services/mentorship";
import { useSocketSync } from "../../hooks/useSocketSync"; // We use the global socket connection here if needed for top-level updates
import { getSocket } from "../../services/socket";
import {
  Users,
  Code,
  PlusCircle,
  Star,
  ArrowRight,
  Clock,
  CheckCircle,
} from "lucide-react";
import "./Mentorship.css";

export default function MentorshipDashboard({ onBack, onOpenSession }) {
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Request Form
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [domains, setDomains] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchData();

    const socket = getSocket();
    const handleMatch = (req) => {
      setRequests((prev) => [req, ...prev.filter((r) => r.id !== req.id)]);
    };
    const handleNew = (req) => {
      setRequests((prev) => [req, ...prev]);
    };
    const handleStatus = (req) => {
      setRequests((prev) => prev.map((r) => (r.id === req.id ? req : r)));
    };

    socket.on("mentorship:match_found", handleMatch);
    socket.on("mentorship:new_request", handleNew);
    socket.on("mentorship:status_changed", handleStatus);

    return () => {
      socket.off("mentorship:match_found", handleMatch);
      socket.off("mentorship:new_request", handleNew);
      socket.off("mentorship:status_changed", handleStatus);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqData, mentorData] = await Promise.all([
        mentorshipService.getRequests(),
        mentorshipService.getMentors(),
      ]);
      setRequests(reqData);
      setMentors(mentorData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await mentorshipService.createRequest({
        title,
        description,
        codeSnippet,
        domains: domains
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean),
      });
      setShowForm(false);
      setTitle("");
      setDomains("");
      setCodeSnippet("");
      setDescription("");
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className="mentorship-dashboard"
      style={{
        padding: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
        color: "var(--t1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            background: "linear-gradient(90deg, #fff, var(--c1))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Mentorship & Code Review
        </h1>
        <button
          onClick={onBack}
          className="btn"
          style={{
            background: "var(--bg-glass)",
            border: "1px solid var(--b2)",
            color: "var(--t1)",
          }}
        >
          Back to Home
        </button>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
        <button
          className={`btn ${activeTab === "requests" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("requests")}
          style={{
            background:
              activeTab === "requests" ? "var(--c1)" : "var(--bg-glass)",
            color: "#fff",
            border: "none",
          }}
        >
          <Code size={18} style={{ marginRight: "8px" }} /> Active Requests
        </button>
        <button
          className={`btn ${activeTab === "mentors" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("mentors")}
          style={{
            background:
              activeTab === "mentors" ? "var(--c1)" : "var(--bg-glass)",
            color: "#fff",
            border: "none",
          }}
        >
          <Users size={18} style={{ marginRight: "8px" }} /> Mentor Leaderboard
        </button>
      </div>

      {activeTab === "requests" && (
        <div className="requests-view">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <h2 style={{ color: "var(--t1)" }}>Review Requests</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              <PlusCircle size={18} style={{ marginRight: "8px" }} /> New
              Request
            </button>
          </div>

          {showForm && (
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                padding: "24px",
                borderRadius: "12px",
                border: "1px solid var(--b2)",
                marginBottom: "24px",
              }}
            >
              <h3>Create Review Request</h3>
              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  marginTop: "16px",
                }}
              >
                <input
                  required
                  placeholder="Project / Component Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--b2)",
                    color: "#fff",
                    borderRadius: "8px",
                  }}
                />
                <input
                  required
                  placeholder="Domains (comma separated, e.g. React, Node)"
                  value={domains}
                  onChange={(e) => setDomains(e.target.value)}
                  className="form-input"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--b2)",
                    color: "#fff",
                    borderRadius: "8px",
                  }}
                />
                <textarea
                  placeholder="Describe what you need reviewed"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--b2)",
                    color: "#fff",
                    borderRadius: "8px",
                    minHeight: "100px",
                  }}
                />
                <textarea
                  required
                  placeholder="Paste your code snippet here"
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--b2)",
                    color: "#fff",
                    borderRadius: "8px",
                    minHeight: "200px",
                    fontFamily: "monospace",
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ alignSelf: "flex-start" }}
                >
                  Submit Request
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <p>Loading...</p>
          ) : requests.length === 0 ? (
            <p style={{ color: "var(--t2)" }}>No active requests found.</p>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {requests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    padding: "20px",
                    background: "var(--bg-glass)",
                    border: "1px solid var(--b2)",
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h3 style={{ marginBottom: "8px", color: "var(--t1)" }}>
                      {req.title}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                        color: "var(--t2)",
                        fontSize: "0.9rem",
                      }}
                    >
                      <span
                        style={{
                          padding: "4px 8px",
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: "4px",
                        }}
                      >
                        {req.status.toUpperCase()}
                      </span>
                      {req.mentorName && <span>Mentor: {req.mentorName}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenSession(req.id)}
                    className="btn"
                    style={{
                      background: "var(--c1)",
                      color: "#fff",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    Join Session <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "mentors" && (
        <div className="mentors-view">
          <h2 style={{ color: "var(--t1)", marginBottom: "24px" }}>
            Top Mentors
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {mentors
              .sort((a, b) => b.rating - a.rating)
              .map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: "24px",
                    background: "var(--bg-glass)",
                    border: "1px solid var(--b2)",
                    borderRadius: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                    }}
                  >
                    <h3 style={{ margin: 0, color: "var(--t1)" }}>{m.name}</h3>
                    {m.isActive && (
                      <span
                        style={{
                          display: "inline-block",
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: "#22c55e",
                          boxShadow: "0 0 10px #22c55e",
                        }}
                        title="Online"
                      />
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginBottom: "16px",
                    }}
                  >
                    {m.domains.map((d) => (
                      <span
                        key={d}
                        style={{
                          fontSize: "0.8rem",
                          padding: "4px 8px",
                          background: "rgba(204,17,17,0.1)",
                          color: "var(--c1)",
                          borderRadius: "12px",
                          border: "1px solid rgba(204,17,17,0.2)",
                        }}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: "var(--t2)",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Star size={14} color="#fbbf24" /> {m.rating.toFixed(1)}
                    </span>
                    <span>{m.reviewsCompleted} reviews</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
