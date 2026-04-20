import { useState, useEffect } from "react";
import { resourcesApi } from "../api/resourcesApi";
import ResourceCard from "../components/ResourceCard";

const TYPES = ["", "LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];

const TYPE_LABELS = {
  "": "All types",
  LECTURE_HALL: "Lecture Hall",
  LAB: "Lab",
  MEETING_ROOM: "Meeting Room",
  EQUIPMENT: "Equipment",
};

export default function ResourcesPage() {
  const { isAdmin } = useAuth();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    type: "",
    location: "",
    minCapacity: "",
    sort: "name",
  });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    location: "",
    capacity: "",
    type: "LECTURE_HALL",
  });

  useEffect(() => {
    loadResources();
  }, [filters]);

  const loadResources = () => {
    setLoading(true);

    resourcesApi
      .getAll({
        type: filters.type || undefined,
        location: filters.location || undefined,
        minCapacity: filters.minCapacity || undefined,
        status: "ACTIVE",
      })
      .then((data) => {
        let sorted = [...data];

        if (filters.sort === "name") {
          sorted.sort((a, b) => a.name.localeCompare(b.name));
        }

        if (filters.sort === "capacity") {
          sorted.sort((a, b) => (b.capacity || 0) - (a.capacity || 0));
        }

        setResources(sorted);
      })
      .catch(() => setError("Failed to load resources"))
      .finally(() => setLoading(false));
  };

  const setFilter = (key) => (e) =>
    setFilters((f) => ({ ...f, [key]: e.target.value }));

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      location: "",
      capacity: "",
      type: "LECTURE_HALL",
    });
    setShowForm(true);
  };

  const openEdit = (resource) => {
    setEditing(resource);
    setForm(resource);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await resourcesApi.update(editing.id, form);
      } else {
        await resourcesApi.create(form);
      }
      setShowForm(false);
      loadResources();
    } catch (err) {
      alert("Error saving resource");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resource?")) return;

    try {
      await resourcesApi.delete(id);
      loadResources();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" }}>

      {/* HEADER */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 600 }}>
          Resources Catalogue
        </h1>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Search, filter and manage university resources
        </p>
      </div>

      {/* ADMIN ACTION */}
      {isAdmin && (
        <button onClick={openCreate} style={primaryBtn}>
          + Add Resource
        </button>
      )}

      {/* FILTERS */}
      <div style={filterBox}>
        <select value={filters.type} onChange={setFilter("type")} style={input}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>

        <input
          placeholder="Location"
          value={filters.location}
          onChange={setFilter("location")}
          style={input}
        />

        <input
          type="number"
          placeholder="Min capacity"
          value={filters.minCapacity}
          onChange={setFilter("minCapacity")}
          style={input}
        />

        <select value={filters.sort} onChange={setFilter("sort")} style={input}>
          <option value="name">Sort: Name</option>
          <option value="capacity">Sort: Capacity</option>
        </select>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div style={center}>Loading...</div>
      ) : error ? (
        <div style={errorBox}>{error}</div>
      ) : resources.length === 0 ? (
        <div style={center}>No resources found</div>
      ) : (
        <div style={grid}>
          {resources.map((r) => (
            <div key={r.id} style={{ position: "relative" }}>
              <ResourceCard resource={r} />

              {isAdmin && (
                <div style={adminActions}>
                  <button onClick={() => openEdit(r)} style={smallBtn}>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    style={dangerBtn}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showForm && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h3>{editing ? "Edit Resource" : "Add Resource"}</h3>

            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={input}
            />

            <input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              style={input}
            />

            <input
              type="number"
              placeholder="Capacity"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              style={input}
            />

            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              style={input}
            >
              {TYPES.filter((t) => t).map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </select>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button onClick={handleSave} style={primaryBtn}>
                Save
              </button>
              <button onClick={() => setShowForm(false)} style={cancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* STYLES */

const input = {
  padding: "8px",
  borderRadius: "8px",
  border: "1px solid #ddd",
};

const primaryBtn = {
  padding: "8px 12px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  marginBottom: "12px",
};

const cancelBtn = {
  padding: "8px 12px",
  background: "#e5e7eb",
  border: "none",
  borderRadius: "8px",
};

const filterBox = {
  display: "flex",
  gap: "10px",
  marginBottom: "15px",
  flexWrap: "wrap",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: "12px",
};

const center = {
  textAlign: "center",
  padding: "40px",
  color: "#6b7280",
};

const errorBox = {
  background: "#fee2e2",
  padding: "10px",
  borderRadius: "8px",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  width: "320px",
};

const adminActions = {
  display: "flex",
  gap: "6px",
  marginTop: "6px",
};

const smallBtn = {
  fontSize: "12px",
  padding: "4px 8px",
};

const dangerBtn = {
  fontSize: "12px",
  padding: "4px 8px",
  background: "#fee2e2",
  color: "#991b1b",
  border: "none",
};