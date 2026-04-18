import { useState, useEffect } from "react";
import { resourcesApi } from "../api/resourcesApi";
import ResourceCard from "../components/ResourceCard";

const TYPES = ["", "LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const TYPE_LABELS = {
  "": "All types", LECTURE_HALL: "Lecture Hall",
  LAB: "Lab", MEETING_ROOM: "Meeting Room", EQUIPMENT: "Equipment",
};

export default function ResourcesPage() {
  const [resources,    setResources]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [filters,      setFilters]      = useState({
    type: "", location: "", minCapacity: "",
  });

  useEffect(() => {
    setLoading(true);
    resourcesApi.getAll({
      type:        filters.type        || undefined,
      location:    filters.location    || undefined,
      minCapacity: filters.minCapacity || undefined,
      status:      "ACTIVE",
    })
      .then(setResources)
      .catch(() => setError("Failed to load resources"))
      .finally(() => setLoading(false));
  }, [filters]);

  const setFilter = (key) => (e) =>
    setFilters(f => ({ ...f, [key]: e.target.value }));

  const inputStyle = {
    padding: "7px 12px", fontSize: "13px",
    border: "1px solid var(--color-border-secondary)",
    borderRadius: "8px", background: "var(--color-background-primary)",
    color: "var(--color-text-primary)", outline: "none",
  };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "32px 24px" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 500, margin: "0 0 4px",
          color: "var(--color-text-primary)" }}>
          Resources catalogue
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", margin: 0 }}>
          Browse and book lecture halls, labs, meeting rooms and equipment.
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px",
      }}>
        <select value={filters.type} onChange={setFilter("type")} style={inputStyle}>
          {TYPES.map(t => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>

        <input
          value={filters.location} onChange={setFilter("location")}
          placeholder="Filter by location"
          style={{ ...inputStyle, minWidth: "180px" }}
        />

        <input
          type="number" min="1"
          value={filters.minCapacity} onChange={setFilter("minCapacity")}
          placeholder="Min capacity"
          style={{ ...inputStyle, width: "130px" }}
        />

        {(filters.type || filters.location || filters.minCapacity) && (
          <button
            onClick={() => setFilters({ type: "", location: "", minCapacity: "" })}
            style={{
              padding: "7px 14px", fontSize: "13px", cursor: "pointer",
              border: "1px solid var(--color-border-secondary)",
              borderRadius: "8px", background: "none",
              color: "var(--color-text-secondary)",
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px",
          color: "var(--color-text-tertiary)", fontSize: "14px" }}>
          Loading resources…
        </div>
      ) : error ? (
        <div style={{ padding: "16px", borderRadius: "8px",
          background: "#FCEBEB", color: "#A32D2D", fontSize: "13px" }}>
          {error}
        </div>
      ) : resources.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px",
          color: "var(--color-text-tertiary)", fontSize: "14px" }}>
          No resources found matching your filters.
        </div>
      ) : (
        <>
          <div style={{ fontSize: "12px", color: "var(--color-text-tertiary)", marginBottom: "12px" }}>
            {resources.length} resource{resources.length !== 1 ? "s" : ""} found
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "12px",
          }}>
            {resources.map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>
        </>
      )}
    </div>
  );
}