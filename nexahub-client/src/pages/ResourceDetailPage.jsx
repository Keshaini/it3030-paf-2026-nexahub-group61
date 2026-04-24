import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resourcesApi } from "../api/resourcesApi";
import { useAuth } from "../context/AuthContext";

const TYPE_COLORS = {
  LECTURE_HALL: { bg: "#E6F1FB", text: "#185FA5", label: "Lecture Hall" },
  LAB:          { bg: "#E1F5EE", text: "#0F6E56", label: "Lab" },
  MEETING_ROOM: { bg: "#EEEDFE", text: "#534AB7", label: "Meeting Room" },
  EQUIPMENT:    { bg: "#FAEEDA", text: "#854F0B", label: "Equipment" },
};

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      alignItems: "center", padding: "12px 0",
      borderBottom: "1px solid var(--color-border-tertiary)",
    }}>
      <span style={{
        fontSize: "13px",
        color: "var(--color-text-secondary)",
      }}>
        {label}
      </span>
      <span style={{
        fontSize: "13px",
        color: "var(--color-text-primary)",
        fontWeight: 500,
      }}>
        {value}
      </span>
    </div>
  );
}

export default function ResourceDetailPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { isAdmin, user } = useAuth();

  const [resource, setResource] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    resourcesApi.getById(id)
      .then(setResource)
      .catch(() => setError("Resource not found or no longer available."))
      .finally(() => setLoading(false));
  }, [id]);

  // Loading state
  if (loading) return (
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "center", minHeight: "40vh",
      flexDirection: "column", gap: "12px",
    }}>
      <div style={{
        width: "28px", height: "28px",
        border: "3px solid var(--color-border-secondary)",
        borderTopColor: "var(--color-text-info)",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <span style={{
        fontSize: "13px",
        color: "var(--color-text-tertiary)",
      }}>
        Loading resource…
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // Error state
  if (error) return (
    <div style={{ maxWidth: "640px", margin: "40px auto", padding: "0 24px" }}>
      <Link to="/resources" style={{
        fontSize: "13px", color: "var(--color-text-secondary)",
        textDecoration: "none", display: "inline-block", marginBottom: "16px",
      }}>
        ← Back to catalogue
      </Link>
      <div style={{
        padding: "20px", borderRadius: "10px",
        background: "#FCEBEB", color: "#A32D2D",
        fontSize: "13px", lineHeight: 1.6,
      }}>
        {error}
      </div>
    </div>
  );

  const color    = TYPE_COLORS[resource.type] || TYPE_COLORS.EQUIPMENT;
  const isActive = resource.status === "ACTIVE";

  return (
    <div style={{
      maxWidth: "680px", margin: "0 auto", padding: "32px 24px",
    }}>

      {/* Back link */}
      <Link to="/resources" style={{
        fontSize: "13px", color: "var(--color-text-secondary)",
        textDecoration: "none", display: "inline-flex",
        alignItems: "center", gap: "4px", marginBottom: "20px",
      }}>
        ← Back to catalogue
      </Link>

      {/* Main card */}
      <div style={{
        background: "var(--color-background-primary)",
        border: "1px solid var(--color-border-tertiary)",
        borderRadius: "14px", overflow: "hidden",
      }}>

        {/* Header section */}
        <div style={{
          padding: "24px",
          borderBottom: "1px solid var(--color-border-tertiary)",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", marginBottom: "12px",
          }}>
            <span style={{
              fontSize: "11px", fontWeight: 500,
              padding: "3px 10px", borderRadius: "10px",
              background: color.bg, color: color.text,
            }}>
              {color.label}
            </span>
            <span style={{
              fontSize: "11px", fontWeight: 500,
              padding: "3px 10px", borderRadius: "10px",
              background: isActive ? "#E1F5EE" : "#FCEBEB",
              color:      isActive ? "#0F6E56" : "#A32D2D",
            }}>
              {isActive ? "Available" : "Out of Service"}
            </span>
          </div>

          <h1 style={{
            fontSize: "22px", fontWeight: 500,
            margin: "0 0 6px", color: "var(--color-text-primary)",
          }}>
            {resource.name}
          </h1>

          <p style={{
            fontSize: "14px", color: "var(--color-text-secondary)",
            margin: "0 0 4px", display: "flex", alignItems: "center", gap: "4px",
          }}>
            📍 {resource.location}
          </p>
        </div>

        {/* Details section */}
        <div style={{ padding: "4px 24px 12px" }}>

          <InfoRow
            label="Resource type"
            value={color.label}
          />
          <InfoRow
            label="Capacity"
            value={resource.capacity
              ? `${resource.capacity} people`
              : "Not specified"}
          />
          <InfoRow
            label="Available hours"
            value={resource.availabilityStart
              ? `${resource.availabilityStart} – ${resource.availabilityEnd}`
              : "Contact admin for availability"}
          />
          <InfoRow
            label="Current status"
            value={isActive ? "Available for booking" : "Not available"}
          />
        </div>

        {/* Description section */}
        {resource.description && (
          <div style={{
            padding: "14px 24px",
            borderTop: "1px solid var(--color-border-tertiary)",
            background: "var(--color-background-secondary)",
          }}>
            <div style={{
              fontSize: "11px", fontWeight: 500,
              color: "var(--color-text-tertiary)",
              textTransform: "uppercase", letterSpacing: "0.05em",
              marginBottom: "6px",
            }}>
              About this resource
            </div>
            <p style={{
              fontSize: "13px", color: "var(--color-text-secondary)",
              margin: 0, lineHeight: 1.6,
            }}>
              {resource.description}
            </p>
          </div>
        )}

        {/* Not logged in notice */}
        {!user && isActive && (
          <div style={{
            padding: "14px 24px",
            borderTop: "1px solid var(--color-border-tertiary)",
            background: "var(--color-background-info)",
            fontSize: "13px", color: "var(--color-text-info)",
          }}>
            Please sign in to book this resource.
          </div>
        )}

        {/* Out of service notice */}
        {!isActive && (
          <div style={{
            padding: "14px 24px",
            borderTop: "1px solid var(--color-border-tertiary)",
            background: "#FCEBEB",
            fontSize: "13px", color: "#A32D2D", lineHeight: 1.6,
          }}>
            This resource is currently out of service and cannot be booked.
            Please check back later or contact the admin.
          </div>
        )}

        {/* Action buttons */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid var(--color-border-tertiary)",
          display: "flex", gap: "10px", alignItems: "center",
        }}>

          {/* Book button — only if active and logged in */}
          {isActive && user && (
            <button
              onClick={() =>
                navigate(`/bookings/new?resourceId=${resource.id}
                &resourceName=${encodeURIComponent(resource.name)}`)}
              style={{
                padding: "10px 24px",
                background: "var(--color-text-info)",
                color: "#fff", border: "none",
                borderRadius: "8px", fontSize: "13px",
                fontWeight: 500, cursor: "pointer",
              }}
            >
              Book this resource
            </button>
          )}

          {/* Sign in to book */}
          {isActive && !user && (
            <Link to="/login" style={{
              padding: "10px 24px",
              background: "var(--color-text-info)",
              color: "#fff", borderRadius: "8px",
              fontSize: "13px", fontWeight: 500,
              textDecoration: "none",
            }}>
              Sign in to book
            </Link>
          )}

          {/* Admin edit button */}
          {isAdmin && (
            <Link
              to={`/admin/resources?edit=${resource.id}`}
              style={{
                padding: "10px 20px",
                border: "1px solid var(--color-border-secondary)",
                borderRadius: "8px", fontSize: "13px",
                textDecoration: "none",
                color: "var(--color-text-primary)",
              }}
            >
              Edit resource
            </Link>
          )}

        </div>
      </div>

      {/* Booking info box for students */}
      {isActive && user && !isAdmin && (
        <div style={{
          marginTop: "16px", padding: "14px 18px",
          background: "var(--color-background-secondary)",
          borderRadius: "10px", fontSize: "13px",
          color: "var(--color-text-secondary)", lineHeight: 1.6,
        }}>
          Bookings are subject to admin approval. You will receive a
          notification once your request is reviewed.
        </div>
      )}

    </div>
  );
}