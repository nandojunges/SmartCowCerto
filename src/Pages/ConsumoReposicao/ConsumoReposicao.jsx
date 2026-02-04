import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Subpáginas reais do teu sistema
import Estoque from "./Estoque";
import Dieta from "./Dieta";
import Lotes from "./Lotes";
import Limpeza from "./Limpeza";
import CalendarioSanitario from "./CalendarioSanitario";

// ✅ IMPORTA O MODAL (ajuste o path se estiver diferente)
import ModalNovoProduto from "./ModalNovoProduto";

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

/* ========================= Exemplo de Tabela Estilizada (Estoque) ========================= */
/**
 * ✅ IMPORTANTE:
 * - Esse componente é SÓ o layout de exemplo.
 * - Aqui foi conectado o botão "+ Novo Produto" pra abrir o ModalNovoProduto.
 * - No teu Estoque.jsx real, você vai aplicar o mesmo padrão.
 */
function ExemploTabelaModerna({ onNovoProduto }) {
  const produtos = [
    {
      nome: "Ração 26%",
      categoria: "Cozinha",
      comprado: 5000,
      estoque: 5000,
      unidade: "kg",
      validade: "30/01/2026",
      consumo: "19 kg/d",
      prevTermino: "263 d",
      alertaEstoque: "OK",
      alertaValidade: "Vencido",
    },
    {
      nome: "Silagem de Milho",
      categoria: "Cozinha",
      comprado: 1000000,
      estoque: 1000000,
      unidade: "kg",
      validade: "31/12/2029",
      consumo: "60 kg/d",
      prevTermino: "16666 d",
      alertaEstoque: "OK",
      alertaValidade: "OK",
    },
    {
      nome: "Sincrocio",
      categoria: "Farmácia",
      comprado: 50,
      estoque: 50,
      unidade: "mL",
      validade: "25/12/2025",
      consumo: "—",
      prevTermino: "—",
      alertaEstoque: "OK",
      alertaValidade: "Vencido",
    },
    {
      nome: "Singrogest",
      categoria: "Farmácia",
      comprado: 50,
      estoque: 50,
      unidade: "mL",
      validade: "29/12/2025",
      consumo: "—",
      prevTermino: "—",
      alertaEstoque: "OK",
      alertaValidade: "Vencido",
    },
  ];

  const formatNumber = (num) => {
    if (num === "—") return "—";
    return Number(num).toLocaleString("pt-BR");
  };

  return (
    <div style={styles.tableContainer}>
      <div style={styles.tableHeader}>
        <div>
          <h2 style={styles.tableTitle}>Gerenciamento de Estoque</h2>
          <p style={styles.tableSubtitle}>
            Visualize e gerencie todos os produtos do seu estoque
          </p>
        </div>

        <div style={styles.headerActions}>
          <button type="button" style={styles.secondaryButton}>
            Ajustes
          </button>

          {/* ✅ AQUI estava o problema: antes não tinha onClick */}
          <button
            type="button"
            style={styles.primaryButton}
            onClick={onNovoProduto}
          >
            + Novo Produto
          </button>
        </div>
      </div>

      <div style={styles.filtersBar}>
        <input
          type="text"
          placeholder="Buscar produto..."
          style={styles.searchInput}
        />
        <select style={styles.filterSelect}>
          <option>Todos</option>
          <option>Cozinha</option>
          <option>Farmácia</option>
        </select>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={{ ...styles.th, width: "20%" }}>Nome Comercial</th>
              <th style={styles.th}>Categoria</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Comprado</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Em estoque</th>
              <th style={styles.th}>Unid.</th>
              <th style={styles.th}>Validade</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Consumo/dia</th>
              <th style={styles.th}>Prev. término</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Alerta Est.</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Alerta Val.</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Ação</th>
            </tr>
          </thead>

          <tbody>
            {produtos.map((prod, idx) => (
              <tr key={idx} style={styles.tr}>
                <td style={{ ...styles.td, fontWeight: 600, color: "#1e293b" }}>
                  {prod.nome}
                </td>

                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.categoryBadge,
                      backgroundColor:
                        prod.categoria === "Cozinha" ? "#fef3c7" : "#dbeafe",
                      color:
                        prod.categoria === "Cozinha" ? "#92400e" : "#1e40af",
                    }}
                  >
                    {prod.categoria}
                  </span>
                </td>

                <td
                  style={{
                    ...styles.td,
                    textAlign: "right",
                    fontFamily: "monospace",
                    fontSize: "0.9em",
                  }}
                >
                  {formatNumber(prod.comprado)}
                </td>

                <td
                  style={{
                    ...styles.td,
                    textAlign: "right",
                    fontFamily: "monospace",
                    fontSize: "0.9em",
                    fontWeight: 600,
                  }}
                >
                  {formatNumber(prod.estoque)}
                </td>

                <td style={styles.td}>
                  <span style={styles.unitBadge}>{prod.unidade}</span>
                </td>

                <td style={styles.td}>{prod.validade}</td>

                <td style={{ ...styles.td, textAlign: "right", color: "#64748b" }}>
                  {prod.consumo}
                </td>

                <td style={{ ...styles.td, color: "#64748b" }}>{prod.prevTermino}</td>

                <td style={{ ...styles.td, textAlign: "center" }}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor:
                        prod.alertaEstoque === "OK" ? "#dcfce7" : "#fee2e2",
                      color: prod.alertaEstoque === "OK" ? "#166534" : "#991b1b",
                    }}
                  >
                    {prod.alertaEstoque === "OK" ? "✓" : "!"} {prod.alertaEstoque}
                  </span>
                </td>

                <td style={{ ...styles.td, textAlign: "center" }}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor:
                        prod.alertaValidade === "OK" ? "#dcfce7" : "#fee2e2",
                      color: prod.alertaValidade === "OK" ? "#166534" : "#991b1b",
                      border:
                        prod.alertaValidade === "Vencido"
                          ? "1px solid #fecaca"
                          : "1px solid transparent",
                    }}
                  >
                    {prod.alertaValidade === "OK" ? "✓ OK" : "⚠ Vencido"}
                  </span>
                </td>

                <td style={{ ...styles.td, textAlign: "center" }}>
                  <div style={styles.actionButtons}>
                    <button type="button" style={styles.iconButton} title="Editar">
                      ✏️
                    </button>
                    <button
                      type="button"
                      style={{ ...styles.iconButton, color: "#ef4444" }}
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.tableFooter}>
        <div style={styles.footerStats}>
          <span style={styles.statItem}>
            <strong>Total de itens:</strong> 4
          </span>
          <span style={styles.statDivider}>|</span>
          <span style={styles.statItem}>
            <strong>Valor total:</strong>{" "}
            <span style={{ color: "#059669", fontWeight: 600 }}>R$ 90.100,00</span>
          </span>
          <span style={styles.statDivider}>|</span>
          <span style={styles.statItem}>
            <strong>Itens abaixo do mínimo:</strong>{" "}
            <span style={{ color: "#dc2626", fontWeight: 600 }}>0</span>
          </span>
        </div>

        <div style={styles.pagination}>
          <button type="button" style={styles.paginationBtn} disabled>
            ← Anterior
          </button>
          <span style={styles.pageInfo}>Página 1 de 1</span>
          <button type="button" style={styles.paginationBtn} disabled>
            Próxima →
          </button>
        </div>
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

  const [counts] = useState({
    estoque: 4,
    lotes: 12,
    dieta: 3,
    limpeza: 8,
    calendario: 5,
  });

  // ✅ STATE DO MODAL
  const [modalNovoProdutoOpen, setModalNovoProdutoOpen] = useState(false);

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

  // ✅ CALLBACK DO BOTÃO
  const abrirNovoProduto = useCallback(() => {
    setModalNovoProdutoOpen(true);
  }, []);

  const fecharNovoProduto = useCallback(() => {
    setModalNovoProdutoOpen(false);
  }, []);

  // ✅ Aqui você decide o que fazer quando salvar (por enquanto só fecha)
  const onSavedProduto = useCallback((payload) => {
    console.log("Produto/Lote salvo:", payload);
    setModalNovoProdutoOpen(false);

    // Se teu Estoque.jsx tem um refetch, aqui você chamaria (ou passaria via props/context)
    // ex: refreshEstoque();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <ModernTabs selected={tab} setSelected={setTab} contadores={counts} />

        <div style={styles.content}>
          {tab === "estoque" && (
            <div id="pane-estoque" role="tabpanel" aria-labelledby="estoque">
              {/* ✅ EXEMPLO: agora o botão abre o modal */}
              <ExemploTabelaModerna onNovoProduto={abrirNovoProduto} />

              {/* ✅ MODAL CONECTADO */}
              <ModalNovoProduto
                open={modalNovoProdutoOpen}
                onClose={fecharNovoProduto}
                onSaved={onSavedProduto}
                initial={null}
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
