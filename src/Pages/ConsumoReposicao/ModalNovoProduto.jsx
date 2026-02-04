import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { X, Package, Pill, FlaskConical, AlertCircle, Info, Layers, Beaker, Box } from "lucide-react";

/* ===================== DESIGN SYSTEM ===================== */
const theme = {
  colors: {
    slate: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
    indigo: { 50: "#eef2ff", 100: "#e0e7ff", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca" },
    success: "#059669",
    warning: "#d97706",
    danger: "#dc2626",
  },
  radius: { sm: "4px", md: "6px", lg: "8px" },
};

const rsStyles = {
  container: (b) => ({ ...b, width: "100%" }),
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderRadius: theme.radius.md,
    borderColor: state.isFocused ? theme.colors.indigo[500] : theme.colors.slate[300],
    boxShadow: state.isFocused ? `0 0 0 1px ${theme.colors.indigo[500]}` : "none",
    fontSize: 13,
    background: state.isFocused ? "#fff" : theme.colors.slate[50],
    cursor: "pointer",
    "&:hover": { borderColor: theme.colors.slate[400] },
  }),
  valueContainer: (base) => ({ ...base, padding: "0 12px" }),
  placeholder: (base) => ({ ...base, color: theme.colors.slate[400] }),
  menuPortal: (b) => ({ ...b, zIndex: 99999 }),
  menu: (b) => ({
    ...b,
    zIndex: 99999,
    borderRadius: theme.radius.md,
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
  }),
  option: (base, state) => ({
    ...base,
    fontSize: 13,
    background: state.isSelected ? theme.colors.indigo[50] : state.isFocused ? theme.colors.slate[50] : "transparent",
    color: state.isSelected ? theme.colors.indigo[700] : theme.colors.slate[700],
    fontWeight: state.isSelected ? 600 : 400,
    cursor: "pointer",
  }),
};

