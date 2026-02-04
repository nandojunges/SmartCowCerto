import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { X, Package, Pill, FlaskConical, Info, Box, Calendar, DollarSign, AlertCircle } from "lucide-react";

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
    },
    success: "#059669",
    warning: "#d97706",
    danger: "#dc2626",
  },
  radius: { sm: "4px", md: "6px", lg: "10px" },
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

  /* ===================== LOOKUPS ===================== */
  const categorias = useMemo(
    () => [
      { value: "Farmácia", label: "Farmácia", icon: Pill },
      { value: "Reprodução", label: "Reprodução", icon: FlaskConical },
      { value: "Ração/Concentrado", label: "Rações e Concentrados", icon: Package },
      { value: "Mineral/Aditivo", label: "Minerais e Aditivos", icon: Package },
      { value: "Higiene", label: "Higiene e Limpeza", icon: Package },
      { value: "Materiais", label: "Materiais Gerais", icon: Box },
      { value: "Cozinha", label: "Cozinha", icon: Package },
    ],
    []
  );

  const subtiposFarmacia = useMemo(
    () => [
      { value: "Antibiótico", label: "Antibiótico" },
      { value: "Anti-inflamatório", label: "Anti-inflamatório" },
      { value: "Vacina", label: "Vacina" },
      { value: "Antiparasitário", label: "Antiparasitário" },
      { value: "Hormônio", label: "Hormônio" },
      { value: "Outros", label: "Outros" },
    ],
    []
  );

  const subtiposRepro = useMemo(
    () => [
      { value: "Sêmen", label: "Sêmen (Palheta)" },
      { value: "Embrião", label: "Embrião" },
      { value: "Material", label: "Material de IA/Coleta" },
    ],
    []
  );

  const formasCompra = useMemo(
    () => [
      { value: "EMBALADO", label: "Embalado (frasco/saco/caixa/galão...)" },
      { value: "A_GRANEL", label: "A granel (peso/volume total)" },
    ],
    []
  );

  const unidadesMedida = useMemo(
    () => [
      { value: "un", label: "Unidade (un)" },
      { value: "dose", label: "Dose" },
      { value: "ml", label: "mL" },
      { value: "L", label: "Litro (L)" },
      { value: "g", label: "g" },
      { value: "kg", label: "kg" },
    ],
    []
  );

  const tiposEmbalagem = useMemo(
    () => [
      { value: "frasco", label: "Frasco" },
      { value: "ampola", label: "Ampola" },
      { value: "caixa", label: "Caixa" },
      { value: "saco", label: "Saco" },
      { value: "balde", label: "Balde" },
      { value: "galao", label: "Galão" },
      { value: "tonel", label: "Tonel" },
      { value: "unidade", label: "Unidade" },
      { value: "palheta", label: "Palheta" },
    ],
    []
  );

  /* ===================== OPEN / INIT ===================== */
  useEffect(() => {
    if (!open) return;
    setForm(toForm(initial));
  }, [initial, open]);

  const menuPortalTarget = typeof document !== "undefined" ? document.body : null;

  const isFarmacia = form.categoria === "Farmácia";
  const isReproducao = form.categoria === "Reprodução";
  const isAntibiotico = isFarmacia && form.subTipo === "Antibiótico";

  // Sugestões inteligentes (não trava nada)
  useEffect(() => {
    if (!open) return;

    if (!isEdit && isReproducao) {
      setForm((f) => ({
        ...f,
        subTipo: f.subTipo || "Sêmen",
        formaCompra: f.formaCompra || "EMBALADO",
        unidadeMedida: f.unidadeMedida || "dose",
        tipoEmbalagem: f.tipoEmbalagem || "palheta",
        tamanhoPorEmbalagem: f.tamanhoPorEmbalagem || "1",
      }));
    }

    if (!isEdit && isFarmacia && form.subTipo === "Hormônio") {
      setForm((f) => ({
        ...f,
        formaCompra: f.formaCompra || "EMBALADO",
        tipoEmbalagem: f.tipoEmbalagem || "frasco",
        unidadeMedida: f.unidadeMedida || "ml",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form.categoria, form.subTipo]);

  /* ===================== CALC ===================== */
  const totalCalculado = useMemo(() => {
    if (form.reutilizavel) {
      const qtdEmb = toNum(form.qtdEmbalagens);
      const usos = toNum(form.usosPorUnidade);
      return Math.max(0, qtdEmb * usos);
    }

    if (form.formaCompra === "A_GRANEL") {
      return Math.max(0, toNum(form.quantidadeTotal));
    }

    const qtd = toNum(form.qtdEmbalagens);
    const tam = toNum(form.tamanhoPorEmbalagem);
    return Math.max(0, qtd * tam);
  }, [
    form.formaCompra,
    form.qtdEmbalagens,
    form.tamanhoPorEmbalagem,
    form.quantidadeTotal,
    form.reutilizavel,
    form.usosPorUnidade,
  ]);

  const unidadeFinal = form.reutilizavel ? "uso" : form.unidadeMedida || "";

  /* ===================== VALIDAR ===================== */
  const validar = () => {
    if (!form.nomeComercial?.trim()) {
      alert("Informe o nome comercial.");
      return null;
    }
    if (!form.categoria) {
      alert("Selecione a categoria.");
      return null;
    }

    if (isFarmacia && !form.subTipo) {
      alert("Selecione o tipo (Farmácia).");
      return null;
    }
    if (isReproducao && !form.subTipo) {
      alert("Selecione o tipo (Reprodução).");
      return null;
    }

    if (!form.formaCompra) {
      alert("Selecione como este produto é comprado.");
      return null;
    }

    if (form.formaCompra === "EMBALADO") {
      if (!form.tipoEmbalagem) {
        alert("Selecione o tipo de embalagem (frasco/saco/caixa...).");
        return null;
      }
      if (!form.qtdEmbalagens || toNum(form.qtdEmbalagens) <= 0) {
        alert("Informe quantas embalagens foram compradas.");
        return null;
      }

      if (form.reutilizavel) {
        if (!form.usosPorUnidade || toNum(form.usosPorUnidade) < 2) {
          alert("Produto reutilizável: informe usos por unidade (mínimo 2).");
          return null;
        }
      } else {
        if (!form.unidadeMedida) {
          alert("Selecione a unidade de medida (mL/L/kg/un...).");
          return null;
        }
        if (!form.tamanhoPorEmbalagem || toNum(form.tamanhoPorEmbalagem) <= 0) {
          alert("Informe o tamanho por embalagem (ex: 50 mL, 25 kg).");
          return null;
        }
      }
    }

    if (form.formaCompra === "A_GRANEL") {
      if (!form.unidadeMedida) {
        alert("Selecione a unidade de medida (mL/L/kg/g...).");
        return null;
      }
      if (!form.quantidadeTotal || toNum(form.quantidadeTotal) <= 0) {
        alert("Informe a quantidade total comprada (a granel).");
        return null;
      }
    }

    if (isAntibiotico) {
      const leiteOk = form.semCarenciaLeite || toNum(form.carenciaLeiteDias) > 0;
      const carneOk = form.semCarenciaCarne || toNum(form.carenciaCarneDias) > 0;

      if (!leiteOk) {
        alert("Antibiótico: informe carência de leite (dias) ou marque 'Sem carência'.");
        return null;
      }
      if (!carneOk) {
        alert("Antibiótico: informe carência de carne (dias) ou marque 'Sem carência'.");
        return null;
      }
    }

    return normalizeProdutoPayload(form, isEdit);
  };

  if (!open) return null;

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
              <p style={headerSubtitle}>Cadastre o produto e como ele é controlado (catálogo)</p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={btnClose}>
            <X size={20} />
          </button>
        </div>

        <div style={content}>
          {/* 1) IDENTIFICAÇÃO */}
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
                      subTipo: "",
                      formaCompra: "",
                      tipoEmbalagem: "",
                      qtdEmbalagens: "",
                      tamanhoPorEmbalagem: "",
                      unidadeMedida: "",
                      quantidadeTotal: "",
                      reutilizavel: false,
                      usosPorUnidade: "3",
                      carenciaLeiteDias: "",
                      carenciaCarneDias: "",
                      semCarenciaLeite: false,
                      semCarenciaCarne: false,

                      // não persiste no catálogo
                      valorTotalEntrada: "",
                      validadeEntrada: "",
                      dataCompra: "",
                    }));
                  }}
                  styles={rsStyles}
                  placeholder="Selecione..."
                  menuPortalTarget={menuPortalTarget}
                />
              </Field>
            </div>

            {(isFarmacia || isReproducao) && (
              <div style={{ marginTop: 14 }}>
                <Field label={isFarmacia ? "Tipo (Farmácia) *" : "Tipo (Reprodução) *"}>
                  <Select
                    options={isFarmacia ? subtiposFarmacia : subtiposRepro}
                    value={(isFarmacia ? subtiposFarmacia : subtiposRepro).find((t) => t.value === form.subTipo) || null}
                    onChange={(opt) => {
                      const v = opt?.value || "";
                      setForm((f) => ({
                        ...f,
                        subTipo: v,
                        ...(v !== "Antibiótico"
                          ? {
                              carenciaLeiteDias: "",
                              carenciaCarneDias: "",
                              semCarenciaLeite: false,
                              semCarenciaCarne: false,
                            }
                          : {}),
                      }));
                    }}
                    styles={rsStyles}
                    placeholder="Selecione..."
                    menuPortalTarget={menuPortalTarget}
                  />
                </Field>
              </div>
            )}
          </section>

          {/* 2) COMO FOI COMPRADO */}
          <section style={section}>
            <div style={sectionTitle}>Compra e Embalagem</div>

            <div style={grid2}>
              <Field label="Como você compra esse produto? *">
                <Select
                  options={formasCompra}
                  value={formasCompra.find((x) => x.value === form.formaCompra) || null}
                  onChange={(opt) => {
                    const v = opt?.value || "";
                    setForm((f) => ({
                      ...f,
                      formaCompra: v,
                      tipoEmbalagem: "",
                      qtdEmbalagens: "",
                      tamanhoPorEmbalagem: "",
                      quantidadeTotal: "",
                      reutilizavel: v === "A_GRANEL" ? false : f.reutilizavel,
                    }));
                  }}
                  styles={rsStyles}
                  placeholder="Selecione..."
                  menuPortalTarget={menuPortalTarget}
                />
              </Field>

              <Field label="Unidade de medida (estoque) *">
                <Select
                  options={unidadesMedida}
                  value={unidadesMedida.find((u) => u.value === form.unidadeMedida) || null}
                  onChange={(opt) => setForm((f) => ({ ...f, unidadeMedida: opt?.value || "" }))}
                  styles={rsStyles}
                  placeholder="mL / L / kg / un..."
                  menuPortalTarget={menuPortalTarget}
                  isDisabled={form.reutilizavel}
                />
                {form.reutilizavel && <span style={fieldHint}>Reutilizável: o estoque passa a ser controlado por “uso”.</span>}
              </Field>
            </div>

            {form.formaCompra === "EMBALADO" && (
              <div style={{ marginTop: 14 }}>
                <div style={grid3}>
                  <Field label="Tipo de embalagem *">
                    <Select
                      options={tiposEmbalagem}
                      value={tiposEmbalagem.find((t) => t.value === form.tipoEmbalagem) || null}
                      onChange={(opt) => setForm((f) => ({ ...f, tipoEmbalagem: opt?.value || "" }))}
                      styles={rsStyles}
                      placeholder="Frasco / Saco / Caixa..."
                      menuPortalTarget={menuPortalTarget}
                    />
                  </Field>

                  <Field label="Quantas embalagens? *">
                    <input
                      style={input}
                      type="number"
                      value={form.qtdEmbalagens}
                      onChange={(e) => setForm((f) => ({ ...f, qtdEmbalagens: e.target.value }))}
                      placeholder="Ex: 5"
                    />
                  </Field>

                  {!form.reutilizavel ? (
                    <Field label="Tamanho por embalagem *">
                      <div style={flexRow}>
                        <input
                          style={{ ...input, flex: 1 }}
                          type="number"
                          value={form.tamanhoPorEmbalagem}
                          onChange={(e) => setForm((f) => ({ ...f, tamanhoPorEmbalagem: e.target.value }))}
                          placeholder="Ex: 50"
                        />
                        <div style={{ width: 110, marginLeft: 8 }}>
                          <Select
                            options={unidadesMedida.filter((u) => u.value !== "dose")}
                            value={unidadesMedida.find((u) => u.value === form.unidadeMedida) || null}
                            onChange={(opt) => setForm((f) => ({ ...f, unidadeMedida: opt?.value || "" }))}
                            styles={rsStyles}
                            placeholder="un"
                            menuPortalTarget={menuPortalTarget}
                            isDisabled={form.reutilizavel}
                          />
                        </div>
                      </div>
                      <span style={fieldHint}>Ex.: frasco 50 mL, saco 25 kg, caixa 12 un…</span>
                    </Field>
                  ) : (
                    <Field label="Usos por unidade *">
                      <input
                        style={input}
                        type="number"
                        min="2"
                        value={form.usosPorUnidade}
                        onChange={(e) => setForm((f) => ({ ...f, usosPorUnidade: e.target.value }))}
                        placeholder="Ex: 3"
                      />
                      <span style={fieldHint}>Ex.: 1 CIDR pode render 3 usos.</span>
                    </Field>
                  )}
                </div>

                <div style={{ marginTop: 12 }}>
                  <label style={checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={form.reutilizavel}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          reutilizavel: e.target.checked,
                          unidadeMedida: e.target.checked ? "" : f.unidadeMedida,
                        }))
                      }
                    />
                    <span>Produto reutilizável (dispositivo/implante)</span>
                  </label>
                </div>
              </div>
            )}

            {form.formaCompra === "A_GRANEL" && (
              <div style={{ marginTop: 14 }}>
                <div style={grid2}>
                  <Field label="Quantidade total comprada *">
                    <div style={flexRow}>
                      <input
                        style={{ ...input, flex: 1 }}
                        type="number"
                        value={form.quantidadeTotal}
                        onChange={(e) => setForm((f) => ({ ...f, quantidadeTotal: e.target.value }))}
                        placeholder="Ex: 120"
                      />
                      <div style={{ width: 160, marginLeft: 8 }}>
                        <Select
                          options={unidadesMedida.filter((u) => u.value !== "dose")}
                          value={unidadesMedida.find((u) => u.value === form.unidadeMedida) || null}
                          onChange={(opt) => setForm((f) => ({ ...f, unidadeMedida: opt?.value || "" }))}
                          styles={rsStyles}
                          placeholder="kg / L..."
                          menuPortalTarget={menuPortalTarget}
                        />
                      </div>
                    </div>
                    <span style={fieldHint}>Use “a granel” quando registra direto o total (sem frascos/sacos).</span>
                  </Field>

                  <div style={infoBox}>
                    <Info size={16} />
                    <div>Aqui você não precisa informar embalagem. Você registra o total comprado e pronto.</div>
                  </div>
                </div>
              </div>
            )}

            {!!form.formaCompra && (
              <div style={{ marginTop: 14 }}>
                <div style={calcBox}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Total calculado (referência do cadastro):</div>
                  <div style={{ fontSize: 14, color: theme.colors.indigo[900] }}>
                    <strong>{Number(totalCalculado || 0)}</strong> <strong>{unidadeFinal || ""}</strong>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* 3) VALOR + VALIDADE (opcional -> vira LOTE se preenchido) */}
          <section style={section}>
            <div style={sectionTitle}>Valor e Validade (opcional)</div>

            <div style={grid3}>
              <Field label="Valor Total (R$)">
                <div style={{ position: "relative" }}>
                  <DollarSign size={16} style={{ position: "absolute", left: 10, top: 12, color: theme.colors.slate[400] }} />
                  <input
                    style={{ ...input, paddingLeft: 34 }}
                    type="number"
                    step="0.01"
                    value={form.valorTotalEntrada}
                    onChange={(e) => setForm((f) => ({ ...f, valorTotalEntrada: e.target.value }))}
                    placeholder="Ex: 350.00"
                  />
                </div>
              </Field>

              <Field label="Data da Compra">
                <div style={{ position: "relative" }}>
                  <Calendar size={16} style={{ position: "absolute", left: 10, top: 12, color: theme.colors.slate[400] }} />
                  <input
                    style={{ ...input, paddingLeft: 34 }}
                    type="date"
                    value={form.dataCompra}
                    onChange={(e) => setForm((f) => ({ ...f, dataCompra: e.target.value }))}
                  />
                </div>
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

            <div style={{ marginTop: 10 }}>
              <div style={infoBox}>
                <Info size={16} />
                <div>
                  Se você preencher Valor/Data/Validade, isso vira uma <b>entrada de lote</b> no estoque. Se deixar em branco, cadastra só o catálogo.
                </div>
              </div>
            </div>
          </section>

          {/* 4) CARÊNCIAS (só se antibiótico) */}
          {isAntibiotico && (
            <section style={{ ...section, background: `${theme.colors.warning}08`, borderColor: `${theme.colors.warning}30` }}>
              <div style={{ ...sectionTitle, color: theme.colors.warning }}>
                <AlertCircle size={16} style={{ marginRight: 8 }} />
                Carências (Antibiótico)
              </div>

              <div style={grid2}>
                <CarenciaBox
                  titulo="Carência Leite"
                  dias={form.carenciaLeiteDias}
                  setDias={(v) => setForm((f) => ({ ...f, carenciaLeiteDias: v }))}
                  sem={form.semCarenciaLeite}
                  setSem={(v) => setForm((f) => ({ ...f, semCarenciaLeite: v, carenciaLeiteDias: v ? "" : f.carenciaLeiteDias }))}
                />
                <CarenciaBox
                  titulo="Carência Carne"
                  dias={form.carenciaCarneDias}
                  setDias={(v) => setForm((f) => ({ ...f, carenciaCarneDias: v }))}
                  sem={form.semCarenciaCarne}
                  setSem={(v) => setForm((f) => ({ ...f, semCarenciaCarne: v, carenciaCarneDias: v ? "" : f.carenciaCarneDias }))}
                />
              </div>

              <div style={{ marginTop: 10 }}>
                <div style={infoBox}>
                  <Info size={16} />
                  <div>Se não tiver carência, marque “Sem carência”. Caso tenha, informe os dias.</div>
                </div>
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
            style={btnPrimary}
            onClick={() => {
              const payload = validar();
              if (payload) onSaved?.(payload);
            }}
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

function CarenciaBox({ titulo, dias, setDias, sem, setSem }) {
  return (
    <div style={carenciaBox}>
      <div style={carenciaHeader}>{titulo}</div>
      <div style={carenciaRow}>
        <input
          style={{
            ...input,
            flex: 1,
            opacity: sem ? 0.55 : 1,
            background: sem ? "#fff" : theme.colors.slate[50],
          }}
          type="number"
          value={dias || ""}
          onChange={(e) => setDias(e.target.value)}
          disabled={sem}
          placeholder="Dias"
        />
        <label style={checkboxLabel}>
          <input type="checkbox" checked={!!sem} onChange={(e) => setSem(e.target.checked)} />
          <span>Sem carência</span>
        </label>
      </div>
    </div>
  );
}

/* ===================== HELPERS ===================== */
function pick(d, ...keys) {
  for (const k of keys) {
    if (d && d[k] !== undefined && d[k] !== null) return d[k];
  }
  return undefined;
}

function toNum(v) {
  if (v === null || v === undefined || v === "") return 0;
  const s = String(v).replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function toForm(initial) {
  const d = initial || {};
  return {
    // identificação
    nomeComercial: pick(d, "nomeComercial", "nome_comercial") ?? "",
    categoria: pick(d, "categoria") ?? "",
    subTipo: pick(d, "subTipo", "sub_tipo") ?? "",

    // compra
    formaCompra: pick(d, "formaCompra", "forma_compra") ?? "",
    tipoEmbalagem: pick(d, "tipoEmbalagem", "tipo_embalagem") ?? "",
    qtdEmbalagens: pick(d, "qtdEmbalagens") ?? "",
    tamanhoPorEmbalagem: pick(d, "tamanhoPorEmbalagem", "tamanho_por_embalagem") ?? "",
    unidadeMedida: pick(d, "unidadeMedida", "unidade_medida", "unidade") ?? "",

    // a granel (não persiste no catálogo)
    quantidadeTotal: pick(d, "quantidadeTotal") ?? "",

    // reutilização
    reutilizavel: !!pick(d, "reutilizavel"),
    usosPorUnidade: String(pick(d, "usosPorUnidade", "usos_por_unidade") ?? "3"),

    // valor/validade (vira lote se preenchido)
    valorTotalEntrada: "",
    validadeEntrada: "",
    dataCompra: "",

    // carências
    carenciaLeiteDias: pick(d, "carenciaLeiteDias", "carencia_leite") ?? "",
    carenciaCarneDias: pick(d, "carenciaCarneDias", "carencia_carne") ?? "",
    semCarenciaLeite: !!pick(d, "semCarenciaLeite", "sem_carencia_leite"),
    semCarenciaCarne: !!pick(d, "semCarenciaCarne", "sem_carencia_carne"),

    // ativo (edição)
    ativo: pick(d, "ativo"),
  };
}

/**
 * ✅ Retorna payload do catálogo em snake_case.
 */
function normalizeProdutoPayload(f, isEdit) {
  return {
    nome_comercial: String(f.nomeComercial || "").trim(),
    categoria: String(f.categoria || "").trim(),
    sub_tipo: f.subTipo || "",
    forma_compra: f.formaCompra || "",
    tipo_embalagem: f.formaCompra === "EMBALADO" ? f.tipoEmbalagem || "" : "",
    tamanho_por_embalagem:
      f.formaCompra === "EMBALADO" && !f.reutilizavel ? f.tamanhoPorEmbalagem || "" : "",
    unidade_medida: f.reutilizavel ? "" : f.unidadeMedida || "",
    reutilizavel: !!f.reutilizavel,
    usos_por_unidade: f.reutilizavel ? String(f.usosPorUnidade || "") : "",
    carencia_leite: f.carenciaLeiteDias || "",
    carencia_carne: f.carenciaCarneDias || "",
    sem_carencia_leite: !!f.semCarenciaLeite,
    sem_carencia_carne: !!f.semCarenciaCarne,
    ativo: isEdit && f.ativo === false ? false : true,
  };
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
  width: "min(980px, 96vw)",
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
  padding: "18px 22px",
  borderBottom: `1px solid ${theme.colors.slate[200]}`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: theme.colors.slate[50],
};

const headerLeft = { display: "flex", alignItems: "center", gap: "14px" };
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

const headerTitle = { margin: 0, fontSize: "16px", fontWeight: 800, color: theme.colors.slate[900] };
const headerSubtitle = { margin: "4px 0 0 0", fontSize: "13px", color: theme.colors.slate[500], lineHeight: 1.35 };

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
  padding: "22px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const section = {
  border: `1px solid ${theme.colors.slate[200]}`,
  borderRadius: theme.radius.lg,
  padding: "18px",
  background: "#fff",
};

const sectionTitle = {
  fontSize: "13px",
  fontWeight: 800,
  color: theme.colors.slate[800],
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "14px",
  display: "flex",
  alignItems: "center",
};

const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" };
const grid3 = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" };

const input = {
  width: "100%",
  height: "40px",
  padding: "0 12px",
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.colors.slate[300]}`,
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
  background: theme.colors.slate[50],
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 700,
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
  gap: "10px",
  alignItems: "center",
  fontSize: "13px",
  color: theme.colors.slate[600],
};

const calcBox = {
  padding: "14px",
  background: theme.colors.indigo[100],
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.colors.indigo[200]}`,
  color: theme.colors.indigo[900],
};

const carenciaBox = {
  border: `1px solid ${theme.colors.slate[200]}`,
  borderRadius: theme.radius.md,
  padding: "14px",
  background: "#fff",
};

const carenciaHeader = { fontSize: "13px", fontWeight: 800, color: theme.colors.slate[800], marginBottom: "10px" };
const carenciaRow = { display: "flex", alignItems: "center", gap: "12px" };

const checkboxLabel = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "13px",
  color: theme.colors.slate[700],
  cursor: "pointer",
  userSelect: "none",
  whiteSpace: "nowrap",
};

const footer = {
  padding: "18px 22px",
  borderTop: `1px solid ${theme.colors.slate[200]}`,
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  background: "#fff",
};

const btnSecondary = {
  padding: "10px 18px",
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.colors.slate[300]}`,
  background: "#fff",
  color: theme.colors.slate[700],
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
};

const btnPrimary = {
  padding: "10px 18px",
  borderRadius: theme.radius.md,
  border: "none",
  background: theme.colors.indigo[600],
  color: "#fff",
  fontSize: "13px",
  fontWeight: 800,
  cursor: "pointer",
};
