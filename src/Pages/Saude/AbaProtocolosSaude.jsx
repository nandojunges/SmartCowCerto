// src/pages/Saude/AbaProtocolosSaude.jsx
import React, { useMemo, useState } from "react";
import "../../styles/tabelamoderna.css";
import "../../styles/botoes.css";

function safeInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function AbaProtocolosSaude({ carregando, protocolos, onNovo, onAtualizar }) {
  const [expandId, setExpandId] = useState(null);

  const linhas = useMemo(() => {
    return (protocolos || []).map((p) => {
      const itens = Array.isArray(p.itens) ? p.itens : [];
      return {
        ...p,
        itensCount: itens.length,
        maxLeite: safeInt(p.carencia_leite_dias_max),
        maxCarne: safeInt(p.carencia_carne_dias_max),
        duracao: safeInt(p.duracao_dias),
        ultimoDia: safeInt(p.ultimo_dia),
        itens,
      };
    });
  }, [protocolos]);

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
          <div style={{ fontWeight: 900, color: "#0f172a" }}>Protocolos de tratamento (padrões)</div>
          <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
            Aqui você visualiza e organiza os modelos reutilizáveis. Eles são usados ao iniciar tratamentos (animal ou lote).
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button className="botao-acao" onClick={onNovo}>
            Cadastrar Tratamento Padrão
          </button>
          <button className="botao-cancelar" onClick={onAtualizar}>
            Atualizar
          </button>
        </div>
      </div>

      <div style={{ marginTop: 10, overflowX: "auto" }}>
        <table className="tabela-padrao">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Doença/Condição</th>
              <th>Duração</th>
              <th>Carência máx.</th>
              <th>Itens</th>
              <th className="coluna-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {!carregando && linhas.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 14, color: "#64748b" }}>
                  Nenhum protocolo cadastrado ainda. Clique em <b>“Cadastrar Tratamento Padrão”</b>.
                </td>
              </tr>
            ) : null}

            {linhas.map((p) => (
              <React.Fragment key={p.id}>
                <tr>
                  <td style={{ fontWeight: 900 }}>{p.nome || "-"}</td>
                  <td style={{ fontWeight: 700, color: "#334155" }}>{p.doenca || "-"}</td>
                  <td>
                    <div style={{ fontWeight: 900 }}>{p.duracao ? `${p.duracao} dia(s)` : "-"}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Último dia: {p.ultimoDia}</div>
                  </td>
                  <td>
                    leite <b>{p.maxLeite}d</b> • carne <b>{p.maxCarne}d</b>
                  </td>
                  <td>
                    <b>{p.itensCount}</b> item(ns)
                  </td>
                  <td className="coluna-acoes">
                    <div className="botoes-tabela">
                      <button
                        className="botao-editar"
                        onClick={() => setExpandId((old) => (old === p.id ? null : p.id))}
                      >
                        {expandId === p.id ? "Ocultar" : "Ver itens"}
                      </button>

                      {/* deixo preparado para você plugar edição/deleção depois */}
                      <button className="botao-cancelar pequeno" disabled title="Edição entra no próximo passo">
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>

                {expandId === p.id ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 12, background: "#f8fafc" }}>
                      <div style={{ fontWeight: 900, marginBottom: 8, color: "#0f172a" }}>Itens do protocolo</div>
                      {p.itensCount === 0 ? (
                        <div style={{ color: "#64748b" }}>Sem itens.</div>
                      ) : (
                        <div style={{ display: "grid", gap: 8 }}>
                          {p.itens.map((it, idx) => (
                            <div
                              key={idx}
                              style={{
                                border: "1px solid #e5e7eb",
                                borderRadius: 12,
                                padding: 10,
                                background: "#fff",
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 10,
                                flexWrap: "wrap",
                              }}
                            >
                              <div style={{ fontWeight: 900 }}>
                                Dia {safeInt(it.dia)} • {it.produto_nome || "Produto"}
                              </div>
                              <div style={{ color: "#475569", fontWeight: 700 }}>
                                {it.quantidade ? `${it.quantidade} ${it.unidade || ""}` : "-"} • {it.via || "-"}
                              </div>
                              <div style={{ color: "#64748b", fontSize: 12 }}>
                                Carência: leite {safeInt(it.carencia_leite_dias)}d • carne {safeInt(it.carencia_carne_dias)}d
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ) : null}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
