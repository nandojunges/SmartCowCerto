import Card from "./Card";

export default function StatTile({ label, value, hint }) {
  return (
    <Card>
      <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700 }}>{value}</div>
      {hint ? <div style={{ marginTop: 4, fontSize: 12, color: "#475569" }}>{hint}</div> : null}
    </Card>
  );
}
