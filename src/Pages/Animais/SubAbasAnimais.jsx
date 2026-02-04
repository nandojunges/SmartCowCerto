import React, { useEffect, useMemo, useState, useCallback } from "react";
import Plantel from "./Plantel";
import Secagem from "./Secagem";
import PrePartoParto from "./PrePartoParto";

const LS_LAST_TAB = "subabas:last";

const TABS = [
  { id: "plantel", label: "Plantel", icon: "🐄" },
  { id: "secagem", label: "Secagem", icon: "🥛" },
  { id: "preparto_parto", label: "Pré-parto / Parto", icon: "👶" },
];

export default function SubAbasAnimais({ animais = [], onRefresh, isOnline }) {
  const [tab, setTab] = useState(() => {
    try {
      return localStorage.getItem(LS_LAST_TAB) || "plantel";
    } catch {
      return "plantel";
    }
  });

  // Persistência
  useEffect(() => {
    try {
      localStorage.setItem(LS_LAST_TAB, tab);
    } catch {}
  }, [tab]);

  // Navegação por teclado
  const handleKeyNav = useCallback((e) => {
    const idx = TABS.findIndex((t) => t.id === tab);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setTab(TABS[(idx + 1) % TABS.length].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setTab(TABS[(idx - 1 + TABS.length) % TABS.length].id);
    }
  }, [tab]);

  const contadores = useMemo(() => {
    const lista = Array.isArray(animais) ? animais : [];
    return {
      plantel: lista.length,
      secagem: lista.filter(a => a?.situacao === "secagem" || a?.status === "seca").length, // Exemplo de lógica real
      preparto_parto: lista.filter(a => a?.pre_parto || a?.proximo_parto).length, // Exemplo
    };
  }, [animais]);

  return (
    <div style={styles.container}>
      {/* ===== HEADER COM TABS ===== */}
      <div style={styles.header}>
        <div 
          style={styles.tabsWrapper} 
          role="tablist" 
          aria-label="Seções do plantel"
          onKeyDown={handleKeyNav}
        >
          {TABS.map((t) => {
            const active = tab === t.id;
            const count = contadores[t.id];

            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                aria-controls={`panel-${t.id}`}
                onClick={() => setTab(t.id)}
                tabIndex={active ? 0 : -1}
                style={{
                  ...styles.tab,
                  ...(active ? styles.tabActive : styles.tabInactive),
                }}
              >
                <span style={styles.tabIcon}>{t.icon}</span>
                <span style={styles.tabLabel}>{t.label}</span>
                
                {count > 0 && (
                  <span style={{
                    ...styles.badge,
                    ...(active ? styles.badgeActive : styles.badgeInactive)
                  }}>
                    {count}
                  </span>
                )}

                {/* Indicador sutil de ativo (ponto) */}
                {active && <span style={styles.activeDot} />}
              </button>
            );
          })}
        </div>

        {/* Info de conexão (opcional, discreto) */}
        {!isOnline && (
          <span style={styles.offlineTag}>
            <span style={styles.offlineDot} /> Offline
          </span>
        )}
      </div>

      {/* ===== CONTEÚDO COM ANIMAÇÃO ===== */}
      <div style={styles.content}>
        {TABS.map((t) => (
          <div
            key={t.id}
            id={`panel-${t.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${t.id}`}
            style={{
              ...styles.panel,
              display: tab === t.id ? "block" : "none",
              opacity: tab === t.id ? 1 : 0,
            }}
          >
            {tab === t.id && ( // Renderização condicional para performance
              <>
                {t.id === "plantel" && (
                  <Plantel
                    animais={animais}
                    onAtualizado={onRefresh}
                    onCountChange={() => {}}
                    isOnline={isOnline}
                  />
                )}
                {t.id === "secagem" && <Secagem animais={animais} isOnline={isOnline} />}
                {t.id === "preparto_parto" && (
                  <PrePartoParto animais={animais} isOnline={isOnline} />
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================
   ESTILOS MODERNOS
========================= */
const styles = {
  container: {
    width: "100%",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
    padding: "4px",
  },

  tabsWrapper: {
    display: "flex",
    gap: "4px",
    padding: "4px",
    backgroundColor: "#f1f5f9",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    width: "fit-content",
  },

  tab: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    whiteSpace: "nowrap",
    outline: "none",
  },

  tabInactive: {
    backgroundColor: "transparent",
    color: "#64748b",
    "&:hover": {
      backgroundColor: "#e2e8f0",
      color: "#475569",
    },
  },

  tabActive: {
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontWeight: 600,
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  },

  tabIcon: {
    fontSize: "16px",
    lineHeight: 1,
  },

  tabLabel: {
    fontSize: "14px",
    letterSpacing: "-0.01em",
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
    marginLeft: "4px",
    transition: "all 0.2s",
  },

  badgeInactive: {
    backgroundColor: "#e2e8f0",
    color: "#64748b",
  },

  badgeActive: {
    backgroundColor: "#14b8a6", // Teal para manter a identidade
    color: "#ffffff",
  },

  activeDot: {
    position: "absolute",
    bottom: "4px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    backgroundColor: "#14b8a6",
  },

  offlineTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#64748b",
    fontWeight: 500,
    padding: "6px 12px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },

  offlineDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#f59e0b",
  },

  content: {
    position: "relative",
  },

  panel: {
    animation: "fadeIn 0.2s ease-out",
  },
};

// Adicionar keyframes para animação suave
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* Hover effects via CSS para não poluir inline */
  [role="tab"]:hover {
    transform: translateY(-1px);
  }
  
  [role="tab"]:active {
    transform: translateY(0);
  }
  
  [role="tab"][aria-selected="true"]:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
`;
document.head.appendChild(styleSheet);