import { Link } from "react-router-dom";

const TYPE_COLORS = {
  LECTURE_HALL: { bg: "#E8F2FF", text: "#1D4ED8" },
  LAB: { bg: "#E6F9F1", text: "#047857" },
  MEETING_ROOM: { bg: "#F3F0FF", text: "#6D28D9" },
  EQUIPMENT: { bg: "#FFF4E5", text: "#B45309" },
};

const TYPE_LABELS = {
  LECTURE_HALL: "Lecture Hall",
  LAB: "Lab",
  MEETING_ROOM: "Meeting Room",
  EQUIPMENT: "Equipment",
};

export default function ResourceCard({ resource }) {
  const color = TYPE_COLORS[resource.type] || TYPE_COLORS.EQUIPMENT;

  return (
    <Link
      to={`/resources/${resource.id}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={card}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.boxShadow =
            "0 14px 32px rgba(0,0,0,0.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            "0 6px 18px rgba(0,0,0,0.05)";
        }}
      >
        {/* TOP ROW */}
        <div style={topRow}>
          {/* TYPE BADGE */}
          <span
            style={{
              ...badge,
              background: color.bg,
              color: color.text,
            }}
          >
            {TYPE_LABELS[resource.type]}
          </span>

          {/* STATUS BADGE */}
          <span
            style={{
              ...badge,
              background:
                resource.status === "ACTIVE" ? "#DCFCE7" : "#FEE2E2",
              color:
                resource.status === "ACTIVE" ? "#166534" : "#991B1B",
            }}
          >
            {resource.status === "ACTIVE"
              ? "Available"
              : "Unavailable"}
          </span>
        </div>

        {/* TITLE */}
        <div style={title}>{resource.name}</div>

        {/* LOCATION */}
        <div style={location}>📍 {resource.location}</div>

        {/* DETAILS */}
        <div style={details}>
          <span>
            👥 {resource.capacity ? `${resource.capacity} seats` : "N/A"}
          </span>

          <span>
            🕒{" "}
            {resource.availabilityStart
              ? `${resource.availabilityStart} - ${resource.availabilityEnd}`
              : "Flexible"}
          </span>
        </div>

        {/* CTA HINT (NEW 🔥) */}
        <div style={cta}>
          View details & book →
        </div>
      </div>
    </Link>
  );
}

/* 🔥 STYLES */

const card = {
  background: "#fff",
  border: "1px solid #f1f5f9",
  borderRadius: "16px",
  padding: "18px",
  transition: "all 0.25s ease",
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
};

const badge = {
  fontSize: "11px",
  fontWeight: 600,
  padding: "4px 10px",
  borderRadius: "999px",
};

const title = {
  fontSize: "16px",
  fontWeight: 600,
  color: "#111827",
};

const location = {
  fontSize: "13px",
  color: "#6b7280",
};

const details = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "12px",
  color: "#6b7280",
  paddingTop: "10px",
  borderTop: "1px dashed #e5e7eb",
};

const cta = {
  marginTop: "6px",
  fontSize: "13px",
  fontWeight: 500,
  color: "#2563eb",
};