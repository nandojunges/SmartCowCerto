import { useMemo, useState } from "react";

const PENDENTES = [
  { key: "secagem", label: "Secagem" },
  { key: "preparto", label: "Pré-parto" },
  { key: "parto", label: "Parto" },
];

export default function ManejosPendentes({ listas }) {
  const [active, setActive] = useState(null);

  const dados = useMemo(
    () => ({
      secagem: Array.isArray(listas?.secagem) ? listas.secagem : [],
      preparto: Array.isArray(listas?.preparto) ? listas.preparto : [],
      parto: Array.isArray(listas?.parto) ? listas.parto : [],
    }),
    [listas]
  );

  const handleToggle = (key) => {
    setActive((prev) => (prev === key ? null : key));
  };

  const activeList = active ? dados[active] : [];

  return (
    <div style={styles.wrapper}>
      <div style={styles.chipRow}>
        {PENDENTES.map((chip) => {
          const count = dados[chip.key]?.length ?? 0;
          const isActive = active === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => handleToggle(chip.key)}
              style={{
                ...styles.chip,
                ...(isActive ? styles.chipActive : null),
              }}
            >
              <span>{chip.label}</span>
              <span style={{ ...styles.chipCount, ...(isActive ? styles.chipCountActive : null) }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {active && (
        <div style={styles.card}>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <colgroup>
                <col style={{ width: "44%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={styles.th}>Animal</th>
                  <th style={styles.th}>Prev. Parto</th>
                  <th style={styles.th}>Dias</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {activeList.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={styles.emptyState}>
                      Nenhum animal elegível.
                    </td>
                  </tr>
                ) : (
                  activeList.map((item, index) => (
                    <tr key={`${active}-${index}`} style={styles.tr}>
                      <td style={styles.td}>{item?.animal || "—"}</td>
                      <td style={styles.td}>{item?.prevParto || "—"}</td>
                      <td style={styles.td}>{item?.dias || "—"}</td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <button type="button" style={styles.actionBtn}>
                          Ação
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "12px",
  },
  chipRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  chip: {
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    borderRadius: "999px",
    padding: "6px 12px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12.5px",
    fontWeight: 700,
    color: "#0f172a",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  chipActive: {
    backgroundColor: "#e0f2fe",
    borderColor: "#38bdf8",
    color: "#0c4a6e",
  },
  chipCount: {
    minWidth: "20px",
    height: "20px",
    borderRadius: "999px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 700,
    padding: "0 6px",
  },
  chipCountActive: {
    backgroundColor: "#bae6fd",
    color: "#075985",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    overflow: "hidden",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    fontSize: "14px",
    tableLayout: "fixed",
    minWidth: 640,
  },
  th: {
    padding: "12px 12px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: 700,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "2px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px 12px",
    borderBottom: "1px solid #f1f5f9",
    color: "#334155",
    fontSize: "14px",
    verticalAlign: "middle",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  tr: {
    transition: "background-color 0.15s ease",
  },
  emptyState: {
    padding: "20px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 600,
  },
  actionBtn: {
    padding: "6px 10px",
    backgroundColor: "#ec4899",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "12.5px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
};
