import React, { useEffect, useMemo, useState } from "react";
import RegistrarParto from "./RegistrarParto";
import RegistrarSecagem from "./RegistrarSecagem";

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
  hasDpp = false,
}) {
  const [pendTabAtiva, setPendTabAtiva] = useState("secagem");
  const [modalSecagemOpen, setModalSecagemOpen] = useState(false);
  const [modalPartoOpen, setModalPartoOpen] = useState(false);
  const [animalSelecionado, setAnimalSelecionado] = useState(null);
  const [prePartoSelecionado, setPrePartoSelecionado] = useState(null);
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [hoveredColKey, setHoveredColKey] = useState(null);

  useEffect(() => {
    if (!CONFIGS[pendTabAtiva]) {
      setPendTabAtiva("secagem");
    }
  }, [pendTabAtiva]);

  useEffect(() => {
    if (!prePartoSelecionado) return;
    const timeout = setTimeout(() => setPrePartoSelecionado(null), 2000);
    return () => clearTimeout(timeout);
  }, [prePartoSelecionado]);

  const tabs = useMemo(() => Object.keys(CONFIGS), []);
  const activeList = pendencias?.[pendTabAtiva] || [];

  const handleAction = (tipo, animal) => {
    if (!animal) return;
    if (tipo === "secagem") {
      setAnimalSelecionado(animal);
      setModalSecagemOpen(true);
      return;
    }
    if (tipo === "parto") {
      setAnimalSelecionado(animal);
      setModalPartoOpen(true);
      return;
    }
    if (tipo === "preparto") {
      setPrePartoSelecionado(animal);
    }
  };

  const renderPendenciasTable = (rows, tipo) => {
    const visibleRows = rows.slice(0, MAX_ROWS);

    return (
      <section className="plantel-tabela-wrapper" style={styles.tableSection}>
        <div style={styles.card}>
          <div style={styles.tableContainer}>
            <table
              style={styles.table}
              onMouseLeave={() => {
                setHoveredRowId(null);
                setHoveredColKey(null);
              }}
            >
              <colgroup>
                <col style={{ width: "26%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "16%" }} />
              </colgroup>

              <thead>
                <tr>
                  {[
                    { key: "animal", label: "Animal" },
                    { key: "del", label: "DEL", align: "right" },
                    { key: "ultima_ia", label: "Última IA" },
                    { key: "prev_parto", label: "Prev. Parto" },
                    { key: "prev_secagem", label: "Prev. Secagem" },
                    { key: "acoes", label: "Ações", align: "center" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      style={{ ...styles.th, textAlign: col.align || "left" }}
                      onMouseEnter={() => setHoveredColKey(col.key)}
                    >
                      <span>{col.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {visibleRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        ...styles.td,
                        textAlign: "center",
                        padding: "48px",
                        color: "#64748b",
                        fontWeight: 500,
                      }}
                    >
                      Nenhuma pendência para este período.
                    </td>
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
                  const rowId = animal?.id ?? animal?.animal_id ?? idx;
                  const isHover = hoveredRowId === rowId;
                  const isColHover = (key) => hoveredColKey === key;

                  return (
                    <tr
                      key={`${tipo}-${rowId}`}
                      style={{
                        ...styles.tr,
                        ...(isHover ? styles.trHover : {}),
                        ...(isColHover("animal") ? styles.colHover : {}),
                      }}
                    >
                      <td
                        style={{
                          ...styles.td,
                          ...(isHover ? styles.trHover : {}),
                          ...(isColHover("animal") ? styles.colHover : {}),
                          ...(isHover && isColHover("animal") ? styles.cellHover : {}),
                        }}
                        onMouseEnter={() => {
                          setHoveredRowId(rowId);
                          setHoveredColKey("animal");
                        }}
                      >
                        <div style={styles.animalCell}>
                          <div style={styles.animalNum}>{numero}</div>
                          <div style={styles.animalInfo}>
                            <div style={styles.animalTitle}>{animalLabel}</div>
                            <div style={styles.animalSub}>
                              <span>{idade}</span>
                              <span style={styles.dot}>•</span>
                              <span>Brinco {brinco}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          textAlign: "right",
                          fontWeight: 700,
                          ...(isHover ? styles.trHover : {}),
                          ...(isColHover("del") ? styles.colHover : {}),
                          ...(isHover && isColHover("del") ? styles.cellHover : {}),
                        }}
                        onMouseEnter={() => {
                          setHoveredRowId(rowId);
                          setHoveredColKey("del");
                        }}
                      >
                        {del ?? "—"}
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          ...(isHover ? styles.trHover : {}),
                          ...(isColHover("ultima_ia") ? styles.colHover : {}),
                          ...(isHover && isColHover("ultima_ia") ? styles.cellHover : {}),
                        }}
                        onMouseEnter={() => {
                          setHoveredRowId(rowId);
                          setHoveredColKey("ultima_ia");
                        }}
                      >
                        {fmtBR(ultimaIa)}
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          ...(isHover ? styles.trHover : {}),
                          ...(isColHover("prev_parto") ? styles.colHover : {}),
                          ...(isHover && isColHover("prev_parto") ? styles.cellHover : {}),
                        }}
                        onMouseEnter={() => {
                          setHoveredRowId(rowId);
                          setHoveredColKey("prev_parto");
                        }}
                      >
                        {fmtBR(dpp)}
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          ...(isHover ? styles.trHover : {}),
                          ...(isColHover("prev_secagem") ? styles.colHover : {}),
                          ...(isHover && isColHover("prev_secagem") ? styles.cellHover : {}),
                        }}
                        onMouseEnter={() => {
                          setHoveredRowId(rowId);
                          setHoveredColKey("prev_secagem");
                        }}
                      >
                        {fmtBR(dataPrevSecagem)}
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          textAlign: "center",
                          ...(isHover ? styles.trHover : {}),
                          ...(isColHover("acoes") ? styles.colHover : {}),
                          ...(isHover && isColHover("acoes") ? styles.cellHover : {}),
                        }}
                        onMouseEnter={() => {
                          setHoveredRowId(rowId);
                          setHoveredColKey("acoes");
                        }}
                      >
                        <div style={styles.actionStack}>
                          <button
                            type="button"
                            style={{
                              ...styles.actionBtn,
                              ...(tipo === "secagem" ? styles.actionBtnSecagem : {}),
                              ...(tipo === "parto" ? styles.actionBtnParto : {}),
                            }}
                            onClick={() => handleAction(tipo, animal)}
                          >
                            {CONFIGS[tipo].action}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
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

      <RegistrarSecagem
        open={modalSecagemOpen}
        onClose={() => {
          setModalSecagemOpen(false);
          setAnimalSelecionado(null);
        }}
        animal={animalSelecionado}
        onSaved={() => {
          setModalSecagemOpen(false);
          setAnimalSelecionado(null);
        }}
      />

      <RegistrarParto
        open={modalPartoOpen}
        onClose={() => {
          setModalPartoOpen(false);
          setAnimalSelecionado(null);
        }}
        animal={animalSelecionado}
        onSaved={() => {
          setModalPartoOpen(false);
          setAnimalSelecionado(null);
        }}
      />
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
  tableSection: {
    marginTop: 0,
    padding: 0,
    overflow: "visible",
    borderRadius: 0,
    border: "none",
    boxShadow: "none",
    backgroundColor: "transparent",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    overflow: "hidden",
  },
  tableContainer: { overflowX: "auto" },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    fontSize: "14px",
    tableLayout: "fixed",
    minWidth: 760,
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
    userSelect: "none",
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
  tr: { transition: "background-color 0.15s ease", cursor: "default" },
  trHover: { backgroundColor: "#f8fafc" },
  colHover: { backgroundColor: "#f1f5f9" },
  cellHover: { backgroundColor: "#e2e8f0" },
  animalCell: { display: "flex", alignItems: "center", gap: "10px" },
  animalNum: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fce7f3",
    color: "#be185d",
    borderRadius: "10px",
    fontWeight: 800,
    fontSize: "13px",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    flexShrink: 0,
  },
  animalInfo: { display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 },
  animalTitle: { fontWeight: 700, color: "#0f172a", fontSize: "14px", lineHeight: 1.1 },
  animalSub: { fontSize: "12.5px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px", lineHeight: 1.1 },
  dot: { color: "#cbd5e1" },
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
  actionStack: { display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" },
  actionBtnSecagem: { backgroundColor: "#2563eb" },
  actionBtnParto: { backgroundColor: "#16a34a" },
};
