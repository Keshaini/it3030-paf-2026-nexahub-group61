import { useState } from "react";

const TYPES    = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const STATUSES = ["ACTIVE", "OUT_OF_SERVICE"];

const inputStyle = {
  width: "100%", padding: "8px 12px",
  border: "1px solid var(--color-border-secondary)",
  borderRadius: "8px", fontSize: "13px",
  background: "var(--color-background-primary)",
  color: "var(--color-text-primary)",
  outline: "none",
};

const labelStyle = {
  display: "block", fontSize: "12px", fontWeight: 500,
  color: "var(--color-text-secondary)", marginBottom: "5px",
};

export default function ResourceForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    name:              initial.name              || "",
    type:              initial.type              || "LECTURE_HALL",
    location:          initial.location          || "",
    capacity:          initial.capacity          || "",
    availabilityStart: initial.availabilityStart || "08:00",
    availabilityEnd:   initial.availabilityEnd   || "18:00",
    description:       initial.description       || "",
    status:            initial.status            || "ACTIVE",
  });

  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim())     e.name     = "Name is required";
    if (!form.location.trim()) e.location = "Location is required";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit({ ...form, capacity: form.capacity ? Number(form.capacity) : null });
  }

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: undefined }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

        {/* Name */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Name *</label>
          <input value={form.name} onChange={set("name")} style={inputStyle}
            placeholder="e.g. Lab 301" />
          {errors.name && <p style={{ fontSize: "11px", color: "var(--color-text-danger)", marginTop: "3px" }}>{errors.name}</p>}
        </div>

        {/* Type */}
        <div>
          <label style={labelStyle}>Type *</label>
          <select value={form.type} onChange={set("type")} style={inputStyle}>
            {TYPES.map(t => (
              <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label style={labelStyle}>Status</label>
          <select value={form.status} onChange={set("status")} style={inputStyle}>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label style={labelStyle}>Location *</label>
          <input value={form.location} onChange={set("location")} style={inputStyle}
            placeholder="e.g. Block A, Floor 3" />
          {errors.location && <p style={{ fontSize: "11px", color: "var(--color-text-danger)", marginTop: "3px" }}>{errors.location}</p>}
        </div>

        {/* Capacity */}
        <div>
          <label style={labelStyle}>Capacity</label>
          <input type="number" min="1" value={form.capacity}
            onChange={set("capacity")} style={inputStyle}
            placeholder="e.g. 40" />
        </div>

        {/* Availability */}
        <div>
          <label style={labelStyle}>Available from</label>
          <input type="time" value={form.availabilityStart}
            onChange={set("availabilityStart")} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Available until</label>
          <input type="time" value={form.availabilityEnd}
            onChange={set("availabilityEnd")} style={inputStyle} />
        </div>

        {/* Description */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={set("description")}
            style={{ ...inputStyle, resize: "vertical", minHeight: "72px" }}
            placeholder="Optional — e.g. Has projector, whiteboard, AC" />
        </div>

      </div>

      <button type="submit" disabled={loading} style={{
        marginTop: "18px", padding: "10px 24px",
        background: "var(--color-text-info)", color: "#fff",
        border: "none", borderRadius: "8px", fontSize: "13px",
        fontWeight: 500, cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
      }}>
        {loading ? "Saving…" : "Save Resource"}
      </button>
    </form>
  );
}