export default function ModalNovoProduto({ open, onClose, onSaved, initial = null }) {
  const isEdit = !!initial?.id;

  const [form, setForm] = useState(() => toForm(initial));
  const [modoControle, setModoControle] = useState(null); // 'solido_fracionado' | 'liquido_volume' | 'unidade_integral' | 'peso'

  /* ===================== LOOKUPS ===================== */
  const categorias = useMemo(
    () => [
      { value: "Farmácia", label: "Farmácia", icon: Pill },
      { value: "Reprodução", label: "Reprodução", icon: FlaskConical },
      { value: "Cozinha", label: "Cozinha", icon: Package },
      { value: "Higiene", label: "Higiene e Limpeza", icon: Package },
      { value: "Materiais", label: "Materiais Gerais", icon: Box },
    ],
    []
  );

  // ✅ Farmácia: “Hormônio” é o tipo, e a apresentação define se é líquido ou dispositivo
  const tiposFarmacia = useMemo(
    () => [
      { value: "Antibiótico", label: "Antibiótico" },
      { value: "Anti-inflamatório", label: "Anti-inflamatório" },
      { value: "Vacina", label: "Vacina" },
      { value: "Antiparasitário", label: "Antiparasitário" },
      { value: "Hormônio", label: "Hormônio (líquido ou dispositivo)" },
    ],
    []
  );

  const apresentacoesHormonio = useMemo(
    () => [
      { value: "LIQUIDO", label: "Injetável (líquido) — controla por mL/L" },
      { value: "DISPOSITIVO", label: "Dispositivo/Implante — controla por usos/reutilizações" },
    ],
    []
  );

  const tiposReproducao = useMemo(
    () => [
      { value: "Semen", label: "Sêmen (Palheta)" },
      { value: "Embriao", label: "Embrião" },
      { value: "Material", label: "Material de coleta/IA" },
    ],
    []
  );

  const modosControleDefinicoes = useMemo(
    () => ({
      solido_fracionado: {
        titulo: "Sólido Fracionado",
        desc: "Para dispositivos/implantes que rendem múltiplos usos (ou reutilizações)",
        exemplo: "Ex: Dispositivo (1 unidade = 3 usos)",
        icon: Layers,
        unidades: ["un", "dispositivo", "implante"],
      },
      liquido_volume: {
        titulo: "Líquido por Volume",
        desc: "Estoque controlado por mL/L. A dose é definida no protocolo/evento na hora de aplicar.",
        exemplo: "Ex: Benzoato 50mL — desconto varia por protocolo (2mL, 5mL, 20mL...)",
        icon: Beaker,
        unidades: ["ml", "litro"],
      },
      unidade_integral: {
        titulo: "Unidade Integral",
        desc: "Cada aplicação consome 1 unidade completa do estoque",
        exemplo: "Ex: Sêmen (1 dose), vacina dose única, luvas (1 par)",
        icon: Box,
        unidades: ["dose", "un", "frasco", "ampola"],
      },
      peso: {
        titulo: "Controle por Peso",
        desc: "Para produtos em pó/premix/mineral controlados em g/kg/mg",
        exemplo: "Ex: Mineral 25kg — desconto (g) varia por dieta/lote",
        icon: Package,
        unidades: ["g", "kg", "mg"],
      },
    }),
    []
  );

  /* ===================== OPEN / INIT ===================== */
  useEffect(() => {
    if (!open) return;

    const inicial = toForm(initial);
    setForm(inicial);

    // Detecta modo por dados
    if (inicial.modoControle) setModoControle(inicial.modoControle);
    else setModoControle(null);
  }, [initial, open]);

  const isFarmacia = form.categoria === "Farmácia";
  const isReproducao = form.categoria === "Reprodução";
  const isAntibiotico = form.tipoFarmacia === "Antibiótico";

  const isHormonio = isFarmacia && form.tipoFarmacia === "Hormônio";
  const hormonioLiquido = isHormonio && form.apresentacaoHormonio === "LIQUIDO";
  const hormonioDispositivo = isHormonio && form.apresentacaoHormonio === "DISPOSITIVO";

  // ✅ Reprodução: sempre por dose
  const isReproDose = isReproducao && !!form.tipoReproducao;

  /* ===================== AUTO MODO CONTROLE ===================== */
  useEffect(() => {
    if (!open) return;

    // 1) Reprodução: trava em dose
    if (isReproDose && !isEdit) {
      setModoControle("unidade_integral");
      setForm((f) => ({
        ...f,
        modoControle: "unidade_integral",
        unidade: "dose",
      }));
      return;
    }

    // 2) Farmácia: se hormônio, depende da apresentação
    if (isHormonio && !isEdit) {
      if (hormonioLiquido) {
        setModoControle("liquido_volume");
        setForm((f) => ({
          ...f,
          modoControle: "liquido_volume",
          unidade: "ml",
          unidadeVolume: f.unidadeVolume || "ml",
        }));
        return;
      }
      if (hormonioDispositivo) {
        setModoControle("solido_fracionado");
        setForm((f) => ({
          ...f,
          modoControle: "solido_fracionado",
          unidade: "un",
          usosPorUnidade: Number(f.usosPorUnidade) >= 2 ? f.usosPorUnidade : "3",
        }));
        return;
      }
    }

    // 3) Farmácia: demais tipos (vacina/antibiótico etc.)
    // - vacinas geralmente unidade integral
    // - antibiótico pode ser unidade integral (bisnaga/frasco) ou líquido (se tu quiser depois, mas não vamos forçar)
    if (isFarmacia && form.tipoFarmacia && !isEdit && !isHormonio) {
      if (form.tipoFarmacia === "Vacina") {
        setModoControle("unidade_integral");
        setForm((f) => ({ ...f, modoControle: "unidade_integral", unidade: f.unidade || "dose" }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form.categoria, form.tipoReproducao, form.tipoFarmacia, form.apresentacaoHormonio]);

  if (!open) return null;

  /* ===================== VALIDAR ===================== */
  const validar = () => {
    if (!form.nomeComercial || !form.categoria) {
      alert("Preencha nome e categoria.");
      return null;
    }

    // Farmácia exige tipo
    if (isFarmacia && !form.tipoFarmacia) {
      alert("Selecione o tipo farmacêutico.");
      return null;
    }

    // Reprodução exige tipo
    if (isReproducao && !form.tipoReproducao) {
      alert("Selecione o tipo de material (sêmen/embrião/etc.).");
      return null;
    }

    // Hormônio exige apresentação
    if (isHormonio && !form.apresentacaoHormonio) {
      alert("Selecione se o hormônio é líquido ou dispositivo/implante.");
      return null;
    }

    if (!modoControle) {
      alert("Selecione um modo de controle de estoque.");
      return null;
    }

    // ✅ Regras por modo
    if (modoControle === "solido_fracionado") {
      if (!form.usosPorUnidade || Number(form.usosPorUnidade) < 2) {
        alert("Para dispositivo/implante, informe quantos usos/reutilizações por unidade (mínimo 2).");
        return null;
      }
      // pesoDose é opcional (pode ter implante 1.9g, mas nem sempre você quer obrigar)
    }

    if (modoControle === "liquido_volume") {
      if (!form.volumeTotal) {
        alert("Informe o volume total do frasco (ex: 50 mL).");
        return null;
      }
      if (Number(form.volumeTotal) <= 0) {
        alert("O volume total deve ser maior que zero.");
        return null;
      }
      // ✅ NÃO valida “dosagem por uso” porque isso será definido nos protocolos/eventos
    }

    if (modoControle === "peso") {
      if (!form.pesoTotal || Number(form.pesoTotal) <= 0) {
        alert("Informe o peso total por unidade (ex: 25 kg).");
        return null;
      }
      // dosagemPeso NÃO é obrigatória (varia por dieta)
    }

    // Entrada inicial
    if (!isEdit) {
      if (!form.qtdEntrada || Number(form.qtdEntrada) <= 0) {
        alert("Informe a quantidade inicial de entrada.");
        return null;
      }
      if (form.valorTotalEntrada === "" || Number(form.valorTotalEntrada) < 0) {
        alert("Informe o valor total da entrada (R$).");
        return null;
      }
    }

    return normalizePayload({ ...form, modoControle }, isEdit);
  };

  /* ===================== UI HELPERS ===================== */
  const ModoCard = ({ modo, active, onClick }) => {
    const definicao = modosControleDefinicoes[modo];
    const Icon = definicao.icon;

    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "12px",
          padding: "16px",
          borderRadius: theme.radius.lg,
          border: "2px solid",
          borderColor: active ? theme.colors.indigo[500] : theme.colors.slate[200],
          background: active ? theme.colors.indigo[50] : "#fff",
          cursor: "pointer",
          textAlign: "left",
          width: "100%",
          transition: "all 0.2s",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: theme.radius.md,
            background: active ? theme.colors.indigo[100] : theme.colors.slate[100],
            color: active ? theme.colors.indigo[600] : theme.colors.slate[500],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} />
        </div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: active ? theme.colors.indigo[900] : theme.colors.slate[800] }}>
            {definicao.titulo}
          </div>
          <div style={{ fontSize: "12px", color: theme.colors.slate[500], marginTop: "4px", lineHeight: 1.4 }}>
            {definicao.desc}
          </div>
          <div style={{ fontSize: "11px", color: active ? theme.colors.indigo[600] : theme.colors.slate[400], marginTop: "8px", fontStyle: "italic" }}>
            {definicao.exemplo}
          </div>
        </div>
      </button>
    );
  };

  const menuPortalTarget = typeof document !== "undefined" ? document.body : null;

  // ✅ Mostra seleção de modo só quando o modo não está “travado” pelo tipo
  const modoTravadoPorTipo =
    (isReproDose) ||
    (isHormonio && !!form.apresentacaoHormonio) ||
    (isFarmacia && form.tipoFarmacia === "Vacina");

  const mostrarSelecaoModo =
    !!form.categoria &&
    !isEdit &&
    !modoTravadoPorTipo &&
    (!isFarmacia || !!form.tipoFarmacia || !isFarmacia) &&
    (form.categoria === "Cozinha" || form.categoria === "Higiene" || form.categoria === "Materiais" || (isFarmacia && !isHormonio && !!form.tipoFarmacia));

  // ✅ Para Farmácia (não hormônio) a pessoa pode escolher (se quiser) modo manualmente — mas aqui eu deixo liberar via cards.
  // Se tu quiser travar mais coisas depois (ex antibiótico sempre unidade), a gente trava.

  /* ===================== RENDER ===================== */
  return (
    <div style={overlay} onClick={onClose}>
      <div style={modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div style={header}>
          <div style={headerLeft}>
            <div style={headerIcon}>
              <Package size={20} />
            </div>
            <div>
              <h2 style={headerTitle}>{isEdit ? "Editar Produto" : "Cadastrar Produto"}</h2>
              <p style={headerSubtitle}>Configure o controle de estoque adequado ao tipo de produto</p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={btnClose}>
            <X size={20} />
          </button>
        </div>

        <div style={content}>
          {/* ETAPA 1: IDENTIFICAÇÃO */}
          <section style={section}>
            <div style={sectionTitle}>Identificação</div>

            <div style={grid2}>
              <Field label="Nome Comercial *">
                <input
                  style={input}
                  value={form.nomeComercial}
                  onChange={(e) => setForm((f) => ({ ...f, nomeComercial: e.target.value }))}
                  placeholder="Ex: Benzoato de Estradiol, GnRH, CIDR, Palheta..."
                />
              </Field>

              <Field label="Categoria *">
                <Select
                  options={categorias}
                  value={categorias.find((c) => c.value === form.categoria) || null}
                  onChange={(opt) => {
                    setForm((f) => ({
                      ...f,
                      categoria: opt?.value || "",
                      tipoFarmacia: "",
                      tipoReproducao: "",
                      apresentacaoHormonio: "",
                      modoControle: "",
                      unidade: "",
                      // limpa configs específicas
                      volumeTotal: "",
                      unidadeVolume: "ml",
                      usosPorUnidade: "1",
                      pesoTotal: "",
                      dosagemPeso: "",
                    }));
                    setModoControle(null);
                  }}
                  styles={rsStyles}
                  placeholder="Selecione..."
                  menuPortalTarget={menuPortalTarget}
                />
              </Field>
            </div>

            {/* TIPO ESPECÍFICO */}
            {isFarmacia && (
              <div style={{ marginTop: "16px" }}>
                <Field label="Tipo Farmacêutico *">
                  <Select
                    options={tiposFarmacia}
                    value={tiposFarmacia.find((t) => t.value === form.tipoFarmacia) || null}
                    onChange={(opt) => {
                      const v = opt?.value || "";
                      setForm((f) => ({
                        ...f,
                        tipoFarmacia: v,
                        apresentacaoHormonio: "",
                        // limpa configs quando troca tipo
                        volumeTotal: "",
                        usosPorUnidade: v === "Hormônio" ? f.usosPorUnidade : "1",
                      }));
                      // se trocar tipo, reseta modo e ele será reatribuído no useEffect
                      setModoControle(null);
                    }}
                    styles={rsStyles}
                    placeholder="Selecione o tipo..."
                    menuPortalTarget={menuPortalTarget}
                  />
                </Field>

                {/* ✅ Hormônio: apresentação líquido vs dispositivo */}
                {isHormonio && (
                  <div style={{ marginTop: "12px" }}>
                    <Field label="Apresentação do Hormônio *">
                      <Select
                        options={apresentacoesHormonio}
                        value={apresentacoesHormonio.find((a) => a.value === form.apresentacaoHormonio) || null}
                        onChange={(opt) => {
                          const val = opt?.value || "";
                          setForm((f) => ({
                            ...f,
                            apresentacaoHormonio: val,
                            // ajustes “base”
                            unidade: val === "LIQUIDO" ? "ml" : "un",
                            unidadeVolume: "ml",
                            usosPorUnidade: val === "DISPOSITIVO" ? (Number(f.usosPorUnidade) >= 2 ? f.usosPorUnidade : "3") : "1",
                            volumeTotal: val === "LIQUIDO" ? f.volumeTotal : "",
                          }));
                          setModoControle(null);
                        }}
                        styles={rsStyles}
                        placeholder="Selecione..."
                        menuPortalTarget={menuPortalTarget}
                      />
                    </Field>

                    {hormonioLiquido && (
                      <div style={{ marginTop: 10 }}>
                        <div style={infoBox}>
                          <Info size={16} />
                          <div>
                            <strong>Importante:</strong> a <strong>dose (mL)</strong> será informada no{" "}
                            <strong>protocolo/evento</strong> (IATF, cisto, indução etc.). Aqui o estoque fica em{" "}
                            <strong>volume total</strong>.
                          </div>
                        </div>
                      </div>
                    )}

                    {hormonioDispositivo && (
                      <div style={{ marginTop: 10 }}>
                        <div style={infoBox}>
                          <Info size={16} />
                          <div>
                            <strong>Dispositivo/Implante:</strong> aqui faz sentido controlar por{" "}
                            <strong>usos/reutilizações</strong> (ex.: 1 dispositivo = 3 usos).
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {isReproducao && (
              <div style={{ marginTop: "16px" }}>
                <Field label="Tipo de Material *">
                  <Select
                    options={tiposReproducao}
                    value={tiposReproducao.find((t) => t.value === form.tipoReproducao) || null}
                    onChange={(opt) => {
                      const v = opt?.value || "";
                      setForm((f) => ({
                        ...f,
                        tipoReproducao: v,
                        modoControle: "unidade_integral",
                        unidade: "dose",
                      }));
                      setModoControle("unidade_integral");
                    }}
                    styles={rsStyles}
                    placeholder="Selecione..."
                    menuPortalTarget={menuPortalTarget}
                  />
                </Field>

                {isReproDose && (
                  <div style={{ marginTop: 10 }}>
                    <div style={infoBox}>
                      <Info size={16} />
                      <div>
                        <strong>Reprodução:</strong> estoque sempre em <strong>dose</strong> (1 palheta = 1 dose; 1 embrião = 1 dose).
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ETAPA 2: MODO DE CONTROLE (só quando não travado) */}
          {mostrarSelecaoModo && (
            <section style={section}>
              <div style={sectionTitle}>
                Modo de Controle de Estoque
                <span style={sectionSubtitle}>Como este produto será descontado do estoque?</span>
              </div>

              <div style={gridModos}>
                {Object.keys(modosControleDefinicoes).map((modo) => (
                  <ModoCard
                    key={modo}
                    modo={modo}
                    active={modoControle === modo}
                    onClick={() => {
                      const unidadeSugerida = modosControleDefinicoes[modo]?.unidades?.[0] || "";
                      setModoControle(modo);
                      setForm((f) => ({
                        ...f,
                        modoControle: modo,
                        unidade: unidadeSugerida,
                        usosPorUnidade: modo === "solido_fracionado" ? (Number(f.usosPorUnidade) >= 2 ? f.usosPorUnidade : "3") : f.usosPorUnidade,
                      }));
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ETAPA 3: CONFIGURAÇÃO DO MODO (quando aplicável) */}
          {modoControle && (
            <section style={{ ...section, background: theme.colors.indigo[50], borderColor: theme.colors.indigo[100] }}>
              <div style={{ ...sectionTitle, color: theme.colors.indigo[900] }}>
                {React.createElement(modosControleDefinicoes[modoControle].icon, { size: 16, style: { marginRight: 8 } })}
                Configuração: {modosControleDefinicoes[modoControle].titulo}
              </div>

              {/* SÓLIDO FRACIONADO (dispositivos/implantes) */}
              {modoControle === "solido_fracionado" && (
                <div style={grid2}>
                  <Field label="Quantos usos/reutilizações por unidade? *">
                    <input
                      style={input}
                      type="number"
                      min="2"
                      max="50"
                      value={form.usosPorUnidade || ""}
                      onChange={(e) => setForm((f) => ({ ...f, usosPorUnidade: e.target.value }))}
                      placeholder="Ex: 3"
                    />
                    <span style={fieldHint}>Ex.: 1 dispositivo pode ser reutilizado em 3 protocolos.</span>
                  </Field>

                  <Field label="Observação/Apresentação (opcional)">
                    <input
                      style={input}
                      value={form.apresentacao || ""}
                      onChange={(e) => setForm((f) => ({ ...f, apresentacao: e.target.value }))}
                      placeholder="Ex: Caixa com 10 dispositivos"
                    />
                  </Field>

                  <div style={calcBox}>
                    <div style={{ fontWeight: 600, marginBottom: "8px" }}>Cálculo automático:</div>
                    <div style={{ fontSize: "14px", color: theme.colors.slate[800] }}>
                      Se entrar <strong>{Number(form.qtdEntrada || 0) || 0}</strong> unidade(s) com{" "}
                      <strong>{Number(form.usosPorUnidade || 0) || 0}</strong> usos cada, você terá{" "}
                      <strong>{(Number(form.qtdEntrada || 0) || 0) * (parseInt(form.usosPorUnidade || "0", 10) || 0)}</strong>{" "}
                      usos disponíveis no estoque.
                    </div>
                  </div>
                </div>
              )}

              {/* LÍQUIDO POR VOLUME (sem “dosagem por uso” aqui!) */}
              {modoControle === "liquido_volume" && (
                <div style={grid2}>
                  <Field label="Volume Total do Frasco *">
                    <div style={flexRow}>
                      <input
                        style={{ ...input, flex: 1 }}
                        type="number"
                        value={form.volumeTotal || ""}
                        onChange={(e) => setForm((f) => ({ ...f, volumeTotal: e.target.value }))}
                        placeholder="Ex: 50"
                      />
                      <select
                        style={{ ...input, width: 120, marginLeft: 8 }}
                        value={form.unidadeVolume || "ml"}
                        onChange={(e) => setForm((f) => ({ ...f, unidadeVolume: e.target.value, unidade: e.target.value }))}
                      >
                        <option value="ml">mL</option>
                        <option value="litro">Litros</option>
                      </select>
                    </div>
                    <span style={fieldHint}>
                      Estoque será controlado em <strong>{form.unidadeVolume || "ml"}</strong>. A dose será definida no protocolo/evento.
                    </span>
                  </Field>

                  <Field label="Concentração (opcional)">
                    <input
                      style={input}
                      value={form.concentracao || ""}
                      onChange={(e) => setForm((f) => ({ ...f, concentracao: e.target.value }))}
                      placeholder="Ex: 50µg/mL, 100µg (GnRH análogo)"
                    />
                  </Field>

                  <div style={calcBox}>
                    <div style={{ fontWeight: 600, marginBottom: "8px" }}>Total em estoque (estimativa):</div>

                    {form.volumeTotal && form.qtdEntrada ? (
                      <div style={{ fontSize: "14px", color: theme.colors.slate[800] }}>
                        <strong>{Number(form.qtdEntrada)}</strong> frasco(s) ×{" "}
                        <strong>
                          {Number(form.volumeTotal)}
                          {form.unidadeVolume || "ml"}
                        </strong>{" "}
                        ={" "}
                        <strong>
                          {Math.max(0, Number(form.qtdEntrada) * Number(form.volumeTotal))}{" "}
                          {form.unidadeVolume || "ml"}
                        </strong>{" "}
                        disponíveis.
                      </div>
                    ) : (
                      <div style={{ fontSize: "13px", color: theme.colors.slate[600] }}>
                        Preencha volume e quantidade de entrada para ver o total
                      </div>
                    )}

                    <div style={{ marginTop: 10, fontSize: 12, color: theme.colors.slate[600], lineHeight: 1.4 }}>
                      ✅ Desconto real acontece quando você registrar a aplicação no protocolo/evento (ex.: 2mL na IATF, 5mL em cisto, 20mL em indução…).
                    </div>
                  </div>
                </div>
              )}

              {/* UNIDADE INTEGRAL */}
              {modoControle === "unidade_integral" && (
                <div style={grid2}>
                  <Field label="Unidade de Controle">
                    <Select
                      options={[
                        { value: "dose", label: "Dose" },
                        { value: "un", label: "Unidade" },
                        { value: "frasco", label: "Frasco" },
                        { value: "ampola", label: "Ampola" },
                      ]}
                      value={
                        [
                          { value: "dose", label: "Dose" },
                          { value: "un", label: "Unidade" },
                          { value: "frasco", label: "Frasco" },
                          { value: "ampola", label: "Ampola" },
                        ].find((o) => o.value === (form.unidade || "dose")) || { value: "dose", label: "Dose" }
                      }
                      onChange={(opt) => setForm((f) => ({ ...f, unidade: opt?.value || "dose" }))}
                      styles={rsStyles}
                      menuPortalTarget={menuPortalTarget}
                      isDisabled={isReproDose} // ✅ reprodução trava em dose
                    />
                    {isReproDose && <span style={fieldHint}>Reprodução: sempre “dose”.</span>}
                  </Field>

                  <div style={infoBox}>
                    <Info size={16} />
                    <div>
                      <strong>Unidade Integral:</strong> cada lançamento de uso desconta 1 unidade completa do estoque.
                    </div>
                  </div>
                </div>
              )}

              {/* PESO */}
              {modoControle === "peso" && (
                <div style={grid2}>
                  <Field label="Peso Total por Unidade (ex: saco/frasco) *">
                    <div style={flexRow}>
                      <input
                        style={{ ...input, flex: 1 }}
                        type="number"
                        value={form.pesoTotal || ""}
                        onChange={(e) => setForm((f) => ({ ...f, pesoTotal: e.target.value }))}
                        placeholder="Ex: 25"
                      />
                      <select
                        style={{ ...input, width: 120, marginLeft: 8 }}
                        value={form.unidadePeso || "kg"}
                        onChange={(e) => setForm((f) => ({ ...f, unidadePeso: e.target.value, unidade: e.target.value }))}
                      >
                        <option value="g">gramas</option>
                        <option value="kg">kg</option>
                        <option value="mg">mg</option>
                      </select>
                    </div>
                    <span style={fieldHint}>Estoque por peso. A dosagem pode variar por dieta/lote.</span>
                  </Field>

                  <Field label="Dosagem padrão (opcional)">
                    <input
                      style={input}
                      type="number"
                      value={form.dosagemPeso || ""}
                      onChange={(e) => setForm((f) => ({ ...f, dosagemPeso: e.target.value }))}
                      placeholder="Ex: 50 (g)"
                    />
                    <span style={fieldHint}>Opcional. Se não quiser, deixe vazio.</span>
                  </Field>

                  <div style={calcBox}>
                    <div style={{ fontWeight: 600, marginBottom: "8px" }}>Total em estoque (estimativa):</div>
                    {form.pesoTotal && form.qtdEntrada ? (
                      <div style={{ fontSize: 14, color: theme.colors.slate[800] }}>
                        <strong>{Number(form.qtdEntrada)}</strong> unidade(s) ×{" "}
                        <strong>
                          {Number(form.pesoTotal)}
                          {form.unidadePeso || "kg"}
                        </strong>{" "}
                        ={" "}
                        <strong>
                          {Math.max(0, Number(form.qtdEntrada) * Number(form.pesoTotal))} {form.unidadePeso || "kg"}
                        </strong>
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: theme.colors.slate[600] }}>
                        Preencha peso e quantidade de entrada para ver o total
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ENTRADA INICIAL */}
          {!isEdit && modoControle && (
            <section style={section}>
              <div style={sectionTitle}>Entrada Inicial no Estoque</div>

              <div style={grid3}>
                <Field label="Quantidade *">
                  <input
                    style={input}
                    type="number"
                    value={form.qtdEntrada}
                    onChange={(e) => setForm((f) => ({ ...f, qtdEntrada: e.target.value }))}
                    placeholder={modoControle === "liquido_volume" ? "Ex: 5 frascos" : "Ex: 10 unidades"}
                  />
                </Field>

                <Field label="Valor Total (R$) *">
                  <input
                    style={input}
                    type="number"
                    step="0.01"
                    value={form.valorTotalEntrada}
                    onChange={(e) => setForm((f) => ({ ...f, valorTotalEntrada: e.target.value }))}
                  />
                </Field>

                <Field label="Validade">
                  <input
                    style={input}
                    type="date"
                    value={form.validadeEntrada}
                    onChange={(e) => setForm((f) => ({ ...f, validadeEntrada: e.target.value }))}
                  />
                </Field>
              </div>
            </section>
          )}

          {/* CARÊNCIAS (só antibiótico) */}
          {isAntibiotico && (
            <section style={{ ...section, background: `${theme.colors.warning}08`, borderColor: `${theme.colors.warning}30` }}>
              <div style={{ ...sectionTitle, color: theme.colors.warning }}>
                <AlertCircle size={16} style={{ marginRight: 8 }} />
                Carências Obrigatórias
              </div>
              <div style={grid2}>
                <CarenciaInput
                  titulo="Carência Leite"
                  dias={form.carenciaLeiteDias}
                  setDias={(v) => setForm((f) => ({ ...f, carenciaLeiteDias: v }))}
                  sem={form.semCarenciaLeite}
                  setSem={(v) => setForm((f) => ({ ...f, semCarenciaLeite: v, carenciaLeiteDias: v ? "" : f.carenciaLeiteDias }))}
                />
                <CarenciaInput
                  titulo="Carência Carne"
                  dias={form.carenciaCarneDias}
                  setDias={(v) => setForm((f) => ({ ...f, carenciaCarneDias: v }))}
                  sem={form.semCarenciaCarne}
                  setSem={(v) => setForm((f) => ({ ...f, semCarenciaCarne: v, carenciaCarneDias: v ? "" : f.carenciaCarneDias }))}
                />
              </div>
            </section>
          )}
        </div>

        {/* FOOTER */}
        <div style={footer}>
          <button type="button" style={btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            style={{ ...btnPrimary, opacity: !modoControle ? 0.6 : 1 }}
            onClick={() => {
              const payload = validar();
              if (payload) onSaved?.(payload);
            }}
            disabled={!modoControle}
          >
            {isEdit ? "Salvar Alterações" : "Cadastrar Produto"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== SUBCOMPONENTES ===================== */
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function CarenciaInput({ titulo, dias, setDias, sem, setSem }) {
  return (
    <div style={carenciaBox}>
      <div style={carenciaHeader}>{titulo}</div>
      <div style={carenciaRow}>
        <input
          style={{ ...input, flex: 1, opacity: sem ? 0.5 : 1 }}
          type="number"
          value={dias || ""}
          onChange={(e) => setDias(e.target.value)}
          disabled={sem}
          placeholder="Dias"
        />
        <label style={checkboxLabel}>
          <input type="checkbox" checked={sem} onChange={(e) => setSem(e.target.checked)} />
          <span>Sem carência</span>
        </label>
      </div>
    </div>
  );
}

/* ===================== HELPERS ===================== */
function toForm(initial) {
  const d = initial || {};
  return {
    nomeComercial: d.nomeComercial ?? "",
    categoria: d.categoria ?? "",
    tipoFarmacia: d.tipoFarmacia ?? "",
    tipoReproducao: d.tipoReproducao ?? "",

    // ✅ novo: apresentação do hormônio
    apresentacaoHormonio: d.apresentacaoHormonio ?? "",

    modoControle: d.modoControle ?? "",

    // Sólido fracionado
    usosPorUnidade: String(d.usosPorUnidade ?? "1"),

    // Líquido
    volumeTotal: d.volumeTotal ?? "",
    unidadeVolume: d.unidadeVolume ?? "ml",
    concentracao: d.concentracao ?? "",

    // Peso
    pesoTotal: d.pesoTotal ?? "",
    unidadePeso: d.unidadePeso ?? "kg",
    dosagemPeso: d.dosagemPeso ?? "",

    unidade: d.unidade ?? "",

    apresentacao: d.apresentacao ?? "",

    carenciaLeiteDias: d.carenciaLeiteDias ?? "",
    carenciaCarneDias: d.carenciaCarneDias ?? "",
    semCarenciaLeite: d.semCarenciaLeite ?? false,
    semCarenciaCarne: d.semCarenciaCarne ?? false,

    qtdEntrada: "",
    valorTotalEntrada: "",
    validadeEntrada: "",
  };
}

function normalizePayload(f, isEdit) {
  const calcularSaldoBase = () => {
    const qtd = Number(f.qtdEntrada) || 0;

    switch (f.modoControle) {
      case "solido_fracionado":
        // saldo em "usos"
        return qtd * (parseInt(f.usosPorUnidade, 10) || 1);

      case "liquido_volume": {
        // ✅ saldo em volume total (ml ou litro)
        const volPorFrasco = Number(f.volumeTotal) || 0;
        return Math.max(0, qtd * volPorFrasco);
      }

      case "peso": {
        // saldo em peso total (g/kg/mg)
        const pesoPorUn = Number(f.pesoTotal) || 0;
        return Math.max(0, qtd * pesoPorUn);
      }

      default:
        // unidade integral: saldo em unidades
        return qtd;
    }
  };

  const produto = {
    nomeComercial: (f.nomeComercial || "").trim(),
    categoria: f.categoria,
    tipoFarmacia: f.tipoFarmacia || null,
    tipoReproducao: f.tipoReproducao || null,
    apresentacaoHormonio: f.apresentacaoHormonio || null,

    modoControle: f.modoControle,

    // unidade “base” (dose/un/ml/kg etc.)
    unidade: f.unidade || null,

    apresentacao: (f.apresentacao || "").trim() || null,

    ...(f.modoControle === "solido_fracionado" && {
      usosPorUnidade: parseInt(f.usosPorUnidade, 10) || 1,
    }),

    ...(f.modoControle === "liquido_volume" && {
      volumeTotal: Number(f.volumeTotal) || null,
      unidadeVolume: f.unidadeVolume,
      concentracao: (f.concentracao || "").trim() || null,
    }),

    ...(f.modoControle === "peso" && {
      pesoTotal: Number(f.pesoTotal) || null,
      unidadePeso: f.unidadePeso,
      dosagemPeso: f.dosagemPeso !== "" ? Number(f.dosagemPeso) : null,
    }),

    carenciaLeiteDias: f.semCarenciaLeite ? 0 : Number(f.carenciaLeiteDias) || null,
    carenciaCarneDias: f.semCarenciaCarne ? 0 : Number(f.carenciaCarneDias) || null,
    semCarenciaLeite: !!f.semCarenciaLeite,
    semCarenciaCarne: !!f.semCarenciaCarne,
  };

  const lote =
  !isEdit && f.qtdEntrada
    ? {
        quantidade: Number(f.qtdEntrada),
        valorTotal: Number(f.valorTotalEntrada) || 0,
        validade: f.validadeEntrada || null,
      }
    : null;

return { produto, lote };
}

/* ===================== ESTILOS ===================== */
const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  background: "rgba(15, 23, 42, 0.6)",
  backdropFilter: "blur(4px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
};

const modalContainer = {
  width: "min(900px, 95vw)",
  maxHeight: "90vh",
  background: "#fff",
  borderRadius: theme.radius.lg,
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
  display: "flex",
  flexDirection: "column",
  border: `1px solid ${theme.colors.slate[200]}`,
  overflow: "hidden",
};

const header = {
  padding: "20px 24px",
  borderBottom: `1px solid ${theme.colors.slate[200]}`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: theme.colors.slate[50],
};

const headerLeft = { display: "flex", alignItems: "center", gap: "16px" };
const headerIcon = {
  width: "40px",
  height: "40px",
  borderRadius: theme.radius.md,
  background: theme.colors.indigo[100],
  color: theme.colors.indigo[600],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const headerTitle = { margin: 0, fontSize: "16px", fontWeight: 700, color: theme.colors.slate[900] };
const headerSubtitle = { margin: "4px 0 0 0", fontSize: "13px", color: theme.colors.slate[500] };

const btnClose = {
  background: "transparent",
  border: "none",
  padding: "8px",
  borderRadius: theme.radius.md,
  cursor: "pointer",
  color: theme.colors.slate[500],
};

const content = {
  flex: 1,
  overflow: "auto",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const section = {
  border: `1px solid ${theme.colors.slate[200]}`,
  borderRadius: theme.radius.lg,
  padding: "20px",
  background: "#fff",
};

const sectionTitle = {
  fontSize: "13px",
  fontWeight: 700,
  color: theme.colors.slate[800],
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "16px",
  display: "flex",
  alignItems: "center",
};

const sectionSubtitle = {
  textTransform: "none",
  fontWeight: 400,
  color: theme.colors.slate[500],
  marginLeft: "8px",
};

const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" };
const grid3 = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" };
const gridModos = { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" };

const input = {
  width: "100%",
  height: "40px",
  padding: "0 12px",
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.colors.slate[300]}`,
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: theme.colors.slate[700],
  marginBottom: "6px",
};

const flexRow = { display: "flex", alignItems: "center" };

const fieldHint = {
  fontSize: "11px",
  color: theme.colors.slate[500],
  marginTop: "4px",
  display: "block",
};

const infoBox = {
  gridColumn: "1 / -1",
  padding: "12px",
  background: "#fff",
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.colors.indigo[200]}`,
  display: "flex",
  gap: "12px",
  alignItems: "center",
  fontSize: "13px",
  color: theme.colors.slate[600],
};

const calcBox = {
  gridColumn: "1 / -1",
  padding: "16px",
  background: theme.colors.indigo[100],
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.colors.indigo[200]}`,
  color: theme.colors.indigo[900],
};

const carenciaBox = {
  border: `1px solid ${theme.colors.slate[200]}`,
  borderRadius: theme.radius.md,
  padding: "16px",
  background: "#fff",
};

const carenciaHeader = { fontSize: "13px", fontWeight: 600, color: theme.colors.slate[800], marginBottom: "12px" };
const carenciaRow = { display: "flex", alignItems: "center", gap: "12px" };

const checkboxLabel = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "13px",
  color: theme.colors.slate[700],
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const footer = {
  padding: "20px 24px",
  borderTop: `1px solid ${theme.colors.slate[200]}`,
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  background: "#fff",
};

const btnSecondary = {
  padding: "10px 20px",
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.colors.slate[300]}`,
  background: "#fff",
  color: theme.colors.slate[700],
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

const btnPrimary = {
  padding: "10px 20px",
  borderRadius: theme.radius.md,
  border: "none",
  background: theme.colors.indigo[600],
  color: "#fff",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};
