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
  const isAdmin = false; 

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    type: "",
    location: "",
    minCapacity: "",
    sort: "name",
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
          sorted.sort((a, b) => b.capacity - a.capacity);
        }

        setResources(sorted);
      })
      .finally(() => setLoading(false));
  };

  const setFilter = (key) => (e) =>
    setFilters((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div style={container}>
      {/* HEADER */}
      <div style={header}>
        <div>
          <h1 style={title}>Explore Resources</h1>
          <p style={subtitle}>
            Find labs, lecture halls, and equipment available for booking
          </p>
        </div>
      </div>

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
        <div style={center}>Loading resources...</div>
      ) : (
        <div style={grid}>
          {resources.map((r) => (
            <div key={r.id} style={card}>
              {/* TYPE BADGE */}
              <div style={badge}>{TYPE_LABELS[r.type]}</div>

              {/* TITLE */}
              <h3 style={cardTitle}>{r.name}</h3>

              {/* DETAILS */}
              <p style={cardText}>📍 {r.location}</p>
              <p style={cardText}>👥 {r.capacity} seats</p>

              {/* STATUS */}
              <div style={status}>Available</div>

              {/* ACTION */}
              <button style={bookBtn}>View & Book</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* 🔥 STYLES (MATCH BOOKING UI) */

const container = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "30px 20px",
};

const header = {
  marginBottom: "20px",
};

const title = {
  fontSize: "26px",
  fontWeight: "700",
};

const subtitle = {
  color: "#6b7280",
};

const filterBox = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px",
  flexWrap: "wrap",
};

const input = {
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid #ddd",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: "18px",
};

const card = {
  background: "#fff",
  padding: "16px",
  borderRadius: "16px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  transition: "0.2s",
};

const badge = {
  background: "#e0f2fe",
  color: "#0369a1",
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  display: "inline-block",
  marginBottom: "8px",
};

const cardTitle = {
  fontSize: "18px",
  fontWeight: "600",
};

const cardText = {
  color: "#6b7280",
  fontSize: "14px",
};

const status = {
  marginTop: "8px",
  fontSize: "12px",
  background: "#dcfce7",
  color: "#166534",
  padding: "4px 8px",
  borderRadius: "999px",
  display: "inline-block",
};

const bookBtn = {
  marginTop: "12px",
  width: "100%",
  padding: "10px",
  borderRadius: "10px",
  background: "linear-gradient(to right, #2563eb, #3b82f6)",
  color: "#fff",
  border: "none",
  fontWeight: "500",
};

const center = {
  textAlign: "center",
  padding: "40px",
};