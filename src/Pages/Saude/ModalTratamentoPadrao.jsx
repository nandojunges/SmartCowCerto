// src/pages/Saude/ModalTratamentoPadrao.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Select from "react-select";
import { supabase } from "../../lib/supabaseClient";
import { useFazenda } from "../../context/FazendaContext";
import "../../styles/botoes.css";

/* ===================== MODAL BASE ===================== */
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  padding: 12,
};

const card = {
  width: "min(1100px, 98vw)",
  background: "#fff",
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 30px rgba(0,0,0,0.20)",
  overflow: "hidden",
};

const header = {
  padding: "14px 16px",
  background: "#0b2a6f",
  color: "#fff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
};

const body = {
  padding: 16,
  maxHeight: "calc(92vh - 60px)",
  overflowY: "auto",
};

/* ===================== REACT-SELECT ===================== */
const rsStyles = {
  container: (b) => ({ ...b, width: "100%" }),
  control: (base, state) => ({
    ...base,
    minHeight: 44,
    height: 44,
    borderRadius: 12,
    borderColor: state.isFocused ? "#2563eb" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : "none",
    fontSize: 14,
    backgroundColor: "#f9fafb",
    ":hover": { borderColor: "#2563eb" },
  }),
  valueContainer: (b) => ({ ...b, padding: "0 12px" }),
  indicatorsContainer: (b) => ({ ...b, height: 44 }),
  menuPortal: (b) => ({ ...b, zIndex: 99999 }),
};

/* ===================== CONSTANTES ===================== */
const VIAS = [
  { value: "IMM", label: "IMM (Intramamária)" },
  { value: "IM", label: "IM (Intramuscular)" },
  { value: "SC", label: "SC (Subcutânea)" },
  { value: "IV", label: "IV (Intravenosa)" },
  { value: "VO", label: "VO (Oral)" },
  { value: "TOP", label: "TOP (Tópica)" },
];

const UNIDADES = [
  { value: "mL", label: "mL" },
  { value: "mg", label: "mg" },
  { value: "g", label: "g" },
  { value: "UI", label: "UI" },
  { value: "bisnaga", label: "bisnaga" },
  { value: "comprimido", label: "comprimido" },
  { value: "dose", label: "dose" },
];

function itemVazio() {
  return {
    dia: 0,
    produtoSel: null,
    viaSel: VIAS[0],
    quantidade: "",
    unidadeSel: UNIDADES[0],
  };
}

function toInt(v, fallback = 0) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

function isFarmaciaCategoria(cat) {
  const s = String(cat || "").toLowerCase();
  return (
    s.includes("farm") ||
    s.includes("medic") ||
    s.includes("saúde") ||
    s.includes("saude") ||
    s.includes("veter") ||
    s.includes("antib")
  );
}

/* ===================== UI helpers ===================== */
function Label({ children }) {
  return <div style={{ fontSize: 12, color: "#334155", marginBottom: 6, fontWeight: 800 }}>{children}</div>;
}

function InputBase(props) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        height: 44,
        borderRadius: 12,
        border: "1px solid #d1d5db",
        padding: "0 12px",
        background: "#f9fafb",
        fontSize: 14,
        outline: "none",
        boxSizing: "border-box",
        ...props.style,
      }}
    />
  );
}

