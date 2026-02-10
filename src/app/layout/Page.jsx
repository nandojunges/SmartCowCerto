export default function Page({ title, description, children }) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 22 }}>{title}</h1>
        {description ? <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>{description}</p> : null}
      </header>
      <div style={{ display: "grid", gap: 10 }}>{children}</div>
    </section>
  );
}
