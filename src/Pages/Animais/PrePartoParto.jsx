import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import {
  X,
  Package,
  Pill,
  FlaskConical,
  AlertCircle,
  Info,
  Layers,
  Beaker,
  Box,
} from "lucide-react";

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
    indigo: {
      50: "#eef2ff",
      100: "#e0e7ff",
      500: "#6366f1",
      600: "#4f46e5",
      700: "#4338ca",
      900: "#1e1b4b",
    },
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
    background: state.isSelected
      ? theme.colors.indigo[50]
      : state.isFocused
      ? theme.colors.slate[50]
      : "transparent",
    color: state.isSelected ? theme.colors.indigo[700] : theme.colors.slate[700],
    fontWeight: state.isSelected ? 600 : 400,
    cursor: "pointer",
  }),
};

export default function ModalNovoProduto({ open, onClose, onSaved, initial = null }) {
  const isEdit = !!initial?.id;

  const [form, setForm] = useState(() => toForm(initial));
  const [modoControle, setModoControle] = useState(null); // 'solido_fracionado' | 'liquido_volume' | 'unidade_integral' | 'peso'

  useEffect(() => {
    if (open) {
      const inicial = toForm(initial);
      setForm(inicial);

      // Detecta modo de controle baseado nos dados iniciais
      if (inicial.modoControle) setModoControle(inicial.modoControle);
      else if (inicial.tipoFarmacia === "Hormônio" && Number(inicial.usosPorUnidade) > 1)
        setModoControle("solido_fracionado");
      else if ((inicial.unidadeVolume || inicial.unidade) === "ml" && inicial.volumeTotal)
        setModoControle("liquido_volume");
      else setModoControle(null);
    }
  }, [initial, open]);

  // Categorias e tipos
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

  const tiposFarmacia = useMemo(
    () => [
      { value: "Antibiótico", label: "Antibiótico", modoControle: "unidade_integral" },
      { value: "Hormônio-Injetavel", label: "Hormônio Injetável (líquido)", modoControle: "liquido_volume" },
      { value: "Hormônio-Implante", label: "Hormônio Implante (sólido)", modoControle: "solido_fracionado" },
      { value: "Anti-inflamatório", label: "Anti-inflamatório", modoControle: "liquido_volume" },
      { value: "Vacina", label: "Vacina", modoControle: "unidade_integral" },
      { value: "Antiparasitário", label: "Antiparasitário", modoControle: "liquido_volume" },
    ],
    []
  );

  const tiposReproducao = useMemo(
    () => [
      { value: "Semen", label: "Sêmen (Palheta)", modoControle: "unidade_integral" },
      { value: "Embriao", label: "Embrião", modoControle: "unidade_integral" },
      { value: "Material", label: "Material de coleta/IA", modoControle: "unidade_integral" },
    ],
    []
  );

  const modosControleDefinicoes = useMemo(
    () => ({
      solido_fracionado: {
        titulo: "Sólido Fracionado",
        desc: "Para implantes, comprimidos ou dispositivos divididos em usos parciais",
        exemplo: "Ex: Implante de progesterona (1 unidade = 3 usos)",
        icon: Layers,
        unidades: ["un", "comprimido", "implante"],
        campos: ["pesoDose", "usosPorUnidade"],
      },
      liquido_volume: {
        titulo: "Líquido por Volume",
        desc: "Para soluções injetáveis onde se administra X mL por uso",
        exemplo: "Ex: BE 50mL (2mL por animal = 25 usos)",
        icon: Beaker,
        unidades: ["ml", "litro"],
        campos: ["volumeTotal", "dosagemMl", "concentracao"],
      },
      unidade_integral: {
        titulo: "Unidade Integral",
        desc: "Cada aplicação consome 1 unidade completa do estoque",
        exemplo: "Ex: Sêmen, vacinas dose única, antibióticos dose única",
        icon: Box,
        unidades: ["un", "dose", "frasco", "ampola"],
        campos: [],
      },
      peso: {
        titulo: "Controle por Peso",
        desc: "Para produtos em pó/premix medidos em g/kg",
        exemplo: "Ex: Mineral 1kg (50g por animal)",
        icon: Package,
        unidades: ["g", "kg", "mg"],
        campos: ["pesoTotal", "dosagemPeso"],
      },
    }),
    []
  );

  const isFarmacia = form.categoria === "Farmácia";
  const isReproducao = form.categoria === "Reprodução";
  const isAntibiotico = form.tipoFarmacia === "Antibiótico";

  // Atualiza modo de controle quando muda tipo farmácia/reprodução
  useEffect(() => {
    if (!open) return;

    if (isFarmacia && form.tipoFarmacia) {
      const tipo = tiposFarmacia.find((t) => t.value === form.tipoFarmacia);
      if (tipo?.modoControle && !isEdit) {
        const novoModo = tipo.modoControle;
        setModoControle(novoModo);
        setForm((f) => ({
          ...f,
          modoControle: novoModo,
          usosPorUnidade: novoModo === "solido_fracionado" ? "3" : f.usosPorUnidade || "1",
          unidade: modosControleDefinicoes[novoModo]?.unidades?.[0] || f.unidade || "un",
          // limpa campos que podem ficar "pendurados" ao trocar modo
          volumeTotal: novoModo === "liquido_volume" ? f.volumeTotal : "",
          dosagemMl: novoModo === "liquido_volume" ? f.dosagemMl : "",
          pesoDose: novoModo === "solido_fracionado" ? f.pesoDose : "",
          pesoTotal: novoModo === "peso" ? f.pesoTotal : "",
          dosagemPeso: novoModo === "peso" ? f.dosagemPeso : "",
        }));
      }
    } else if (isReproducao && form.tipoReproducao) {
      const tipo = tiposReproducao.find((t) => t.value === form.tipoReproducao);
      if (tipo?.modoControle && !isEdit) {
        setModoControle(tipo.modoControle);
        setForm((f) => ({
          ...f,
          modoControle: tipo.modoControle,
          unidade: "dose",
        }));
      }
    }
  }, [
    open,
    isFarmacia,
    isReproducao,
    form.tipoFarmacia,
    form.tipoReproducao,
    form.categoria,
    tiposFarmacia,
    tiposReproducao,
    modosControleDefinicoes,
    isEdit,
  ]);

  if (!open) return null;

  const validar = () => {
    if (!form.nomeComercial || !form.categoria) {
      alert("Preencha nome e categoria.");
      return null;
    }
    if (!modoControle) {
      alert("Selecione o modo de controle.");
      return null;
    }

    // Validações específicas por modo de controle
    if (modoControle === "solido_fracionado") {
      const usos = Number(form.usosPorUnidade);
      if (!usos || usos < 2) {
        alert("Para sólidos fracionados, informe quantos usos por unidade (mínimo 2).");
        return null;
      }
      if (!form.pesoDose) {
        alert("Informe o peso/dosagem do implante (ex: 1.8g).");
        return null;
      }
    }

    if (modoControle === "liquido_volume") {
      if (!form.volumeTotal) {
        alert("Informe o volume total do frasco (ex: 50ml).");
        return null;
      }
      if (!form.dosagemMl) {
        alert("Informe a dosagem por uso em mL (ex: 2ml).");
        return null;
      }
    }

    if (!isEdit) {
      if (!form.qtdEntrada) {
        alert("Informe a quantidade da entrada inicial.");
        return null;
      }
      if (form.valorTotalEntrada === "") {
        alert("Informe o valor total da entrada (pode ser 0 se necessário).");
        return null;
      }
    }

    return normalizePayload({ ...form, modoControle }, isEdit);
  };

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
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: active ? theme.colors.indigo[900] : theme.colors.slate[800],
            }}
          >
            {definicao.titulo}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: theme.colors.slate[500],
              marginTop: "4px",
              lineHeight: 1.4,
            }}
          >
            {definicao.desc}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: active ? theme.colors.indigo[600] : theme.colors.slate[400],
              marginTop: "8px",
              fontStyle: "italic",
            }}
          >
            {definicao.exemplo}
          </div>
        </div>
      </button>
    );
  };

  const podeSalvar = isEdit ? !!modoControle : !!modoControle && !!form.qtdEntrada;

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
          <button type="button" onClick={onClose} style={btnClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <div style={content}>
          {/* ETAPA 1: IDENTIFICAÇÃO BÁSICA */}
          <section style={section}>
            <div style={sectionTitle}>Identificação</div>

            <div style={grid2}>
              <Field label="Nome Comercial *">
                <input
                  style={input}
                  value={form.nomeComercial}
                  onChange={(e) => setForm((f) => ({ ...f, nomeComercial: e.target.value }))}
                  placeholder="Ex: Progesterona 1.8g, Benzoato de Estradiol..."
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
                      modoControle: "",
                      unidade: "",
                    }));
                    setModoControle(null);
                  }}
                  styles={rsStyles}
                  placeholder="Selecione..."
                  menuPortalTarget={typeof document !== "undefined" ? document.body : null}
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
                    onChange={(opt) => setForm((f) => ({ ...f, tipoFarmacia: opt?.value || "" }))}
                    styles={rsStyles}
                    placeholder="Selecione o tipo..."
                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                  />
                </Field>
              </div>
            )}

            {isReproducao && (
              <div style={{ marginTop: "16px" }}>
                <Field label="Tipo de Material *">
                  <Select
                    options={tiposReproducao}
                    value={tiposReproducao.find((t) => t.value === form.tipoReproducao) || null}
                    onChange={(opt) => setForm((f) => ({ ...f, tipoReproducao: opt?.value || "" }))}
                    styles={rsStyles}
                    placeholder="Selecione..."
                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                  />
                </Field>
              </div>
            )}
          </section>

          {/* ETAPA 2: SELEÇÃO DO MODO DE CONTROLE */}
          {form.categoria && (
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
                      setModoControle(modo);
                      setForm((f) => ({
                        ...f,
                        modoControle: modo,
                        unidade: modosControleDefinicoes[modo].unidades[0],
                      }));
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ETAPA 3: CONFIGURAÇÃO ESPECÍFICA DO MODO */}
          {modoControle && (
            <section
              style={{
                ...section,
                background: theme.colors.indigo[50],
                borderColor: theme.colors.indigo[200],
              }}
            >
              <div style={{ ...sectionTitle, color: theme.colors.indigo[900] }}>
                {React.createElement(modosControleDefinicoes[modoControle].icon, {
                  size: 16,
                  style: { marginRight: 8 },
                })}
                Configuração: {modosControleDefinicoes[modoControle].titulo}
              </div>

              {/* SÓLIDO FRACIONADO */}
              {modoControle === "solido_fracionado" && (
                <div style={grid2}>
                  <Field label="Peso/Dosagem do Implante *">
                    <div style={flexRow}>
                      <input
                        style={{ ...input, flex: 1 }}
                        type="number"
                        step="0.1"
                        value={form.pesoDose || ""}
                        onChange={(e) => setForm((f) => ({ ...f, pesoDose: e.target.value }))}
                        placeholder="Ex: 1.8"
                      />
                      <select
                        style={{ ...input, width: 110, marginLeft: 8 }}
                        value={form.unidadePeso || "g"}
                        onChange={(e) => setForm((f) => ({ ...f, unidadePeso: e.target.value }))}
                      >
                        <option value="g">gramas</option>
                        <option value="mg">miligramas</option>
                      </select>
                    </div>
                    <span style={fieldHint}>Ex: Implante de progesterona com 1.8g</span>
                  </Field>

                  <Field label="Quantos usos por implante? *">
                    <input
                      style={input}
                      type="number"
                      min="2"
                      max="10"
                      value={form.usosPorUnidade || ""}
                      onChange={(e) => setForm((f) => ({ ...f, usosPorUnidade: e.target.value }))}
                      placeholder="Ex: 3"
                    />
                    <span style={fieldHint}>Quantos animais atende 1 implante físico?</span>
                  </Field>

                  <Field label="Apresentação Comercial">
                    <input
                      style={input}
                      value={form.apresentacao || ""}
                      onChange={(e) => setForm((f) => ({ ...f, apresentacao: e.target.value }))}
                      placeholder="Ex: Caixa com 10 implantes"
                    />
                  </Field>

                  <div style={infoBox}>
                    <Info size={16} />
                    <div>
                      <strong>Como funciona:</strong> Se comprar 10 implantes com 3 usos cada, você terá 30 aplicações.
                      Cada uso desconta <strong>1/3</strong> do implante no controle interno.
                    </div>
                  </div>
                </div>
              )}

              {/* LÍQUIDO POR VOLUME */}
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
                        style={{ ...input, width: 110, marginLeft: 8 }}
                        value={form.unidadeVolume || "ml"}
                        onChange={(e) => setForm((f) => ({ ...f, unidadeVolume: e.target.value }))}
                      >
                        <option value="ml">mL</option>
                        <option value="litro">Litros</option>
                      </select>
                    </div>
                  </Field>

                  <Field label="Dosagem por Uso *">
                    <div style={flexRow}>
                      <input
                        style={{ ...input, flex: 1 }}
                        type="number"
                        step="0.1"
                        value={form.dosagemMl || ""}
                        onChange={(e) => setForm((f) => ({ ...f, dosagemMl: e.target.value }))}
                        placeholder="Ex: 2.0"
                      />
                      {/* ✅ aqui tinha erro de sintaxe: theme.colors.slate[500} */}
                      <span style={{ marginLeft: 8, color: theme.colors.slate[500], fontSize: 13 }}>
                        {form.unidadeVolume || "ml"} por animal
                      </span>
                    </div>
                    <span style={fieldHint}>Quanto se aplica em cada animal?</span>
                  </Field>

                  <Field label="Concentração (se aplicável)">
                    <input
                      style={input}
                      value={form.concentracao || ""}
                      onChange={(e) => setForm((f) => ({ ...f, concentracao: e.target.value }))}
                      placeholder="Ex: 50µg/mL, 100µg..."
                    />
                  </Field>

                  <div style={calcBox}>
                    <div style={{ fontWeight: 600, marginBottom: "8px" }}>Cálculo automático:</div>
                    {form.volumeTotal && form.dosagemMl ? (
                      <div style={{ fontSize: "14px", color: theme.colors.slate[700] }}>
                        1 frasco de <strong>{form.volumeTotal}{form.unidadeVolume || "ml"}</strong> ={" "}
                        <strong>{Math.floor(Number(form.volumeTotal) / Number(form.dosagemMl))} usos</strong>{" "}
                        ({form.dosagemMl}{form.unidadeVolume || "ml"} cada)
                      </div>
                    ) : (
                      <div style={{ fontSize: "13px", color: theme.colors.slate[500] }}>
                        Preencha volume e dosagem para ver o cálculo
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* UNIDADE INTEGRAL */}
              {modoControle === "unidade_integral" && (
                <div style={grid2}>
                  <Field label="Unidade de Controle">
                    <Select
                      options={[
                        { value: "un", label: "Unidade" },
                        { value: "dose", label: "Dose" },
                        { value: "frasco", label: "Frasco" },
                        { value: "ampola", label: "Ampola" },
                      ]}
                      value={
                        form.unidade
                          ? { value: form.unidade, label: form.unidade }
                          : { value: "un", label: "Unidade" }
                      }
                      onChange={(opt) => setForm((f) => ({ ...f, unidade: opt?.value || "un" }))}
                      styles={rsStyles}
                      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                    />
                  </Field>

                  <div style={infoBox}>
                    <Info size={16} />
                    <div>
                      <strong>Modo Unidade Integral:</strong> Cada aplicação descontará 1 unidade completa do estoque.
                      Ideal para sêmen, vacinas, antibióticos dose única.
                    </div>
                  </div>
                </div>
              )}

              {/* PESO */}
              {modoControle === "peso" && (
                <div style={grid2}>
                  <Field label="Peso Total Disponível *">
                    <div style={flexRow}>
                      <input
                        style={{ ...input, flex: 1 }}
                        type="number"
                        value={form.pesoTotal || ""}
                        onChange={(e) => setForm((f) => ({ ...f, pesoTotal: e.target.value }))}
                      />
                      <select
                        style={{ ...input, width: 110, marginLeft: 8 }}
                        value={form.unidadePeso || "g"}
                        onChange={(e) => setForm((f) => ({ ...f, unidadePeso: e.target.value }))}
                      >
                        <option value="g">gramas</option>
                        <option value="kg">kg</option>
                        <option value="mg">mg</option>
                      </select>
                    </div>
                  </Field>

                  <Field label="Dosagem por Uso *">
                    <div style={flexRow}>
                      <input
                        style={{ ...input, flex: 1 }}
                        type="number"
                        value={form.dosagemPeso || ""}
                        onChange={(e) => setForm((f) => ({ ...f, dosagemPeso: e.target.value }))}
                      />
                      <span style={{ marginLeft: 8, color: theme.colors.slate[500], fontSize: 13 }}>
                        {form.unidadePeso || "g"}
                      </span>
                    </div>
                  </Field>
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
            <section
              style={{
                ...section,
                background: theme.colors.warning + "08",
                borderColor: theme.colors.warning + "30",
              }}
            >
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
                  setSem={(v) =>
                    setForm((f) => ({
                      ...f,
                      semCarenciaLeite: v,
                      carenciaLeiteDias: v ? "" : f.carenciaLeiteDias,
                    }))
                  }
                />
                <CarenciaInput
                  titulo="Carência Carne"
                  dias={form.carenciaCarneDias}
                  setDias={(v) => setForm((f) => ({ ...f, carenciaCarneDias: v }))}
                  sem={form.semCarenciaCarne}
                  setSem={(v) =>
                    setForm((f) => ({
                      ...f,
                      semCarenciaCarne: v,
                      carenciaCarneDias: v ? "" : f.carenciaCarneDias,
                    }))
                  }
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
            style={{ ...btnPrimary, opacity: podeSalvar ? 1 : 0.5 }}
            onClick={() => {
              const payload = validar();
              if (payload) onSaved?.(payload);
            }}
            disabled={!podeSalvar}
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
    modoControle: d.modoControle ?? "",

    // Sólido fracionado
    pesoDose: d.pesoDose ?? "",
    unidadePeso: d.unidadePeso ?? "g",
    usosPorUnidade: d.usosPorUnidade ?? "1",

    // Líquido
    volumeTotal: d.volumeTotal ?? "",
    unidadeVolume: d.unidadeVolume ?? "ml",
    dosagemMl: d.dosagemMl ?? "",
    concentracao: d.concentracao ?? "",

    // Peso
    pesoTotal: d.pesoTotal ?? "",
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
  const calcularUsosTotais = () => {
    const qtd = Number(f.qtdEntrada) || 0;

    switch (f.modoControle) {
      case "solido_fracionado":
        return qtd * (parseInt(f.usosPorUnidade, 10) || 1);

      case "liquido_volume": {
        const vol = Number(f.volumeTotal) || 0;
        const dose = Number(f.dosagemMl) || 1;
        return Math.floor((qtd * vol) / dose);
      }

      case "peso": {
        const peso = Number(f.pesoTotal) || 0;
        const dosagem = Number(f.dosagemPeso) || 1;
        return Math.floor((qtd * peso) / dosagem);
      }

      default:
        return qtd;
    }
  };

  const produto = {
    nomeComercial: (f.nomeComercial || "").trim(),
    categoria: f.categoria,
    tipoFarmacia: f.tipoFarmacia || null,
    tipoReproducao: f.tipoReproducao || null,
    modoControle: f.modoControle,
    unidade: f.unidade || "un",

    ...(f.modoControle === "solido_fracionado" && {
      pesoDose: Number(f.pesoDose) || null,
      unidadePeso: f.unidadePeso,
      usosPorUnidade: parseInt(f.usosPorUnidade, 10) || 1,
    }),

    ...(f.modoControle === "liquido_volume" && {
      volumeTotal: Number(f.volumeTotal) || null,
      unidadeVolume: f.unidadeVolume,
      dosagemMl: Number(f.dosagemMl) || null,
      concentracao: f.concentracao || null,
    }),

    ...(f.modoControle === "peso" && {
      pesoTotal: Number(f.pesoTotal) || null,
      unidadePeso: f.unidadePeso,
      dosagemPeso: Number(f.dosagemPeso) || null,
    }),

    carenciaLeiteDias: f.semCarenciaLeite ? 0 : Number(f.carenciaLeiteDias) || null,
    carenciaCarneDias: f.semCarenciaCarne ? 0 : Number(f.carenciaCarneDias) || null,
  };

  const lote =
    !isEdit && f.qtdEntrada
      ? {
          quantidade: Number(f.qtdEntrada),
          valorTotal: Number(f.valorTotalEntrada) || 0,
          validade: f.validadeEntrada || null,
          quantidadeUsos: calcularUsosTotais(),
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

const content = { flex: 1, overflow: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" };

const section = { border: `1px solid ${theme.colors.slate[200]}`, borderRadius: theme.radius.lg, padding: "20px", background: "#fff" };

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

const sectionSubtitle = { textTransform: "none", fontWeight: 400, color: theme.colors.slate[500], marginLeft: "8px" };

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

const labelStyle = { display: "block", fontSize: "12px", fontWeight: 600, color: theme.colors.slate[700], marginBottom: "6px" };
const flexRow = { display: "flex", alignItems: "center" };
const fieldHint = { fontSize: "11px", color: theme.colors.slate[500], marginTop: "4px", display: "block" };

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

const carenciaBox = { border: `1px solid ${theme.colors.slate[200]}`, borderRadius: theme.radius.md, padding: "16px", background: "#fff" };
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
