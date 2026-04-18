import { Link } from "react-router-dom";

const TYPE_COLORS = {
  LECTURE_HALL: { bg: "#E6F1FB", text: "#185FA5" },
  LAB:          { bg: "#E1F5EE", text: "#0F6E56" },
  MEETING_ROOM: { bg: "#EEEDFE", text: "#534AB7" },
  EQUIPMENT:    { bg: "#FAEEDA", text: "#854F0B" },
};

const TYPE_LABELS = {
  LECTURE_HALL: "Lecture Hall",
  LAB:          "Lab",
  MEETING_ROOM: "Meeting Room",
  EQUIPMENT:    "Equipment",
};

export default function ResourceCard({ resource }) {
  const color = TYPE_COLORS[resource.type] || TYPE_COLORS.EQUIPMENT;

  return (
    <Link to={`/resources/${resource.id}`} style={{ textDecoration: "none" }}>
      <div style={{
        background: "var(--color-background-primary)",
        border: "1px solid var(--color-border-tertiary)",
        borderRadius: "12px", padding: "18px 20px",
        cursor: "pointer",
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--color-border-secondary)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--color-border-tertiary)"}
      >
        {/* Type badge + status */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{
            fontSize: "11px", fontWeight: 500, padding: "2px 8px",
            borderRadius: "10px", background: color.bg, color: color.text,
          }}>
            {TYPE_LABELS[resource.type]}
          </span>
          <span style={{
            fontSize: "11px", fontWeight: 500, padding: "2px 8px", borderRadius: "10px",
            background: resource.status === "ACTIVE" ? "#E1F5EE" : "#FCEBEB",
            color:      resource.status === "ACTIVE" ? "#0F6E56" : "#A32D2D",
          }}>
            {resource.status === "ACTIVE" ? "Available" : "Out of service"}
          </span>
        </div>

        {/* Name */}
        <div style={{
          fontSize: "15px", fontWeight: 500,
          color: "var(--color-text-primary)", marginBottom: "4px",
        }}>
          {resource.name}
        </div>

        {/* Location */}
        <div style={{
          fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "8px",
        }}>
          {resource.location}
        </div>

        {/* Capacity + availability */}
        <div style={{ display: "flex", gap: "12px" }}>
          {resource.capacity && (
            <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>
              Capacity: {resource.capacity}
            </span>
          )}
          {resource.availabilityStart && (
            <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>
              {resource.availabilityStart} – {resource.availabilityEnd}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}