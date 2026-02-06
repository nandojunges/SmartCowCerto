import React, { useState, useEffect } from "react";

/* ── Mock data ── */
const MOCK = {
  rebanho: 142,
  emLactacao: 98,
  producaoHoje: 18.4,
  metaProducao: 18.0,
  mediaVaca: 28.6,
  ccs: 285,
  prenhez: 41,

  alertas: [
    { 
      id: 1, 
      gravidade: "critico", 
      animal: "#0523", 
      texto: "CMT positivo — separar antes ordenha tarde",
      modulo: "Saúde",
      tempo: "2h"
    },
    { 
      id: 2, 
      gravidade: "alto", 
      animal: "#0892", 
      texto: "CCS 180k→420k em 5 dias",
      modulo: "Saúde",
      tempo: "4h"
    },
    { 
      id: 3, 
      gravidade: "medio", 
      animal: "#1041", 
      texto: "Janela IATF fecha amanhã",
      modulo: "Reprodução",
      tempo: "1h"
    },
  ],

  tarefas: [
    { 
      id: 1, 
      prioridade: "alta", 
      titulo: "Separar Lote 3 para tratamento",
      descricao: "3 animais com mastite identificados no CMT",
      prazo: "3h",
      acao: "Separar agora"
    },
    { 
      id: 2, 
      prioridade: "alta", 
      titulo: "Comprar PGF2α",
      descricao: "Estoque crítico: 3 doses (precisa 8)",
      prazo: "Hoje",
      acao: "Comprar"
    },
    { 
      id: 3, 
      prioridade: "media", 
      titulo: "Aplicar PGF2α no Lote 4",
      descricao: "Dia 18 do protocolo · 6 animais",
      prazo: "8h",
      acao: "Aplicar"
    },
    { 
      id: 4, 
      prioridade: "normal", 
      titulo: "Avaliar bezerros para venda",
      descricao: "Peso ideal + mercado favorável",
      prazo: "Semana",
      acao: "Avaliar"
    },
  ],

  eventos: [
    { hora: "06:30", texto: "Ordenha manhã — 9.2k L" },
    { hora: "07:15", texto: "CMT realizado — 3 positivos" },
    { hora: "08:00", texto: "Cio #0744" },
  ],
};

/* ── Cores ── */
const C = {
  bg: "#F8F9FA",
  card: "#FFFFFF",
  
  gray: {
    100: "#F1F3F5",
    200: "#E9ECEF",
    300: "#DEE2E6",
    400: "#CED4DA",
    500: "#ADB5BD",
    600: "#868E96",
    700: "#495057",
    800: "#343A40",
    900: "#212529",
  },
  
  red: "#DC2626",
  orange: "#F97316",
  blue: "#2563EB",
  green: "#16A34A",
};

