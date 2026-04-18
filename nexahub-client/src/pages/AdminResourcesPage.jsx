import { useState, useEffect } from "react";
import { resourcesApi } from "../api/resourcesApi";
import ResourceForm from "../components/ResourceForm";

export default function AdminResourcesPage() {
  const [resources,   setResources]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [deleteId,    setDeleteId]    = useState(null);

  function loadResources() {
    resourcesApi.getAll({}).then(setResources).finally(() => setLoading(false));
  }

  useEffect(() => { loadResources(); }, []);

  async function handleSubmit(data) {
    setSaving(true);
    try {
      if (editTarget) {
        await resourcesApi.update(editTarget.id, data);
      } else {
        await resourcesApi.create(data);
      }
      setShowForm(false);
      setEditTarget(null);
      loadResources();
    } catch {
      alert("Failed to save resource");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this resource?")) return;
    setDeleteId(id);
    try {
      await resourcesApi.delete(id);
      setResources(rs => rs.filter(r => r.id !== id));
    } catch {
      alert("Failed to delete resource");
    } finally {
      setDeleteId(null);
    }
  }

  const thStyle = {
    padding: "10px 14px", fontSize: "11px", fontWeight: 500,
    color: "var(--color-text-secondary)", textTransform: "uppercase",
    letterSpacing: ".05em", textAlign: "left",
    borderBottom: "1px solid var(--color-border-tertiary)",
  };
  const tdStyle = {
    padding: "12px 14px", fontSize: "13px",
    color: "var(--color-text-primary)",
    borderBottom: "1px solid var(--color-border-tertiary)",
  };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "32px 24px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 500, margin: 0,
          color: "var(--color-text-primary)" }}>
          Manage resources
        </h1>
        <button
          onClick={() => { setEditTarget(null); setShowForm(true); }}
          style={{
            padding: "8px 16px", background: "var(--color-text-info)",
            color: "#fff", border: "none", borderRadius: "8px",
            fontSize: "13px", fontWeight: 500, cursor: "pointer",
          }}
        >
          + Add resource
        </button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div style={{
          background: "var(--color-background-primary)",
          border: "1px solid var(--color-border-tertiary)",
          borderRadius: "12px", padding: "24px", marginBottom: "24px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: "18px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 500, margin: 0,
              color: "var(--color-text-primary)" }}>
              {editTarget ? "Edit resource" : "New resource"}
            </h2>
            <button
              onClick={() => { setShowForm(false); setEditTarget(null); }}
              style={{ background: "none", border: "none",
                cursor: "pointer", fontSize: "18px", color: "var(--color-text-tertiary)" }}
            >
              ×
            </button>
          </div>
          <ResourceForm
            initial={editTarget || {}}
            onSubmit={handleSubmit}
            loading={saving}
          />
        </div>
      )}

      {/* Table */}
      <div style={{
        background: "var(--color-background-primary)",
        border: "1px solid var(--color-border-tertiary)",
        borderRadius: "12px", overflow: "hidden",
      }}>
        {loading ? (
          <p style={{ padding: "32px", textAlign: "center",
            color: "var(--color-text-tertiary)", fontSize: "14px" }}>
            Loading…
          </p>
        ) : resources.length === 0 ? (
          <p style={{ padding: "32px", textAlign: "center",
            color: "var(--color-text-tertiary)", fontSize: "14px" }}>
            No resources yet. Add one above.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Name", "Type", "Location", "Capacity", "Status", "Actions"].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resources.map(r => (
                <tr key={r.id}>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{r.name}</td>
                  <td style={tdStyle}>{r.type.replace(/_/g, " ")}</td>
                  <td style={tdStyle}>{r.location}</td>
                  <td style={tdStyle}>{r.capacity ?? "—"}</td>
                  <td style={tdStyle}>
                    <span style={{
                      fontSize: "11px", fontWeight: 500, padding: "2px 8px",
                      borderRadius: "10px",
                      background: r.status === "ACTIVE" ? "#E1F5EE" : "#FCEBEB",
                      color:      r.status === "ACTIVE" ? "#0F6E56" : "#A32D2D",
                    }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => { setEditTarget(r); setShowForm(true); }}
                        style={{
                          padding: "4px 10px", fontSize: "12px", cursor: "pointer",
                          border: "1px solid var(--color-border-secondary)",
                          borderRadius: "6px", background: "none",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deleteId === r.id}
                        style={{
                          padding: "4px 10px", fontSize: "12px", cursor: "pointer",
                          border: "1px solid #F09595",
                          borderRadius: "6px", background: "none",
                          color: "#A32D2D",
                          opacity: deleteId === r.id ? 0.5 : 1,
                        }}
                      >
                        {deleteId === r.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}