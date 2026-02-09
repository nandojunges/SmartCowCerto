import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../lib/supabaseClient";
import { useFazenda } from "../../context/FazendaContext";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10000,
  padding: 24,
};

const modalStyle = {
  background: "#fff",
  width: "min(1100px, 92vw)",
  height: "min(86vh, 920px)",
  borderRadius: 16,
  boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  fontFamily: "Poppins, sans-serif",
};

const headerStyle = {
  padding: "16px 20px",
  borderBottom: "1px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  fontWeight: 700,
  fontSize: "1.05rem",
  color: "#0f172a",
};

const closeButtonStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  color: "#0f172a",
  padding: "6px 12px",
  borderRadius: "999px",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: 600,
};

const inputStyle = {
  width: "100%",
  minHeight: 40,
  borderRadius: 10,
  border: "1px solid #d1d5db",
  padding: "8px 12px",
  fontSize: 14,
  fontFamily: "inherit",
};

const sectionTitleStyle = {
  margin: "0 0 8px",
  fontSize: "0.85rem",
  fontWeight: 700,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const emptyItem = () => ({
  id: crypto.randomUUID(),
  dia: "0",
  produto_nome: "",
  quantidade: "",
  unidade: "",
  via: "",
  obs: "",
  carencia_leite_dias: "",
  carencia_carne_dias: "",
});

export default function ModalTratamentoPadrao({
  open,
  onClose,
  onSaved,
  initialDoenca = "",
  initialNome = "",
  sugestoesDoencas = [],
}) {
  const { fazendaAtualId } = useFazenda();
  const [nome, setNome] = useState("");
  const [doenca, setDoenca] = useState("");
  const [itens, setItens] = useState([emptyItem()]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const doencasLista = useMemo(
    () => (Array.isArray(sugestoesDoencas) ? sugestoesDoencas.map((opt) => opt?.label || opt?.value).filter(Boolean) : []),
    [sugestoesDoencas]
  );

  useEffect(() => {
    if (!open) return;
    setNome(initialNome || "");
    setDoenca(initialDoenca || "");
    setItens([emptyItem()]);
    setErrorMsg("");
    setLoading(false);
  }, [open, initialNome, initialDoenca]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const atualizarItem = (id, patch) => {
    setItens((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removerItem = (id) => {
    setItens((prev) => prev.filter((item) => item.id !== id));
  };

  const adicionarItem = () => {
    setItens((prev) => [...prev, emptyItem()]);
  };

  const parseNumero = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  };

  const handleSalvar = async () => {
    if (!fazendaAtualId) {
      setErrorMsg("Selecione uma fazenda para salvar o protocolo.");
      return;
    }
    if (!nome.trim()) {
      setErrorMsg("Informe o nome do protocolo.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const { data: userData } = await supabase.auth.getUser();
      const legacyAuthUser = typeof supabase.auth.user === "function" ? supabase.auth.user() : null;
      const userId = userData?.user?.id || legacyAuthUser?.id || null;

      const itensPayload = itens.map((item) => ({
        dia: parseNumero(item.dia) ?? 0,
        produto_id: null,
        produto_nome: item.produto_nome?.trim() || "",
        quantidade: parseNumero(item.quantidade) ?? null,
        unidade: item.unidade?.trim() || "",
        via: item.via?.trim() || "",
        obs: item.obs?.trim() || "",
        carencia_leite_dias: parseNumero(item.carencia_leite_dias) ?? 0,
        carencia_carne_dias: parseNumero(item.carencia_carne_dias) ?? 0,
      }));

      const dias = itensPayload.map((item) => Number(item.dia) || 0);
      const ultimoDia = dias.length ? Math.max(...dias) : 0;
      const carenciaLeiteMax = itensPayload.reduce((acc, item) => Math.max(acc, Number(item.carencia_leite_dias) || 0), 0);
      const carenciaCarneMax = itensPayload.reduce((acc, item) => Math.max(acc, Number(item.carencia_carne_dias) || 0), 0);

      const row = {
        fazenda_id: fazendaAtualId,
        user_id: userId,
        nome: nome.trim(),
        doenca: doenca.trim() || null,
        itens: itensPayload,
        ativo: true,
        duracao_dias: ultimoDia,
        ultimo_dia: ultimoDia,
        carencia_leite_dias_max: carenciaLeiteMax,
        carencia_carne_dias_max: carenciaCarneMax,
      };

      const { data, error } = await supabase.from("saude_protocolos").insert([row]).select("*").single();
      if (error) throw error;

      onSaved?.(data ?? row);
    } catch (err) {
      console.error(err);
      setErrorMsg("Não foi possível salvar o protocolo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const content = (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <div>Novo protocolo terapêutico</div>
          <button type="button" style={closeButtonStyle} onClick={onClose}>
            Fechar
          </button>
        </div>

        <div style={{ padding: "18px 20px", display: "grid", gap: 16, overflowY: "auto", flex: 1 }}>
          <div>
            <div style={sectionTitleStyle}>Informações gerais</div>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Nome *</label>
                <input style={inputStyle} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Metrite pós-parto" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Doença/condição</label>
                <input
                  style={inputStyle}
                  value={doenca}
                  onChange={(e) => setDoenca(e.target.value)}
                  placeholder="Ex.: Metrite"
                  list="lista-doencas"
                />
                <datalist id="lista-doencas">
                  {doencasLista.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          <div>
            <div style={sectionTitleStyle}>Itens do protocolo</div>
            <div style={{ display: "grid", gap: 12 }}>
              {itens.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 12,
                    background: "#f8fafc",
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ color: "#0f172a" }}>Item #{index + 1}</strong>
                    {itens.length > 1 ? (
                      <button type="button" style={closeButtonStyle} onClick={() => removerItem(item.id)}>
                        Remover
                      </button>
                    ) : null}
                  </div>

                  <div style={{ display: "grid", gap: 10, gridTemplateColumns: "90px 1fr 120px 120px" }}>
                    <input
                      style={inputStyle}
                      value={item.dia}
                      onChange={(e) => atualizarItem(item.id, { dia: e.target.value })}
                      placeholder="Dia"
                    />
                    <input
                      style={inputStyle}
                      value={item.produto_nome}
                      onChange={(e) => atualizarItem(item.id, { produto_nome: e.target.value })}
                      placeholder="Produto/medicamento"
                    />
                    <input
                      style={inputStyle}
                      value={item.quantidade}
                      onChange={(e) => atualizarItem(item.id, { quantidade: e.target.value })}
                      placeholder="Qtd"
                    />
                    <input
                      style={inputStyle}
                      value={item.unidade}
                      onChange={(e) => atualizarItem(item.id, { unidade: e.target.value })}
                      placeholder="Unidade"
                    />
                  </div>

                  <div style={{ display: "grid", gap: 10, gridTemplateColumns: "120px 1fr 140px 140px" }}>
                    <input
                      style={inputStyle}
                      value={item.via}
                      onChange={(e) => atualizarItem(item.id, { via: e.target.value })}
                      placeholder="Via"
                    />
                    <input
                      style={inputStyle}
                      value={item.obs}
                      onChange={(e) => atualizarItem(item.id, { obs: e.target.value })}
                      placeholder="Observações"
                    />
                    <input
                      style={inputStyle}
                      value={item.carencia_leite_dias}
                      onChange={(e) => atualizarItem(item.id, { carencia_leite_dias: e.target.value })}
                      placeholder="Carência leite (d)"
                    />
                    <input
                      style={inputStyle}
                      value={item.carencia_carne_dias}
                      onChange={(e) => atualizarItem(item.id, { carencia_carne_dias: e.target.value })}
                      placeholder="Carência carne (d)"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={adicionarItem}
                style={{
                  border: "1px dashed #94a3b8",
                  background: "transparent",
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontWeight: 700,
                  color: "#0f172a",
                  cursor: "pointer",
                }}
              >
                + Adicionar item
              </button>
            </div>
          </div>

          {errorMsg ? (
            <div style={{ padding: "10px 12px", borderRadius: 10, background: "#fee2e2", color: "#991b1b", fontSize: 13, fontWeight: 600 }}>
              {errorMsg}
            </div>
          ) : null}
        </div>

        <div style={{ padding: "16px 20px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" style={closeButtonStyle} onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            disabled={loading}
            style={{
              background: loading ? "#94a3b8" : "#2563eb",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: 10,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Salvando..." : "Salvar protocolo"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