/* ── Página ── */
export default function Inicio() {
  const [hora, setHora] = useState(() =>
    new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
  const [concluidas, setConcluidas] = useState(new Set());

  useEffect(() => {
    const t = setInterval(() => {
      setHora(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    }, 60_000);
    return () => clearInterval(t);
  }, []);

  const dataTexto = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });

  const toggleConcluida = (id) => {
    setConcluidas(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const producaoPct = Math.round((MOCK.producaoHoje / MOCK.metaProducao) * 100);
  const tarefasPendentes = MOCK.tarefas.filter(t => !concluidas.has(t.id));
  const tarefasUrgentes = tarefasPendentes.filter(t => t.prioridade === "alta").length;

  return (
    <div style={{ 
      background: C.bg,
      minHeight: "100vh", 
      padding: "28px 48px" 
    }}>
      <div style={{ maxWidth: 1600, margin: "0 auto" }}>

        {/* ═══ HEADER COMPACTO ═══ */}
        <div style={{ 
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20
        }}>
          <div>
            <h1 style={{ 
              fontSize: 28, 
              fontWeight: 700, 
              color: C.gray[900], 
              margin: 0,
              letterSpacing: -0.5
            }}>
              Bom dia 👋
            </h1>
            <p style={{ 
              fontSize: 14, 
              color: C.gray[600], 
              margin: "2px 0 0",
              fontWeight: 500
            }}>
              {dataTexto} · {hora}
            </p>
          </div>
          
          {tarefasUrgentes > 0 && (
            <div style={{
              background: "#FEF2F2",
              borderLeft: `4px solid ${C.red}`,
              borderRadius: 8,
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              gap: 10
            }}>
              <div style={{
                width: 8,
                height: 8,
                background: C.red,
                borderRadius: "50%"
              }} />
              <span style={{
                fontSize: 14,
                fontWeight: 600,
                color: C.gray[900]
              }}>
                {tarefasUrgentes} {tarefasUrgentes === 1 ? 'urgente' : 'urgentes'}
              </span>
            </div>
          )}
        </div>

        {/* ═══ KPIs INLINE ═══ */}
        <div style={{
          background: C.card,
          borderRadius: 12,
          padding: "16px 24px",
          marginBottom: 20,
          border: `1px solid ${C.gray[200]}`,
          display: "flex",
          gap: 40,
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.gray[500], textTransform: "uppercase", letterSpacing: 0.5 }}>
              Rebanho
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.gray[900], marginTop: 2 }}>
              {MOCK.rebanho} <span style={{ fontSize: 13, fontWeight: 500, color: C.gray[500] }}>cab</span>
            </div>
          </div>
          
          <div style={{ width: 1, height: 40, background: C.gray[200] }} />
          
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.gray[500], textTransform: "uppercase", letterSpacing: 0.5 }}>
              Lactação
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.gray[900], marginTop: 2 }}>
              {MOCK.emLactacao} <span style={{ fontSize: 13, fontWeight: 500, color: C.gray[500] }}>cab</span>
            </div>
          </div>
          
          <div style={{ width: 1, height: 40, background: C.gray[200] }} />
          
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.gray[500], textTransform: "uppercase", letterSpacing: 0.5 }}>
              Produção hoje
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: producaoPct >= 100 ? C.green : C.orange, marginTop: 2 }}>
              {MOCK.producaoHoje} <span style={{ fontSize: 13, fontWeight: 500, color: C.gray[500] }}>mil L</span>
            </div>
          </div>
          
          <div style={{ width: 1, height: 40, background: C.gray[200] }} />
          
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.gray[500], textTransform: "uppercase", letterSpacing: 0.5 }}>
              Média/vaca
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.gray[900], marginTop: 2 }}>
              {MOCK.mediaVaca} <span style={{ fontSize: 13, fontWeight: 500, color: C.gray[500] }}>L</span>
            </div>
          </div>
          
          <div style={{ width: 1, height: 40, background: C.gray[200] }} />
          
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.gray[500], textTransform: "uppercase", letterSpacing: 0.5 }}>
              CCS
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: MOCK.ccs > 250 ? C.red : C.green, marginTop: 2 }}>
              {MOCK.ccs} <span style={{ fontSize: 13, fontWeight: 500, color: C.gray[500] }}>mil</span>
            </div>
          </div>
          
          <div style={{ width: 1, height: 40, background: C.gray[200] }} />
          
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.gray[500], textTransform: "uppercase", letterSpacing: 0.5 }}>
              Prenhez
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: MOCK.prenhez >= 45 ? C.green : C.orange, marginTop: 2 }}>
              {MOCK.prenhez}<span style={{ fontSize: 13, fontWeight: 500, color: C.gray[500] }}>%</span>
            </div>
          </div>
        </div>

        {/* ═══ LAYOUT: 75% TAREFAS | 25% ALERTAS ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>

          {/* ━━━ TAREFAS (DOMINAM) ━━━ */}
          <div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 16
            }}>
              <h2 style={{
                fontSize: 20,
                fontWeight: 700,
                color: C.gray[900],
                margin: 0
              }}>
                O que fazer agora
              </h2>
              <span style={{ fontSize: 13, color: C.gray[500] }}>
                {tarefasPendentes.length} pendentes
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {MOCK.tarefas.map(tarefa => {
                const concluida = concluidas.has(tarefa.id);
                
                const cor = 
                  tarefa.prioridade === "alta" ? C.red :
                  tarefa.prioridade === "media" ? C.orange : C.gray[600];

                return (
                  <div
                    key={tarefa.id}
                    style={{
                      background: C.card,
                      border: `1px solid ${C.gray[200]}`,
                      borderLeft: `5px solid ${concluida ? C.green : cor}`,
                      borderRadius: 10,
                      padding: "16px 20px",
                      transition: "all 0.15s ease",
                      opacity: concluida ? 0.5 : 1,
                      display: "flex",
                      gap: 16,
                      alignItems: "center"
                    }}
                    onMouseEnter={(e) => {
                      if (!concluida) {
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleConcluida(tarefa.id)}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        border: `2.5px solid ${concluida ? C.green : cor}`,
                        background: concluida ? C.green : "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        color: "white",
                        fontWeight: "700",
                        transition: "all 0.15s ease",
                        flexShrink: 0
                      }}
                    >
                      {concluida && "✓"}
                    </button>

                    {/* Conteúdo */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 4
                      }}>
                        <h3 style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: C.gray[900],
                          margin: 0,
                          textDecoration: concluida ? "line-through" : "none"
                        }}>
                          {tarefa.titulo}
                        </h3>
                        {!concluida && tarefa.prioridade === "alta" && (
                          <span style={{
                            background: "#FEF2F2",
                            color: C.red,
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: 0.3
                          }}>
                            Urgente
                          </span>
                        )}
                      </div>
                      <p style={{
                        fontSize: 13,
                        color: C.gray[600],
                        margin: "0 0 6px 0"
                      }}>
                        {tarefa.descricao}
                      </p>
                      <span style={{ fontSize: 12, color: C.gray[500] }}>
                        ⏱ {tarefa.prazo}
                      </span>
                    </div>

                    {/* Ação */}
                    {!concluida && (
                      <button
                        onClick={() => console.log("Navigate")}
                        style={{
                          background: cor,
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          padding: "10px 20px",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          whiteSpace: "nowrap",
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.03)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        {tarefa.acao} →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {tarefasPendentes.length === 0 && (
              <div style={{
                background: "#F0FDF4",
                border: `2px dashed ${C.green}`,
                borderRadius: 10,
                padding: "40px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>✓</div>
                <h3 style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: C.gray[900],
                  margin: "0 0 4px 0"
                }}>
                  Tudo concluído
                </h3>
                <p style={{ fontSize: 14, color: C.gray[600], margin: 0 }}>
                  Excelente trabalho!
                </p>
              </div>
            )}

            {/* Eventos */}
            <div style={{
              marginTop: 20,
              background: C.card,
              border: `1px solid ${C.gray[200]}`,
              borderRadius: 10,
              padding: "14px 20px"
            }}>
              <h3 style={{
                fontSize: 13,
                fontWeight: 600,
                color: C.gray[700],
                margin: "0 0 10px 0"
              }}>
                Últimos eventos
              </h3>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {MOCK.eventos.map((e, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: C.blue }}>{e.hora}</span>
                    <span style={{ color: C.gray[700] }}>{e.texto}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ━━━ ALERTAS (SIDEBAR DISCRETA) ━━━ */}
          <div>
            <h2 style={{
              fontSize: 14,
              fontWeight: 700,
              color: C.gray[700],
              margin: "0 0 12px 0",
              textTransform: "uppercase",
              letterSpacing: 0.5
            }}>
              Alertas ({MOCK.alertas.length})
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {MOCK.alertas.map(alerta => {
                const cor = 
                  alerta.gravidade === "critico" ? C.red :
                  alerta.gravidade === "alto" ? C.orange : C.blue;

                return (
                  <div
                    key={alerta.id}
                    style={{
                      background: C.card,
                      border: `1px solid ${C.gray[200]}`,
                      borderLeft: `4px solid ${cor}`,
                      borderRadius: 8,
                      padding: "12px 14px",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6
                    }}>
                      <span style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.gray[900]
                      }}>
                        {alerta.animal}
                      </span>
                      <span style={{ fontSize: 11, color: C.gray[500] }}>
                        {alerta.tempo}
                      </span>
                    </div>

                    <p style={{
                      fontSize: 12,
                      color: C.gray[700],
                      margin: "0 0 8px 0",
                      lineHeight: 1.4
                    }}>
                      {alerta.texto}
                    </p>

                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <span style={{
                        fontSize: 11,
                        color: C.gray[500]
                      }}>
                        {alerta.modulo}
                      </span>
                      <button
                        onClick={() => console.log("Navigate")}
                        style={{
                          background: "transparent",
                          color: cor,
                          border: `1px solid ${cor}`,
                          borderRadius: 5,
                          padding: "4px 10px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = cor;
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = cor;
                        }}
                      >
                        Ver
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
