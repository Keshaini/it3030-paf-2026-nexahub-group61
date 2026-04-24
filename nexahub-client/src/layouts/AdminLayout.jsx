export default function AdminLayout({ title, subtitle, actions, children }) {
  return (
    <div style={container}>

      {/* HEADER */}
      <div style={header}>
        <div>
          <h1 style={titleStyle}>{title}</h1>
          {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
        </div>

        <div>{actions}</div>
      </div>

      {/* CONTENT */}
      <div style={content}>
        {children}
      </div>

    </div>
  );
}

/* STYLES */

const container = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "30px 20px",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "18px",
};

const titleStyle = {
  margin: 0,
  fontSize: "22px",
  fontWeight: 600,
};

const subtitleStyle = {
  margin: "4px 0 0",
  fontSize: "13px",
  color: "#6b7280",
};

const content = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};