export default function AdminCard({ children }) {
  return <div style={card}>{children}</div>;
}

const card = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  overflow: "hidden",
};