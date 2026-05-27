import React, { useState, useEffect } from "react";

export default function TeamManagement({ token }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    year: "",
    branch: "",
    section: "",
    email: "",
    whatsapp: "",
    linkedin: "",
    instagram: "",
    photoUrl: "",
    githubUsername: "",
    leetcodeUsername: "",
  });
  const [editId, setEditId] = useState(null);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const base = (import.meta?.env?.VITE_API_BASE || "").replace(/\/+$/, "");
      const res = await fetch(`${base}/api/admin/core-team`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load team members");
      const data = await res.json();
      setTeam(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const base = (import.meta?.env?.VITE_API_BASE || "").replace(/\/+$/, "");
      const url = editId
        ? `${base}/api/admin/core-team/${editId}`
        : `${base}/api/admin/core-team`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save member");

      setFormData({
        name: "",
        role: "",
        year: "",
        branch: "",
        section: "",
        email: "",
        whatsapp: "",
        linkedin: "",
        instagram: "",
        photoUrl: "",
        githubUsername: "",
        leetcodeUsername: "",
      });
      setEditId(null);
      fetchTeam();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (member) => {
    setEditId(member.id);
    setFormData({
      name: member.name || "",
      role: member.role || "",
      year: member.year || "",
      branch: member.branch || "",
      section: member.section || "",
      email: member.email || "",
      whatsapp: member.whatsapp || "",
      linkedin: member.linkedin || "",
      instagram: member.instagram || "",
      photoUrl: member.photoUrl || "",
      githubUsername: member.githubUsername || "",
      leetcodeUsername: member.leetcodeUsername || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      const base = (import.meta?.env?.VITE_API_BASE || "").replace(/\/+$/, "");
      const res = await fetch(`${base}/api/admin/core-team/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete member");
      fetchTeam();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ marginTop: "3rem" }}>
      <h2
        style={{
          fontSize: "1.5rem",
          marginBottom: "1.5rem",
          color: "var(--t1)",
        }}
      >
        Team Management
      </h2>

      <div
        className="glass-panel"
        style={{
          padding: "2rem",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <h3 style={{ marginBottom: "1rem", color: "var(--c2)" }}>
          {editId ? "Edit Member" : "Add New Member"}
        </h3>
        {error && (
          <div style={{ color: "#ff375f", marginBottom: "1rem" }}>{error}</div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <input
            type="text"
            placeholder="Full Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field"
            required
          />
          <input
            type="text"
            placeholder="Role *"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="input-field"
            required
          />
          <input
            type="text"
            placeholder="Year *"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            className="input-field"
            required
          />
          <input
            type="text"
            placeholder="Branch *"
            value={formData.branch}
            onChange={(e) =>
              setFormData({ ...formData, branch: e.target.value })
            }
            className="input-field"
            required
          />
          <input
            type="text"
            placeholder="Section (A-Z) *"
            value={formData.section}
            onChange={(e) =>
              setFormData({ ...formData, section: e.target.value })
            }
            className="input-field"
            required
          />
          <input
            type="email"
            placeholder="Email *"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="input-field"
            required
          />
          <input
            type="text"
            placeholder="WhatsApp *"
            value={formData.whatsapp}
            onChange={(e) =>
              setFormData({ ...formData, whatsapp: e.target.value })
            }
            className="input-field"
            required
          />
          <input
            type="text"
            placeholder="Photo URL"
            value={formData.photoUrl}
            onChange={(e) =>
              setFormData({ ...formData, photoUrl: e.target.value })
            }
            className="input-field"
          />
          <input
            type="text"
            placeholder="LinkedIn URL"
            value={formData.linkedin}
            onChange={(e) =>
              setFormData({ ...formData, linkedin: e.target.value })
            }
            className="input-field"
          />
          <input
            type="text"
            placeholder="Instagram URL"
            value={formData.instagram}
            onChange={(e) =>
              setFormData({ ...formData, instagram: e.target.value })
            }
            className="input-field"
          />
          <input
            type="text"
            placeholder="GitHub Username"
            value={formData.githubUsername}
            onChange={(e) =>
              setFormData({ ...formData, githubUsername: e.target.value })
            }
            className="input-field"
          />
          <input
            type="text"
            placeholder="LeetCode Username"
            value={formData.leetcodeUsername}
            onChange={(e) =>
              setFormData({ ...formData, leetcodeUsername: e.target.value })
            }
            className="input-field"
          />

          <div
            style={{
              gridColumn: "span 2",
              display: "flex",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            <button type="submit" className="btn btn-primary">
              {editId ? "Update Member" : "Add Member"}
            </button>
            {editId && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setEditId(null);
                  setFormData({
                    name: "",
                    role: "",
                    year: "",
                    branch: "",
                    section: "",
                    email: "",
                    whatsapp: "",
                    linkedin: "",
                    instagram: "",
                    photoUrl: "",
                    githubUsername: "",
                    leetcodeUsername: "",
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "var(--c1)" }}>
          Existing Members
        </h3>
        {loading ? (
          <p>Loading team...</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {team.map((member) => (
              <div
                key={member.id}
                className="glass-panel"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold" }}>
                    {member.name}{" "}
                    <span
                      style={{
                        opacity: 0.6,
                        fontSize: "0.9rem",
                        fontWeight: "normal",
                      }}
                    >
                      ({member.role})
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      opacity: 0.8,
                      marginTop: "4px",
                    }}
                  >
                    {member.githubUsername && (
                      <span style={{ marginRight: "10px" }}>
                        GitHub: {member.githubUsername}
                      </span>
                    )}
                    {member.leetcodeUsername && (
                      <span>LeetCode: {member.leetcodeUsername}</span>
                    )}
                  </div>
                  {member.syncStatus === "error" && (
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "#ff375f",
                        marginTop: "4px",
                      }}
                    >
                      Sync Error: {member.syncErrorMessage}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => handleEdit(member)}
                    className="btn"
                    style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="btn"
                    style={{
                      padding: "4px 12px",
                      fontSize: "0.8rem",
                      background: "#ff375f",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {team.length === 0 && (
              <p style={{ opacity: 0.7 }}>No members found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
