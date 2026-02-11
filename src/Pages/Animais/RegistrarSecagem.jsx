import React, { useMemo, useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { supabase } from "../../lib/supabaseClient";
import { useFazenda } from "../../context/FazendaContext";

export default function RegistrarSecagem(props) {
  // ✅ Compatível com as duas assinaturas:
  // - nova:  { animal, onClose }
  // - antiga:{ vaca, onFechar }
  const animalProp = props.animal ?? props.vaca ?? null;
  const onClose = props.onClose ?? props.onFechar ?? (() => {});
  const fazendaIdProp = props.fazendaId ?? props.fazenda_id ?? null;
  const iaIdProp = props.iaId ?? props.ia_id ?? null;
  const animalIdProp = props.animalId ?? props.animal_id ?? null;
  const canEditAnimais = props.canEditAnimais ?? true;

  // ✅ Blindagem: garante objeto
  const animalSafe = useMemo(
    () => (animalProp && typeof animalProp === "object" ? animalProp : null),
    [animalProp]
  );

  const numeroAnimal = animalSafe?.numero ?? animalSafe?.num ?? "—";
  const { fazendaAtualId } = useFazenda();
  const fazendaId = fazendaIdProp ?? fazendaAtualId ?? null;

  // ===================== CAMPOS (somente o que você definiu) =====================
  const [dataSecagem, setDataSecagem] = useState("");
  const [dataPartoPrevisto, setDataPartoPrevisto] = useState(""); // dd/mm/aaaa (auto)
  const [periodoPrevistoDias, setPeriodoPrevistoDias] = useState(null); // visual

  const [producaoAtual, setProducaoAtual] = useState(""); // litros/dia
  const [mastiteTem, setMastiteTem] = useState(null); // Sim/Não
  const [tratamentoSecagem, setTratamentoSecagem] = useState(null); // Nenhum / Selante / Antibiótico / Antibiótico+Selante
  const [condicaoCorporal, setCondicaoCorporal] = useState(null); // ECC 1–5

  const [ultimoIaEventoId, setUltimoIaEventoId] = useState(null);
  const [erro, setErro] = useState("");

  // ===================== Helpers de data =====================
  const formatarData = (valor) => {
    const limpo = String(valor || "").replace(/\D/g, "").slice(0, 8);
    const dia = limpo.slice(0, 2);
    const mes = limpo.slice(2, 4);
    const ano = limpo.slice(4, 8);
    return [dia, mes, ano].filter(Boolean).join("/");
  };

  const parseDDMMYYYY_toISO = (valor) => {
    const match = String(valor || "").trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    const dia = Number(match[1]);
    const mes = Number(match[2]);
    const ano = Number(match[3]);
    const date = new Date(ano, mes - 1, dia);
    if (
      Number.isNaN(date.getTime()) ||
      date.getFullYear() !== ano ||
      date.getMonth() !== mes - 1 ||
      date.getDate() !== dia
    ) {
      return null;
    }
    return `${String(ano).padStart(4, "0")}-${String(mes).padStart(2, "0")}-${String(dia).padStart(
      2,
      "0"
    )}`;
  };

  const isoToDDMMYYYY = (iso) => {
    if (!iso) return "";
    const s = String(iso).slice(0, 10);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return "";
    return `${m[3]}/${m[2]}/${m[1]}`;
  };

  const normalizeISODate = (value) => {
    if (!value) return null;
    const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  };

  const diffDias = (isoA, isoB) => {
    // isoA -> isoB
    const a = new Date(`${isoA}T00:00:00`);
    const b = new Date(`${isoB}T00:00:00`);
    const ms = b.getTime() - a.getTime();
    if (Number.isNaN(ms)) return null;
    return Math.round(ms / (1000 * 60 * 60 * 24));
  };

  const formatarDataPartoPrevisto = (valor) => {
    if (!valor) return "";
    if (typeof valor === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(valor)) return valor;
    return isoToDDMMYYYY(valor);
  };

  // ===================== Init =====================
  useEffect(() => {
    const hoje = new Date().toLocaleDateString("pt-BR");
    setDataSecagem(hoje);

    const keyHandler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  useEffect(() => {
    let ativo = true;
    const buscarPartoPrevisto = async () => {
      const animalId = animalIdProp ?? animalSafe?.id ?? animalSafe?.animal_id ?? null;
      if (!animalId || !fazendaId) return;

      const { data: previsao, error: previsaoError } = await supabase
        .from("v_repro_previsoes")
        .select("parto_previsto, ultima_ia_evento_id")
        .eq("fazenda_id", fazendaId)
        .eq("animal_id", animalId)
        .maybeSingle();

      if (!ativo) return;
      if (previsaoError) {
        console.error("SECAGEM ERRO", previsaoError);
      }

      const iaId = previsao?.ultima_ia_evento_id ?? null;
      if (iaId) setUltimoIaEventoId(iaId);

      const partoISO = normalizeISODate(previsao?.parto_previsto);
      const formatado = formatarDataPartoPrevisto(partoISO);
      setDataPartoPrevisto(formatado || "");
    };

    buscarPartoPrevisto();
    return () => {
      ativo = false;
    };
  }, [animalIdProp, animalSafe, fazendaId]);

  useEffect(() => {
    if (!animalSafe) setErro("Nenhuma vaca selecionada para registrar secagem.");
    else setErro("");
  }, [animalSafe]);

  // recalcula período seco quando datas mudarem
  useEffect(() => {
    const secISO = parseDDMMYYYY_toISO(dataSecagem);
    const ppISO = parseDDMMYYYY_toISO(dataPartoPrevisto);
    if (secISO && ppISO) {
      setPeriodoPrevistoDias(diffDias(secISO, ppISO));
    } else {
      setPeriodoPrevistoDias(null);
    }
  }, [dataSecagem, dataPartoPrevisto]);

  // ===================== Select options =====================
  const opcoesMastite = [
    { value: true, label: "Sim" },
    { value: false, label: "Não" },
  ];

  const opcoesTratamento = [
    { value: "NENHUM", label: "Nenhum" },
    { value: "SELANTE", label: "Selante" },
    { value: "ANTIBIOTICO", label: "Antibiótico" },
    { value: "ATB_SELANTE", label: "Antibiótico + Selante" },
  ];

  const opcoesCC = [
    { value: "1", label: "1 - Muito magra" },
    { value: "2", label: "2 - Magra" },
    { value: "3", label: "3 - Ideal" },
    { value: "4", label: "4 - Gorda" },
    { value: "5", label: "5 - Muito gorda" },
  ];

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "0.5rem",
      border: `2px solid ${state.isFocused ? "#f59e0b" : "#e5e7eb"}`,
      boxShadow: "none",
      minHeight: "44px",
      "&:hover": { borderColor: "#f59e0b" },
      fontFamily: "Poppins, sans-serif",
    }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
  };

  // ===================== Salvar =====================
  const salvar = async () => {
    if (!canEditAnimais) {
      toast.warn("Sem permissão para editar nesta fazenda");
      return;
    }
    setErro("");

    const animalId = animalIdProp ?? animalSafe?.id ?? animalSafe?.animal_id ?? null;
    if (!animalId) return setErro("Selecione uma vaca válida antes de salvar.");

    const dataSecISO = parseDDMMYYYY_toISO(dataSecagem);
    if (!dataSecISO) return setErro("Informe a Data da Secagem no formato dd/mm/aaaa.");

    // Parto previsto é “auto”: aceita vazio, mas se preencher, valida.
    const partoPrevISO = dataPartoPrevisto ? parseDDMMYYYY_toISO(dataPartoPrevisto) : null;
    if (dataPartoPrevisto && !partoPrevISO) {
      return setErro("Data prevista do parto inválida. Tente novamente.");
    }

    if (!fazendaId) return setErro("Fazenda atual não encontrada.");

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) return setErro("Não foi possível obter o usuário autenticado.");
    const userId = authData?.user?.id;
    if (!userId) return setErro("Sessão inválida (auth.uid vazio).");

    const eventoPaiId = ultimoIaEventoId ?? iaIdProp ?? null;

    const payloadEvento = {
      fazenda_id: fazendaId,
      animal_id: animalId,
      tipo: "SECAGEM",
      data_evento: dataSecISO,
      user_id: userId,
      observacoes: null,
      meta: {},
      evento_pai_id: eventoPaiId,
    };

    const { data: eventoData, error: eventoError } = await supabase
      .from("repro_eventos")
      .insert([payloadEvento])
      .select("id")
      .single();

    if (eventoError || !eventoData?.id) {
      console.error("SECAGEM ERRO", eventoError);
      return setErro("Erro ao salvar o evento de secagem.");
    }

    const payloadSecagem = {
      fazenda_id: fazendaId,
      animal_id: animalId,
      evento_id: eventoData.id,
      data_parto_previsto: partoPrevISO,
      producao_leite_l_dia:
        producaoAtual !== "" && !Number.isNaN(Number(producaoAtual)) ? Number(producaoAtual) : null,
      mastite: mastiteTem?.value ?? null,
      tratamento_secagem: tratamentoSecagem?.value ?? null,
      ecc: condicaoCorporal?.value ? Number(condicaoCorporal.value) : null,
      user_id: userId,
    };

    const { error: secagemError } = await supabase.from("secagens").insert([payloadSecagem]);
    if (secagemError) {
      console.error("SECAGEM ERRO", secagemError);
      await supabase.from("repro_eventos").delete().eq("id", eventoData.id);
      return setErro("Erro ao salvar os detalhes da secagem.");
    }

    onClose?.();
    props.onSaved?.();
  };

  // ===================== Estilos =====================
  const estilos = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    },
    modal: {
      background: "#fff",
      borderRadius: "1rem",
      width: "600px",
      maxHeight: "90vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Poppins, sans-serif",
      boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    },
    header: {
      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      color: "white",
      padding: "1.5rem",
      fontSize: "1.2rem",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    corpo: { padding: "2rem", overflowY: "auto" },
    linha2: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "1rem",
    },
    campo: { marginBottom: "1.25rem" },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      fontWeight: "500",
      fontSize: "0.95rem",
      color: "#374151",
    },
    obrigatorio: { color: "#ef4444", marginLeft: "0.25rem" },
    input: {
      width: "100%",
      padding: "0.75rem",
      fontSize: "0.95rem",
      borderRadius: "0.5rem",
      border: "2px solid #e5e7eb",
      boxSizing: "border-box",
      transition: "border-color 0.2s",
      fontFamily: "Poppins, sans-serif",
    },
    readonlyBox: {
      width: "100%",
      padding: "0.75rem",
      fontSize: "0.95rem",
      borderRadius: "0.5rem",
      border: "2px solid #e5e7eb",
      background: "#f9fafb",
      color: "#374151",
      boxSizing: "border-box",
      fontFamily: "Poppins, sans-serif",
    },
    footer: {
      padding: "1.5rem",
      borderTop: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "flex-end",
      gap: "1rem",
    },
    erro: {
      background: "#fee2e2",
      color: "#991b1b",
      padding: "0.75rem",
      borderRadius: "0.5rem",
      marginBottom: "1rem",
      fontSize: "0.9rem",
    },
    hint: {
      marginTop: "0.75rem",
      fontSize: "0.85rem",
      color: "#6b7280",
      lineHeight: 1.3,
    },
  };

  return (
    <div style={estilos.overlay} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={estilos.modal}>
        <div style={estilos.header}>🌾 Registrar Secagem — Vaca {numeroAnimal}</div>

        <div style={estilos.corpo}>
          {erro && <div style={estilos.erro}>⚠️ {erro}</div>}

          {/* Data secagem + parto previsto (visual) */}
          <div style={estilos.linha2}>
            <div style={estilos.campo}>
              <label style={estilos.label}>
                Data da Secagem<span style={estilos.obrigatorio}>*</span>
              </label>
              <input
                type="text"
                value={dataSecagem}
                onChange={(e) => setDataSecagem(formatarData(e.target.value))}
                style={estilos.input}
                placeholder="dd/mm/aaaa"
                autoFocus
                disabled={!animalSafe}
              />
            </div>

            <div style={estilos.campo}>
              <label style={estilos.label}>Data Prevista do Parto</label>
              <input
                type="text"
                value={dataPartoPrevisto || "—"}
                readOnly
                style={estilos.readonlyBox}
                placeholder="—"
                disabled={!animalSafe}
              />
            </div>
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>Dias (previsto)</label>
            <div style={estilos.readonlyBox}>
              {typeof periodoPrevistoDias === "number" ? periodoPrevistoDias : "—"}
            </div>
            <div style={estilos.hint}>
              Calculado automaticamente pela diferença entre a data da secagem e a previsão de parto.
            </div>
          </div>

          {/* Produção atual */}
          <div style={estilos.campo}>
            <label style={estilos.label}>Produção de leite no momento da secagem (L/dia)</label>
            <input
              type="number"
              value={producaoAtual}
              onChange={(e) => setProducaoAtual(e.target.value)}
              style={estilos.input}
              placeholder="Ex: 12.5"
              step="0.1"
              disabled={!animalSafe}
            />
          </div>

          {/* Mastite teste + tratamento */}
          <div style={estilos.linha2}>
            <div style={estilos.campo}>
              <label style={estilos.label}>Mastite no momento da secagem?</label>
              <Select
                options={opcoesMastite}
                value={mastiteTem}
                onChange={setMastiteTem}
                styles={selectStyles}
                placeholder="Selecione..."
                isDisabled={!animalSafe}
                isClearable
              />
            </div>

            <div style={estilos.campo}>
              <label style={estilos.label}>Tratamento de secagem</label>
              <Select
                options={opcoesTratamento}
                value={tratamentoSecagem}
                onChange={setTratamentoSecagem}
                styles={selectStyles}
                placeholder="Selecione..."
                isDisabled={!animalSafe}
                isClearable
              />
            </div>
          </div>

          {/* ECC */}
          <div style={estilos.campo}>
            <label style={estilos.label}>Condição corporal ao secar (ECC)</label>
            <Select
              options={opcoesCC}
              value={condicaoCorporal}
              onChange={setCondicaoCorporal}
              styles={selectStyles}
              placeholder="Selecione..."
              isDisabled={!animalSafe}
              isClearable
            />
          </div>
        </div>

        <div style={estilos.footer}>
          <button onClick={() => onClose?.()} className="botao-cancelar">
            Cancelar
          </button>
          <button onClick={salvar} className="botao-acao" disabled={!animalSafe || !canEditAnimais} title={!canEditAnimais ? "Sem permissão para editar nesta fazenda" : undefined}>
            💾 Salvar Secagem
          </button>
        </div>
      </div>
    </div>
  );
}
