import React, { useEffect, useMemo, useState } from "react";

const MAX_ROWS = 8;

const CONFIGS = {
  secagem: {
    label: "Secagem",
    action: "Registrar Secagem",
    buttonStyle: { background: "#eef6ff", color: "#1e40af", borderColor: "rgba(37, 99, 235, 0.35)" },
  },
  preparto: {
    label: "Pré-parto",
    action: "Marcar Pré-parto",
    buttonStyle: { background: "#fff7ed", color: "#9a3412", borderColor: "rgba(154, 52, 18, 0.35)" },
  },
  parto: {
    label: "Parto",
    action: "Registrar Parto",
    buttonStyle: { background: "#ecfdf3", color: "#166534", borderColor: "rgba(22, 163, 74, 0.35)" },
  },
};

const startOfDay = (date) => {
  if (!date) return null;
  const dt = new Date(date);
  if (Number.isNaN(dt.getTime())) return null;
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const diffDays = (a, b) => {
  if (!a || !b) return null;
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
};

const fmtBR = (date) => {
  if (!date) return "—";
  const dt = new Date(date);
  if (Number.isNaN(dt.getTime())) return "—";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export default function ManejosPendentes({
  pendencias = { secagem: [], preparto: [], parto: [] },
  onAction,
  hasDpp = false,
}) {
  const [pendTabAtiva, setPendTabAtiva] = useState("secagem");

  useEffect(() => {
    if (!CONFIGS[pendTabAtiva]) {
      setPendTabAtiva("secagem");
    }
  }, [pendTabAtiva]);

  const tabs = useMemo(() => Object.keys(CONFIGS), []);
  const activeList = pendencias?.[pendTabAtiva] || [];

  const handleAction = (tipo, animal) => {
    if (onAction) {
      onAction({ tipo, animalId: animal?.animal_id ?? animal?.id, animal });
      return;
    }
  };

  const renderPendenciasTable = (rows, tipo) => {
    if (!rows.length) {
      return (
        <div style={styles.emptyState}>
          Nenhuma pendência para este período.
        </div>
      );
    }

    const visibleRows = rows.slice(0, MAX_ROWS);
    const hiddenCount = rows.length - visibleRows.length;
    const cfg = CONFIGS[tipo];

    return (
      <div className="st-table-container">
        <div className="st-table-wrap">
          <table className="st-table st-table--darkhead">
            <colgroup>
              <col style={{ width: "22%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "18%" }} />
            </colgroup>
            <thead>
              <tr>
                <th className="st-th"><span className="st-th-label">Animal</span></th>
                <th className="st-th st-td-right"><span className="st-th-label">DEL</span></th>
                <th className="st-th"><span className="st-th-label">Última IA</span></th>
                <th className="st-th"><span className="st-th-label">Prev. Parto</span></th>
                <th className="st-th"><span className="st-th-label">Prev. Secagem</span></th>
                <th className="st-th st-td-right"><span className="st-th-label">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((item, idx) => {
                const animal = item?.animal || item || {};
                const numero = animal?.numero ?? "—";
                const brinco = animal?.brinco ?? "—";
                const del = animal?.del ?? "—";
                const dpp = item?.dpp ?? animal?.dpp ?? animal?.data_prevista_parto;
                const ultimaIa = item?.ultima_ia ?? animal?.ultima_ia;
                const diasParaDpp =
                  Number.isFinite(item?.diasParaDpp)
                    ? item.diasParaDpp
                    : diffDays(startOfDay(new Date()), startOfDay(dpp));
                const dataPrevSecagem =
                  item?.dataPrevSecagem ??
                  (dpp
                    ? (() => {
                        const dt = startOfDay(dpp);
                        if (!dt) return null;
                        dt.setDate(dt.getDate() - 60);
                        return dt;
                      })()
                    : null);

                return (
                  <tr key={`${tipo}-${animal?.id ?? animal?.animal_id ?? idx}`} className="st-row">
                    <td className="st-col-animal">
                      <div style={styles.animalCell}>
                        <div style={styles.animalNum}>#{numero}</div>
                        <div style={styles.animalInfo}>
                          <span style={styles.animalTitle}>Brinco {brinco}</span>
                          <span style={styles.animalSub}>
                            {Number.isFinite(diasParaDpp) ? `${diasParaDpp} dias` : "—"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="st-td-right">
                      <span className="st-num">{del ?? "—"}</span>
                    </td>
                    <td>{fmtBR(ultimaIa)}</td>
                    <td>{fmtBR(dpp)}</td>
                    <td>{fmtBR(dataPrevSecagem)}</td>
                    <td className="st-td-right">
                      <button
                        type="button"
                        className="st-btn"
                        style={{
                          ...cfg.buttonStyle,
                          borderWidth: "1px",
                          borderStyle: "solid",
                        }}
                        onClick={() => handleAction(tipo, animal)}
                      >
                        {cfg.action}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {hiddenCount > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={6} style={styles.moreRow}>
                    +{hiddenCount} pendência{hiddenCount > 1 ? "s" : ""} ocultas
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.pillsContainer}>
        {tabs.map((key) => {
          const cfg = CONFIGS[key];
          const count = pendencias?.[key]?.length || 0;
          const isActive = pendTabAtiva === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setPendTabAtiva(key)}
              style={{
                ...styles.pill,
                ...(isActive ? styles.pillActive : {}),
              }}
            >
              <span style={styles.pillLabel}>{cfg.label}</span>
              <span style={{ ...styles.pillBadge, ...(isActive ? styles.pillBadgeActive : {}) }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div style={styles.infoBar}>
        <span style={styles.infoTitle}>Pendências baseadas na previsão de parto dos animais</span>
        {!hasDpp && <span style={styles.infoMuted}>Nenhuma previsão de parto registrada.</span>}
      </div>

      <div style={styles.tableBlock}>{renderPendenciasTable(activeList, pendTabAtiva)}</div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "16px",
  },
  pillsContainer: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    borderRadius: "999px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
    color: "#0f172a",
  },
  pillActive: {
    borderColor: "#1d4ed8",
    boxShadow: "0 6px 14px rgba(29, 78, 216, 0.12)",
  },
  pillLabel: {
    fontSize: "13px",
    fontWeight: 700,
  },
  pillBadge: {
    minWidth: "22px",
    height: "22px",
    padding: "0 8px",
    borderRadius: "999px",
    background: "#f1f5f9",
    color: "#475569",
    fontSize: "12px",
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pillBadgeActive: {
    background: "#1d4ed8",
    color: "#fff",
  },
  infoBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 12px",
    borderRadius: "10px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    fontSize: "12px",
  },
  infoTitle: {
    fontWeight: 700,
    color: "#1e293b",
  },
  infoMuted: {
    color: "#64748b",
  },
  tableBlock: {
    width: "100%",
  },
  emptyState: {
    padding: "18px",
    borderRadius: "12px",
    border: "1px dashed #cbd5f5",
    background: "#f8fafc",
    textAlign: "center",
    fontSize: "13px",
    color: "#64748b",
    fontWeight: 600,
  },
  animalCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  animalNum: {
    minWidth: "36px",
    height: "32px",
    borderRadius: "10px",
    background: "#e0f2fe",
    color: "#0c4a6e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "12px",
  },
  animalInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  animalTitle: {
    fontSize: "12.5px",
    fontWeight: 700,
    color: "#0f172a",
  },
  animalSub: {
    fontSize: "11px",
    color: "#64748b",
  },
  moreRow: {
    padding: "10px 14px",
    fontSize: "12px",
    color: "#64748b",
    textAlign: "right",
  },
};
