import { Link } from "react-router-dom";

const TYPE_COLORS = {
  LECTURE_HALL: { bg: "#E8F2FF", text: "#1D4ED8" },
  LAB:          { bg: "#E6F9F1", text: "#047857" },
  MEETING_ROOM: { bg: "#F3F0FF", text: "#6D28D9" },
  EQUIPMENT:    { bg: "#FFF4E5", text: "#B45309" },
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
    <Link to={`/resources/${resource.id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          padding: "16px",
          transition: "all 0.25s ease",
          cursor: "pointer",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow =
            "0 10px 25px rgba(0,0,0,0.08)";
          e.currentTarget.style.borderColor = "#d1d5db";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.borderColor = "#e5e7eb";
        }}
      >
        {/* TOP ROW */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          {/* TYPE BADGE */}
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: "999px",
              background: color.bg,
              color: color.text,
            }}
          >
            {TYPE_LABELS[resource.type]}
          </span>

          {/* STATUS BADGE */}
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: "999px",
              background:
                resource.status === "ACTIVE" ? "#DCFCE7" : "#FEE2E2",
              color:
                resource.status === "ACTIVE" ? "#166534" : "#991B1B",
            }}
          >
            {resource.status === "ACTIVE" ? "Available" : "Unavailable"}
          </span>
        </div>

        {/* TITLE */}
        <div
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#111827",
            marginBottom: "4px",
          }}
        >
          {resource.name}
        </div>

        {/* LOCATION */}
        <div
          style={{
            fontSize: "12px",
            color: "#6b7280",
            marginBottom: "10px",
          }}
        >
          📍 {resource.location}
        </div>

        {/* DETAILS BOX */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#6b7280",
            paddingTop: "10px",
            borderTop: "1px dashed #e5e7eb",
          }}
        >
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
      </div>
    </Link>
  );
}