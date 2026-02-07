import React, { useEffect, useMemo, useState } from "react";

const MAX_ROWS = 8;

const CONFIGS = {
  secagem: {
    label: "Secagem",
    action: "Registrar Secagem",
  },
  preparto: {
    label: "Pré-parto",
    action: "Marcar Pré-parto",
  },
  parto: {
    label: "Parto",
    action: "Registrar Parto",
  },
};

const parseDateFlexible = (value) => {
  if (!value) return null;
  const str = String(value).trim();
  if (!str) return null;

  let match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const y = +match[1];
    const m = +match[2];
    const d = +match[3];
    const dt = new Date(y, m - 1, d);
    return Number.isFinite(+dt) ? dt : null;
  }

  match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const d = +match[1];
    const m = +match[2];
    const y = +match[3];
    const dt = new Date(y, m - 1, d);
    return Number.isFinite(+dt) ? dt : null;
  }

  return null;
};

const idadeTexto = (nascimento) => {
  const dt = parseDateFlexible(nascimento);
  if (!dt) return "—";

  const hoje = new Date();
  let meses = (hoje.getFullYear() - dt.getFullYear()) * 12 + (hoje.getMonth() - dt.getMonth());
  if (hoje.getDate() < dt.getDate()) meses -= 1;
  if (meses < 0) meses = 0;

  const anos = Math.floor(meses / 12);
  const rem = meses % 12;
  return `${anos}a ${rem}m`;
};

const startOfDay = (date) => {
  if (!date) return null;
  const dt = new Date(date);
  if (Number.isNaN(dt.getTime())) return null;
  dt.setHours(0, 0, 0, 0);
  return dt;
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
    const visibleRows = rows.slice(0, MAX_ROWS);
    const hiddenCount = rows.length - visibleRows.length;

    return (
      <div className="st-table-container">
        <div className="st-table-wrap">
          <table className="st-table">
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
                <th className="st-th st-td-center"><span className="st-th-label">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 && (
                <tr className="st-empty">
                  <td colSpan={6}>Nenhuma pendência para este período.</td>
                </tr>
              )}
              {visibleRows.map((item, idx) => {
                const animal = item?.animal || item || {};
                const numero = animal?.numero ?? "—";
                const brinco = animal?.brinco ?? "—";
                const animalLabel = animal?.nome ?? numero;
                const del = animal?.del ?? "—";
                const dpp = item?.dpp ?? animal?.dpp ?? animal?.data_prevista_parto;
                const ultimaIa = item?.ultima_ia ?? animal?.ultima_ia;
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
                const idade = idadeTexto(animal?.nascimento);

                return (
                  <tr key={`${tipo}-${animal?.id ?? animal?.animal_id ?? idx}`} className="st-row">
                    <td className="st-col-animal">
                      <div className="st-animal">
                        <span className="st-animal-num">{numero}</span>
                        <div className="st-animal-main">
                          <span className="st-animal-title">{animalLabel}</span>
                          <div className="st-animal-sub">
                            <span className="st-subitem">{idade}</span>
                            <span className="st-dot">•</span>
                            <span className="st-subitem">Brinco {brinco}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="st-td-right">
                      <span className="st-num">{del ?? "—"}</span>
                    </td>
                    <td>{fmtBR(ultimaIa)}</td>
                    <td>{fmtBR(dpp)}</td>
                    <td>{fmtBR(dataPrevSecagem)}</td>
                    <td className="st-td-center">
                      <button
                        type="button"
                        className="st-btn"
                        onClick={() => handleAction(tipo, animal)}
                      >
                        {CONFIGS[tipo].action}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {hiddenCount > 0 && (
              <tfoot>
                <tr className="st-empty">
                  <td colSpan={6}>
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

      <div>
        <span>Pendências baseadas na previsão de parto dos animais</span>
        {!hasDpp && <span> Nenhuma previsão de parto registrada.</span>}
      </div>

      <div>{renderPendenciasTable(activeList, pendTabAtiva)}</div>
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
};
