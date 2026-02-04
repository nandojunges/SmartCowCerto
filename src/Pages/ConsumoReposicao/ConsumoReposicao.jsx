import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Subpáginas reais do teu sistema
import Estoque from "./Estoque";
import Dieta from "./Dieta";
import Lotes from "./Lotes";
import Limpeza from "./Limpeza";
import CalendarioSanitario from "./CalendarioSanitario";

const LS_LAST_TAB = "consumo:subabas:last";

/* ========================= Tabs Modernas ========================= */
function ModernTabs({ selected, setSelected, contadores }) {
  const tabs = useMemo(
    () => [
      { id: "estoque", label: "Estoque", icon: "📦" },
      { id: "lotes", label: "Lotes", icon: "🏷️" },
      { id: "dieta", label: "Dietas", icon: "🌾" },
      { id: "limpeza", label: "Limpeza", icon: "🧹" },
      { id: "calendario", label: "Calendário Sanitário", icon: "📅" },
    ],
    []
  );

  const onKey = useCallback(
    (e) => {
      const idx = tabs.findIndex((t) => t.id === selected);
      if (idx === -1) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelected(tabs[(idx + 1) % tabs.length].id);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelected(tabs[(idx - 1 + tabs.length) % tabs.length].id);
      }
    },
    [selected, setSelected, tabs]
  );

  return (
    <div
      style={styles.tabsContainer}
      role="tablist"
      aria-label="Sub-abas de consumo e reposição"
      onKeyDown={onKey}
    >
      <div style={styles.tabsWrapper}>
        {tabs.map((t) => {
          const active = selected === t.id;
          const count = contadores?.[t.id];

          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              aria-controls={`pane-${t.id}`}
              onClick={() => setSelected(t.id)}
              tabIndex={active ? 0 : -1}
              style={{
                ...styles.tab,
                ...(active ? styles.tabActive : styles.tabInactive),
              }}
            >
              <span style={styles.tabIcon}>{t.icon}</span>
              <span style={styles.tabLabel}>{t.label}</span>

              {count !== null && count !== undefined && (
                <span
                  style={{
                    ...styles.badge,
                    ...(active ? styles.badgeActive : styles.badgeInactive),
                  }}
                >
                  {count}
                </span>
              )}

              {active && <div style={styles.activeIndicator} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ========================= Página Principal ========================= */
export default function ConsumoReposicao() {
  const [tab, setTab] = useState(() => {
    try {
      return localStorage.getItem(LS_LAST_TAB) || "estoque";
    } catch {
      return "estoque";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_LAST_TAB, tab);
    } catch {}
  }, [tab]);

  const [counts, setCounts] = useState({
    estoque: 0,
    lotes: 12,
    dieta: 3,
    limpeza: 8,
    calendario: 5,
  });

  // ✅ evita injetar CSS repetido (era um bug comum no teu snippet)
  const injectedRef = useRef(false);
  useEffect(() => {
    if (injectedRef.current) return;
    injectedRef.current = true;

    const hoverStyles = `
      tr:hover td { background-color: #f8fafc; }
      button:hover { opacity: 0.95; transform: translateY(-1px); }
      button:active { transform: translateY(0); }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = hoverStyles;
    document.head.appendChild(styleSheet);

    return () => {
      // opcional: remover ao desmontar
      if (styleSheet?.parentNode) styleSheet.parentNode.removeChild(styleSheet);
    };
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <ModernTabs selected={tab} setSelected={setTab} contadores={counts} />

        <div style={styles.content}>
          {tab === "estoque" && (
            <div id="pane-estoque" role="tabpanel" aria-labelledby="estoque">
              <Estoque
                onCountChange={(total) => {
                  setCounts((prev) => ({ ...prev, estoque: total }));
                }}
              />
            </div>
          )}

          {tab === "lotes" && (
            <div id="pane-lotes" role="tabpanel" aria-labelledby="lotes">
              <Lotes />
            </div>
          )}

          {tab === "dieta" && (
            <div id="pane-dieta" role="tabpanel" aria-labelledby="dieta">
              <Dieta />
            </div>
          )}

          {tab === "limpeza" && (
            <div id="pane-limpeza" role="tabpanel" aria-labelledby="limpeza">
              <Limpeza />
            </div>
          )}

          {tab === "calendario" && (
            <div id="pane-calendario" role="tabpanel" aria-labelledby="calendario">
              <CalendarioSanitario />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========================= Estilos ========================= */
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: "24px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },

  // Tabs
  tabsContainer: {
    marginBottom: "24px",
    position: "relative",
  },

  tabsWrapper: {
    display: "flex",
    gap: "4px",
    backgroundColor: "#f1f5f9",
    padding: "4px",
    borderRadius: "12px",
    width: "fit-content",
    border: "1px solid #e2e8f0",
  },

  tab: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
    background: "transparent",
  },

  tabInactive: {
    backgroundColor: "transparent",
    color: "#64748b",
  },

  tabActive: {
    backgroundColor: "#ffffff",
    color: "#0f172a",
    boxShadow:
      "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  },

  tabIcon: {
    fontSize: "16px",
  },

  tabLabel: {
    fontSize: "14px",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "20px",
    height: "20px",
    padding: "0 6px",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: 600,
  },

  badgeInactive: {
    backgroundColor: "#e2e8f0",
    color: "#64748b",
  },

  badgeActive: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
  },

  activeIndicator: {
    position: "absolute",
    bottom: "-4px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    backgroundColor: "#3b82f6",
  },

  // Content
  content: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    overflow: "hidden",
  },

  // Tabela Moderna
  tableContainer: {
    padding: "24px",
  },

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },

  tableTitle: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#0f172a",
    margin: "0 0 4px 0",
  },

  tableSubtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },

  headerActions: {
    display: "flex",
    gap: "12px",
  },

  primaryButton: {
    padding: "10px 16px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  },

  secondaryButton: {
    padding: "10px 16px",
    backgroundColor: "#ffffff",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  },

  filtersBar: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },

  searchInput: {
    flex: 1,
    maxWidth: "300px",
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  },

  filterSelect: {
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    cursor: "pointer",
  },

  tableWrapper: {
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },

  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    fontSize: "14px",
  },

  theadRow: {
    backgroundColor: "#f8fafc",
    borderBottom: "2px solid #e2e8f0",
  },

  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: 600,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
  },

  tr: {
    transition: "background-color 0.15s",
    borderBottom: "1px solid #e2e8f0",
  },

  td: {
    padding: "16px",
    color: "#334155",
    borderBottom: "1px solid #e2e8f0",
    verticalAlign: "middle",
  },

  categoryBadge: {
    display: "inline-flex",
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: 500,
  },

  unitBadge: {
    display: "inline-flex",
    padding: "2px 8px",
    backgroundColor: "#f1f5f9",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: 500,
    color: "#64748b",
    border: "1px solid #e2e8f0",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
  },

  actionButtons: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
  },

  iconButton: {
    padding: "6px",
    backgroundColor: "transparent",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s",
  },

  tableFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "24px",
    paddingTop: "24px",
    borderTop: "1px solid #e2e8f0",
  },

  footerStats: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    fontSize: "14px",
    color: "#64748b",
  },

  statItem: {
    display: "flex",
    gap: "4px",
  },

  statDivider: {
    color: "#cbd5e1",
  },

  pagination: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  paginationBtn: {
    padding: "8px 12px",
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    color: "#374151",
    cursor: "pointer",
    transition: "all 0.2s",
    opacity: 0.75,
  },

  pageInfo: {
    fontSize: "14px",
    color: "#64748b",
  },
};
