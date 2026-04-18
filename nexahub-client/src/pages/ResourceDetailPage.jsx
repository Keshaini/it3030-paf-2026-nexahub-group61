import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resourcesApi } from "../api/resourcesApi";

const TYPE_COLORS = {
  LECTURE_HALL: { bg: "#E6F1FB", text: "#185FA5" },
  LAB:          { bg: "#E1F5EE", text: "#0F6E56" },
  MEETING_ROOM: { bg: "#EEEDFE", text: "#534AB7" },
  EQUIPMENT:    { bg: "#FAEEDA", text: "#854F0B" },
};

export default function ResourceDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { isAdmin }  = useAuth();
  const [resource, setResource] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    resourcesApi.getById(id)
      .then(setResource)
      .catch(() => setError("Resource not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ padding: "48px", textAlign: "center",
      color: "var(--color-text-tertiary)", fontSize: "14px" }}>
      Loading…
    </div>
  );

  if (error) return (
    <div style={{ padding: "32px 24px" }}>
      <div style={{ padding: "16px", borderRadius: "8px",
        background: "#FCEBEB", color: "#A32D2D", fontSize: "13px" }}>
        {error}
      </div>
    </div>
  );

  const color = TYPE_COLORS[resource.type] || TYPE_COLORS.EQUIPMENT;

  const Row = ({ label, value }) => value ? (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 0", borderBottom: "1px solid var(--color-border-tertiary)",
    }}>
      <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{label}</span>
      <span style={{ fontSize: "13px", color: "var(--color-text-primary)", fontWeight: 500 }}>{value}</span>
    </div>
  ) : null;

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 24px" }}>

      {/* Back link */}
      <Link to="/resources" style={{
        fontSize: "13px", color: "var(--color-text-secondary)",
        textDecoration: "none", display: "inline-flex", alignItems: "center",
        gap: "4px", marginBottom: "20px",
      }}>
        ← Back to catalogue
      </Link>

      {/* Card */}
      <div style={{
        background: "var(--color-background-primary)",
        border: "1px solid var(--color-border-tertiary)",
        borderRadius: "14px", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "24px", borderBottom: "1px solid var(--color-border-tertiary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{
              fontSize: "11px", fontWeight: 500, padding: "2px 8px",
              borderRadius: "10px", background: color.bg, color: color.text,
            }}>
              {resource.type.replace(/_/g, " ")}
            </span>
            <span style={{
              fontSize: "11px", fontWeight: 500, padding: "2px 8px", borderRadius: "10px",
              background: resource.status === "ACTIVE" ? "#E1F5EE" : "#FCEBEB",
              color:      resource.status === "ACTIVE" ? "#0F6E56" : "#A32D2D",
            }}>
              {resource.status === "ACTIVE" ? "Available" : "Out of service"}
            </span>
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 500, margin: "0 0 4px",
            color: "var(--color-text-primary)" }}>
            {resource.name}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: 0 }}>
            {resource.location}
          </p>
        </div>

        {/* Details */}
        <div style={{ padding: "4px 24px 8px" }}>
          <Row label="Capacity"        value={resource.capacity ? `${resource.capacity} people` : null} />
          <Row label="Available hours" value={resource.availabilityStart
            ? `${resource.availabilityStart} – ${resource.availabilityEnd}` : null} />
          <Row label="Description"     value={resource.description} />
        </div>

        {/* Actions */}
        <div style={{
          padding: "16px 24px", borderTop: "1px solid var(--color-border-tertiary)",
          display: "flex", gap: "10px",
        }}>
          {resource.status === "ACTIVE" && (
            <button
              onClick={() => navigate(`/bookings/new?resourceId=${resource.id}`)}
              style={{
                padding: "9px 20px", background: "var(--color-text-info)",
                color: "#fff", border: "none", borderRadius: "8px",
                fontSize: "13px", fontWeight: 500, cursor: "pointer",
              }}
            >
              Book this resource
            </button>
          )}
          {isAdmin && (
            <Link to={`/admin/resources?edit=${resource.id}`} style={{
              padding: "9px 20px",
              border: "1px solid var(--color-border-secondary)",
              borderRadius: "8px", fontSize: "13px",
              textDecoration: "none", color: "var(--color-text-primary)",
            }}>
              Edit
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}