export default function ModalTratamentoPadrao({ open, onClose, onSaved, sugestoesDoencas }) {
  const { fazendaAtualId } = useFazenda();
  const [salvando, setSalvando] = useState(false);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [doencaSel, setDoencaSel] = useState(null);
  const [itens, setItens] = useState([itemVazio()]);
  const [produtosEstoque, setProdutosEstoque] = useState([]);

  const doencaOptions = useMemo(() => {
    const base = (sugestoesDoencas || []).filter((x) => x?.value && x.value !== "todas");
    return base.length ? base : [{ value: "Mastite", label: "Mastite" }];
  }, [sugestoesDoencas]);

  const maiorDia = useMemo(() => {
    const dias = itens.map((i) => toInt(i.dia, 0));
    return dias.length ? Math.max(...dias) : 0;
  }, [itens]);

  const duracaoCalculada = useMemo(() => maiorDia + 1, [maiorDia]);

  const resumoCarencia = useMemo(() => {
    let maxLeite = 0;
    let maxCarne = 0;
    for (const it of itens) {
      const meta = it?.produtoSel?.meta;
      if (!meta) continue;
      maxLeite = Math.max(maxLeite, toInt(meta.carencia_leite_dias, 0));
      maxCarne = Math.max(maxCarne, toInt(meta.carencia_carne_dias, 0));
    }
    return { maxLeite, maxCarne };
  }, [itens]);

  // ✅ AJUSTADO PARA TEU SCHEMA REAL
  const carregarProdutos = useCallback(async () => {
    setCarregandoProdutos(true);
    setErro("");

    try {
      if (!fazendaAtualId) {
        setProdutosEstoque([]);
        setErro("Selecione uma fazenda para carregar os produtos.");
        return;
      }

      const { data, error } = await supabase
        .from("estoque_produtos")
        .select(
          "id, nome_comercial, categoria, unidade, tipo_farmacia, carencia_leite_dias, carencia_carne_dias, sem_carencia_leite, sem_carencia_carne"
        )
        .eq("fazenda_id", fazendaAtualId)
        .order("nome_comercial", { ascending: true });

      if (error) {
        setProdutosEstoque([]);
        setErro(`Erro ao carregar estoque_produtos: ${error.message}`);
        return;
      }

      const filtrados = (data || []).filter((p) => {
        // ✅ Farmácia por categoria OU por tipo_farmacia preenchido
        const catOk = isFarmaciaCategoria(p.categoria);
        const tipoOk = String(p.tipo_farmacia || "").trim().length > 0;
        return catOk || tipoOk;
      });

      const options = filtrados
        .map((p) => {
          const nomeProd = String(p.nome_comercial || "").trim();
          if (!nomeProd) return null;

          return {
            value: p.id,
            label: nomeProd,
            meta: {
              id: p.id,
              nome: nomeProd,
              categoria: p.categoria,
              unidade_padrao: p.unidade || null,
              carencia_leite_dias: p.sem_carencia_leite ? 0 : p.carencia_leite_dias,
              carencia_carne_dias: p.sem_carencia_carne ? 0 : p.carencia_carne_dias,
            },
          };
        })
        .filter(Boolean);

      setProdutosEstoque(options);
    } catch {
      setProdutosEstoque([]);
      setErro("Falha ao carregar produtos do estoque. Verifique conexão/RLS.");
    } finally {
      setCarregandoProdutos(false);
    }
  }, [fazendaAtualId]);

  useEffect(() => {
    if (!open) return;
    setErro("");
    setNome("");
    setDoencaSel(null);
    setItens([itemVazio()]);
    carregarProdutos();
  }, [open, carregarProdutos]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const addItem = () => setItens((old) => [...old, itemVazio()]);
  const rmItem = (idx) => setItens((old) => old.filter((_, i) => i !== idx));
  const updateItem = (idx, patch) => {
    setItens((old) => old.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const salvar = async () => {
    setErro("");
    if (!fazendaAtualId) {
      return setErro("Selecione uma fazenda antes de salvar o protocolo.");
    }
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return setErro("Informe um nome para o protocolo.");
    if (!doencaSel?.value) return setErro("Selecione a doença/condição.");

    const itensValidos = itens
      .map((it) => {
        const dia = toInt(it.dia, 0);
        const produto = it.produtoSel?.meta;
        return {
          dia,
          produto_id: produto?.id || null,
          produto_nome: produto?.nome || null,
          via: it.viaSel?.value || "IMM",
          quantidade: String(it.quantidade || "").trim(),
          unidade: it.unidadeSel?.value || "mL",
          carencia_leite_dias: produto?.carencia_leite_dias ?? null,
          carencia_carne_dias: produto?.carencia_carne_dias ?? null,
        };
      })
      .filter((x) => x.produto_id);

    if (itensValidos.length === 0) {
      return setErro("Adicione ao menos 1 item com produto do estoque (categoria Farmácia/Medicamentos).");
    }

    setSalvando(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id ?? null;

      const payload = {
        nome: nomeLimpo,
        doenca: doencaSel.value,
        itens: itensValidos,
        ultimo_dia: maiorDia,
        duracao_dias: duracaoCalculada,
        carencia_leite_dias_max: resumoCarencia.maxLeite,
        carencia_carne_dias_max: resumoCarencia.maxCarne,
        fazenda_id: fazendaAtualId,
        user_id: userId,
      };

      const { error } = await supabase.from("saude_protocolos").insert([payload]);
      if (error) {
        setErro("Não foi possível salvar. Verifique se a tabela 'saude_protocolos' existe e se o RLS permite insert.");
        return;
      }
      onSaved?.();
    } catch {
      setErro("Falha ao salvar. Verifique conexão e estrutura das tabelas.");
    } finally {
      setSalvando(false);
    }
  };

  const LinhaItem = ({ it, idx, isLast }) => {
    return (
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 12, background: "#fff" }}>
        {/* Linha 1: Dia | Produto | Via */}
        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 320px", gap: 12, alignItems: "end" }}>
          <div style={{ minWidth: 0 }}>
            <Label>Dia</Label>
            <InputBase type="number" min={0} value={it.dia} onChange={(e) => updateItem(idx, { dia: e.target.value })} />
          </div>

          <div style={{ minWidth: 0 }}>
            <Label>Produto (Estoque)</Label>
            <Select
              value={it.produtoSel}
              onChange={(opt) => updateItem(idx, { produtoSel: opt })}
              options={produtosEstoque}
              styles={rsStyles}
              menuPortalTarget={document.body}
              placeholder={carregandoProdutos ? "Carregando..." : "Selecione o produto..."}
              isLoading={carregandoProdutos}
              isClearable
              noOptionsMessage={() => (carregandoProdutos ? "Carregando..." : "Nenhum produto de Farmácia encontrado")}
            />
          </div>

          <div style={{ minWidth: 0 }}>
            <Label>Via</Label>
            <Select
              value={it.viaSel}
              onChange={(opt) => updateItem(idx, { viaSel: opt })}
              options={VIAS}
              styles={rsStyles}
              menuPortalTarget={document.body}
              placeholder="Selecione..."
            />
          </div>
        </div>

        {/* Observação carência */}
        {it.produtoSel?.meta ? (
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
            Carência: leite {toInt(it.produtoSel.meta.carencia_leite_dias, 0)}d • carne {toInt(it.produtoSel.meta.carencia_carne_dias, 0)}d
          </div>
        ) : null}

        {/* Linha 2: Quantidade | Unidade | Ações */}
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 220px 320px", gap: 12, alignItems: "end" }}>
          <div style={{ minWidth: 0 }}>
            <Label>Quantidade</Label>
            <InputBase value={it.quantidade} onChange={(e) => updateItem(idx, { quantidade: e.target.value })} placeholder="Ex.: 10" />
          </div>

          <div style={{ minWidth: 0 }}>
            <Label>Unidade</Label>
            <Select
              value={it.unidadeSel}
              onChange={(opt) => updateItem(idx, { unidadeSel: opt })}
              options={UNIDADES}
              styles={rsStyles}
              menuPortalTarget={document.body}
              placeholder="Unidade"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
            {isLast ? (
              <button className="botao-editar" onClick={addItem} title="Adicionar mais um item">
                + Item
              </button>
            ) : null}

            {idx > 0 ? (
              <button className="botao-excluir" onClick={() => rmItem(idx)} title="Remover este item">
                Remover
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={overlay} onMouseDown={onClose}>
      <div style={card} onMouseDown={(e) => e.stopPropagation()}>
        <div style={header}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Cadastrar Tratamento Padrão</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>
              Protocolo reutilizável: dias + produtos do estoque + via + dose. Carência vem do estoque automaticamente.
            </div>
          </div>

          <button className="botao-cancelar pequeno" onClick={onClose}>
            Fechar
          </button>
        </div>

        <div style={body}>
          {erro ? (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                borderRadius: 12,
                padding: 10,
                marginBottom: 12,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {erro}
            </div>
          ) : null}

          {/* TOPO */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12, alignItems: "end" }}>
            <div style={{ minWidth: 0 }}>
              <Label>Nome do protocolo</Label>
              <InputBase value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Mastite IMM dias 0-2 (Cloxacilina)" />
            </div>

            <div style={{ minWidth: 0 }}>
              <Label>Doença/Condição</Label>
              <Select
                value={doencaSel}
                onChange={setDoencaSel}
                options={doencaOptions}
                styles={rsStyles}
                menuPortalTarget={document.body}
                placeholder="Selecione..."
              />
            </div>
          </div>

          {/* RESUMOS */}
          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 9999, padding: "7px 12px", fontSize: 13, color: "#334155" }}>
              Último dia do protocolo: <b>{maiorDia}</b>
            </div>
            <div style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 9999, padding: "7px 12px", fontSize: 13, color: "#334155" }}>
              Duração (0 → último dia): <b>{duracaoCalculada}</b> dia(s)
            </div>
            <div style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 9999, padding: "7px 12px", fontSize: 13, color: "#334155" }}>
              Carência máxima: leite <b>{resumoCarencia.maxLeite}</b>d • carne <b>{resumoCarencia.maxCarne}</b>d
            </div>
          </div>

          {/* ITENS */}
          <div style={{ marginTop: 16, fontWeight: 900, color: "#0f172a", fontSize: 18 }}>Itens de aplicação (padrão)</div>
          <div style={{ marginTop: 6, color: "#64748b", fontSize: 13 }}>
            O dia é relativo ao início (definido depois no “Iniciar Tratamento”). Ex.: dias 1, 3 e 4 são respeitados.
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
            {itens.map((it, idx) => (
              <LinhaItem key={idx} it={it} idx={idx} isLast={idx === itens.length - 1} />
            ))}
          </div>

          {/* RODAPÉ */}
          <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button className="botao-cancelar" onClick={onClose} disabled={salvando}>
              Cancelar
            </button>
            <button className="botao-acao" onClick={salvar} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar Protocolo"}
            </button>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
            Próximo passo: no modal <b>Iniciar Tratamento</b>, você escolhe animal + data de início, e o sistema gera as datas
            reais e calcula o fim da carência após a última aplicação.
          </div>
        </div>
      </div>
    </div>
  );
}
