// src/pages/Saude/AbaAgendaSaude.jsx
import React from "react";
import "../../styles/botoes.css";

export default function AbaAgendaSaude({ carregando, agendaProximas, marcarAplicacaoComoRealizada }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 900, color: "#0f172a" }}>Agenda de aplicações</div>
          <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
            Visão operacional do que está pendente. Ideal para execução diária.
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800 }}>Próximas pendências</div>
      </div>

      <div style={{ marginTop: 10 }}>
        {!carregando && agendaProximas.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: 13, padding: 10 }}>
            Nenhuma aplicação pendente encontrada.
          </div>
        ) : null}

        {agendaProximas.map((g) => (
          <div key={g.dia} style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: "#1e3a8a",
                background: "#e6f0ff",
                border: "1px solid #a8c3e6",
                borderRadius: 10,
                padding: "6px 10px",
                display: "inline-block",
              }}
            >
              {g.dia}
            </div>

            <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
              {g.items.map((ap) => (
                <div
                  key={ap.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 240 }}>
                    <div style={{ fontWeight: 900 }}>
                      #{ap.animalNumero}{" "}
                      <span style={{ color: "#64748b", fontWeight: 700 }}>
                        {ap.animalBrinco && ap.animalBrinco !== "-" ? `• ${ap.animalBrinco}` : ""}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#475569" }}>
                      {ap.produto || "Produto"} {ap.dose ? `• ${ap.dose}` : ""} {ap.via ? `• ${ap.via}` : ""}
                    </div>
                  </div>

                  <button className="botao-editar" onClick={() => marcarAplicacaoComoRealizada(ap)}>
                    Aplicado
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
          Observação: o que for do <b>dia de hoje</b> pode (e deve) aparecer também no seu painel de Início (tarefas do dia).
        </div>
      </div>
    </div>
  );
}
