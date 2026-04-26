import { useState, useEffect, useMemo } from "react";
import { resourcesApi } from "../api/resourcesApi";
import ResourceForm from "../components/ResourceForm";
import AdminLayout from "../layouts/AdminLayout";
import AdminCard from "../components/AdminCard";

export default function AdminResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // UI STATE
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 6;

  function loadResources() {
    setLoading(true);
    resourcesApi.getAll({})
      .then(setResources)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadResources();
  }, []);

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
      setResources(prev => prev.filter(r => r.id !== id));
    } catch {
      alert("Delete failed");
    } finally {
      setDeleteId(null);
    }
  }

  /* ================= FILTERED DATA ================= */

  const filtered = useMemo(() => {
    return resources
      .filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase())
      )
      .filter(r => (typeFilter ? r.type === typeFilter : true))
      .filter(r => (statusFilter ? r.status === statusFilter : true));
  }, [resources, search, typeFilter, statusFilter]);

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(filtered.length / pageSize);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  /* ================= STATS ================= */

  const stats = {
    total: resources.length,
    active: resources.filter(r => r.status === "ACTIVE").length,
    inactive: resources.filter(r => r.status !== "ACTIVE").length,
  };

  return (
    <div style={container}>

      {/* HEADER */}
      <div style={header}>
        <div>
          <h1 style={title}>Resource Management Dashboard</h1>
        </div>

        <button style={addBtn}
          onClick={() => { setEditTarget(null); setShowForm(true); }}>
          + Add Resource
        </button>
      </div>

      {/* STATS */}
      <div style={statsBox}>
        <Stat label="Total" value={stats.total} />
        <Stat label="Active" value={stats.active} />
        <Stat label="Inactive" value={stats.inactive} />
      </div>

      {/* FILTER BAR */}
      <div style={filterBar}>
        <input
          placeholder="Search resources..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={input}
        />

        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={input}>
          <option value="">All Types</option>
          <option value="LECTURE_HALL">Lecture Hall</option>
          <option value="LAB">Lab</option>
          <option value="MEETING_ROOM">Meeting Room</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={input}>
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* FORM */}
      {showForm && (
        <div style={formCard}>
          <ResourceForm
            initial={editTarget || {}}
            onSubmit={handleSubmit}
            loading={saving}
          />
        </div>
      )}

      {/* TABLE */}
      <div style={tableCard}>
        {loading ? (
          <div style={center}>Loading resources...</div>
        ) : paginated.length === 0 ? (
          <div style={center}>No matching resources found</div>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Type</th>
                <th style={th}>Location</th>
                <th style={th}>Capacity</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map(r => (
                <tr key={r.id}>
                  <td style={tdBold}>{r.name}</td>
                  <td style={td}>{r.type}</td>
                  <td style={td}>{r.location}</td>
                  <td style={td}>{r.capacity || "-"}</td>
                  <td style={td}>
                    <span style={badge(r.status)}>
                      {r.status}
                    </span>
                  </td>
                  <td style={td}>
                    <button style={editBtn}
                      onClick={() => { setEditTarget(r); setShowForm(true); }}>
                      Edit
                    </button>

                    <button style={deleteBtn(deleteId === r.id)}
                      onClick={() => handleDelete(r.id)}>
                      {deleteId === r.id ? "..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div style={pagination}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                style={{
                  ...pageBtn,
                  background: page === i + 1 ? "#2563eb" : "#fff",
                  color: page === i + 1 ? "#fff" : "#000",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function Stat({ label, value }) {
  return (
    <div style={statCard}>
      <div style={{ fontSize: "18px", fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: "12px", color: "#6b7280" }}>{label}</div>
    </div>
  );
}

/* ================= STYLES ================= */

const container = { maxWidth: "1100px", margin: "0 auto", padding: "30px" };

const header = { display: "flex", justifyContent: "space-between", marginBottom: "16px" };

const title = { margin: 0, fontSize: "22px" };

const subtitle = { fontSize: "13px", color: "#6b7280" };

const addBtn = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
};

const statsBox = {
  display: "flex",
  gap: "12px",
  marginBottom: "16px",
};

const statCard = {
  flex: 1,
  padding: "12px",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  background: "#fff",
};

const filterBar = {
  display: "flex",
  gap: "10px",
  marginBottom: "16px",
};

const input = {
  padding: "8px",
  borderRadius: "8px",
  border: "1px solid #ddd",
};

const tableCard = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  overflow: "hidden",
};

const table = { width: "100%", borderCollapse: "collapse" };

const th = {
  textAlign: "left",
  padding: "10px",
  background: "#f9fafb",
  fontSize: "12px",
};

const td = { padding: "10px", borderTop: "1px solid #eee" };

const tdBold = { ...td, fontWeight: 500 };

const badge = (status) => ({
  padding: "3px 8px",
  borderRadius: "12px",
  fontSize: "11px",
  background: status === "ACTIVE" ? "#dcfce7" : "#fee2e2",
  color: status === "ACTIVE" ? "#166534" : "#991b1b",
});

const editBtn = {
  marginRight: "6px",
  padding: "4px 8px",
  fontSize: "12px",
};

const deleteBtn = (disabled) => ({
  padding: "4px 8px",
  fontSize: "12px",
  opacity: disabled ? 0.5 : 1,
});

const pagination = {
  display: "flex",
  gap: "6px",
  justifyContent: "center",
  padding: "10px",
};

const pageBtn = {
  padding: "4px 8px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  cursor: "pointer",
};

const center = {
  padding: "30px",
  textAlign: "center",
};

const formCard = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "16px",
  marginBottom: "16px",
};