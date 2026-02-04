// src/pages/ConsumoReposicao/ModalLote.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";

/* ===================== ÍCONES POR FUNÇÃO ===================== */
const FUNCOES_ICONS = {
  "Lactação": "🥛",
  "Tratamento": "💊", 
  "Descarte": "🚫",
  "Secagem": "🛑",
  "Pré-parto": "🐄",
  "Novilhas": "🌱",
  "Outro": "📋"
};

const FUNCOES_CORES = {
  "Lactação": { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  "Tratamento": { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
  "Descarte": { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
  "Secagem": { bg: "#f3e8ff", border: "#8b5cf6", text: "#5b21b6" },
  "Pré-parto": { bg: "#fce7f3", border: "#ec4899", text: "#9d174d" },
  "Novilhas": { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
  "Outro": { bg: "#f3f4f6", border: "#6b7280", text: "#374151" }
};

/* ===================== REACT SELECT CUSTOMIZADO ===================== */
const selectTheme = (base) => ({
  ...base,
  colors: {
    ...base.colors,
    primary: "#3b82f6",
    primary75: "#60a5fa",
    primary50: "#bfdbfe",
    primary25: "#eff6ff",
    danger: "#ef4444",
    dangerLight: "#fee2e2",
    neutral0: "#ffffff",
    neutral5: "#f8fafc",
    neutral10: "#f1f5f9",
    neutral20: "#e2e8f0",
    neutral30: "#cbd5e1",
    neutral40: "#94a3b8",
    neutral50: "#64748b",
    neutral60: "#475569",
    neutral70: "#334155",
    neutral80: "#1e293b",
    neutral90: "#0f172a",
  },
});

const selectStyles = {
  container: (base) => ({ ...base, width: "100%" }),
  control: (base, state) => ({
    ...base,
    minHeight: 48,
    borderRadius: 12,
    borderColor: state.isFocused ? "#3b82f6" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
    backgroundColor: "#fff",
    transition: "all 0.2s ease",
    "&:hover": { borderColor: "#3b82f6" },
  }),
  valueContainer: (base) => ({ ...base, padding: "0 16px" }),
  indicatorsContainer: (base) => ({ ...base, height: 48 }),
  menuPortal: (base) => ({ ...base, zIndex: 99999 }),
  menu: (base) => ({ 
    ...base, 
    zIndex: 99999, 
    borderRadius: 12,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e2e8f0"
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#eff6ff" : state.isFocused ? "#f8fafc" : "#fff",
    color: state.isSelected ? "#1e40af" : "#334155",
    fontWeight: state.isSelected ? 600 : 500,
    padding: "12px 16px",
    cursor: "pointer",
  }),
  singleValue: (base) => ({ ...base, color: "#0f172a", fontWeight: 600 }),
  placeholder: (base) => ({ ...base, color: "#94a3b8" }),
};

/* ===================== MODAL BASE MODERNO ===================== */
function ModalBase({ title, children, onClose, icon = "📋" }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div style={overlay} onMouseDown={onClose}>
      <div style={modalCard} onMouseDown={(e) => e.stopPropagation()}>
        <div style={modalHeader}>
          <div style={headerContent}>
            <span style={headerIcon}>{icon}</span>
            <div>
              <div style={headerTitle}>{title}</div>
              <div style={headerSubtitle}>Preencha os dados do lote</div>
            </div>
          </div>
          <button style={closeButton} onClick={onClose} title="Fechar (ESC)">
            ×
          </button>
        </div>
        <div style={modalBody}>{children}</div>
      </div>
    </div>
  );
}

/* ===================== COMPONENTES EXPORTADOS ===================== */

export function ModalLoteCadastro({ title, initialValue, onClose, onCancel, onSave }) {
  const isEdit = !!initialValue?.id;
  const funcaoAtual = initialValue?.funcao || "Lactação";
  const icon = FUNCOES_ICONS[funcaoAtual] || "📋";
  
  return (
    <ModalBase 
      title={isEdit ? "✏️ Editar Lote" : "➕ Novo Lote"} 
      onClose={onClose}
      icon={icon}
    >
      <CadastroLoteForm 
        value={initialValue} 
        onCancel={onCancel} 
        onSave={onSave}
      />
    </ModalBase>
  );
}

export function ModalLoteInfo({ lote, onClose }) {
  const icon = FUNCOES_ICONS[lote?.funcao] || "📋";
  const cor = FUNCOES_CORES[lote?.funcao] || FUNCOES_CORES["Outro"];
  
  return (
    <ModalBase title={lote?.nome || "Detalhes do Lote"} onClose={onClose} icon={icon}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ 
          padding: "16px 20px", 
          backgroundColor: cor.bg, 
          border: `2px solid ${cor.border}`,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          gap: 16
        }}>
          <div style={{ fontSize: 32 }}>{icon}</div>
          <div>
            <div style={{ fontSize: 12, color: cor.text, opacity: 0.8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {lote?.funcao || "Lote"}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: cor.text }}>
              {lote?.nome}
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ 
              display: "inline-flex", 
              padding: "6px 14px", 
              borderRadius: 999, 
              fontSize: 13, 
              fontWeight: 700,
              backgroundColor: lote?.ativo ? "#dcfce7" : "#f3f4f6",
              color: lote?.ativo ? "#166534" : "#6b7280",
              border: `2px solid ${lote?.ativo ? "#86efac" : "#e5e7eb"}`
            }}>
              {lote?.ativo ? "● Ativo" : "○ Inativo"}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <InfoCard label="Função" value={lote?.funcao} />
          {lote?.nivelProducao && <InfoCard label="Nível Produtivo" value={lote?.nivelProducao} />}
          {lote?.tipoTratamento && <InfoCard label="Tratamento" value={lote?.tipoTratamento} />}
          {lote?.motivoDescarte && <InfoCard label="Motivo" value={lote?.motivoDescarte} />}
        </div>

        {lote?.descricao && (
          <div style={{ 
            padding: 16, 
            backgroundColor: "#f8fafc", 
            borderRadius: 12,
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase" }}>Descrição</div>
            <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{lote.descricao}</div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <button style={primaryButton} onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </ModalBase>
  );
}

export function ModalConfirmarExclusao({ title = "Confirmar exclusão", onClose, onCancel, onConfirm }) {
  return (
    <ModalBase title={title} onClose={onClose} icon="⚠️">
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
          Tem certeza que deseja excluir?
        </div>
        <div style={{ fontSize: 14, color: "#64748b", marginBottom: 24, lineHeight: 1.6 }}>
          Esta ação não poderá ser desfeita. Todos os dados associados a este lote serão removidos permanentemente.
        </div>
        
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <button style={secondaryButton} onClick={onCancel}>
            Cancelar
          </button>
          <button style={{...primaryButton, backgroundColor: "#ef4444", boxShadow: "0 1px 3px rgba(239, 68, 68, 0.3)"}} onClick={onConfirm}>
            Sim, excluir lote
          </button>
        </div>
      </div>
    </ModalBase>
  );
}

/* ===================== FORMULÁRIO PRINCIPAL ===================== */
function CadastroLoteForm({ value, onCancel, onSave }) {
  const funcoes = useMemo(() => Object.keys(FUNCOES_ICONS), []);
  const niveis = useMemo(() => ["Alta Produção", "Média Produção", "Baixa Produção"], []);
  const tratamentos = useMemo(() => ["Mastite", "Pós-parto", "Metrite", "Laminites", "Outro"], []);
  const motivos = useMemo(() => ["Produção baixa", "Lesão/Acidente", "Problemas podais", "Mastite crônica", "Idade avançada", "Outro"], []);

  const [form, setForm] = useState(value || { ativo: true });
  const [errors, setErrors] = useState({});

  useEffect(() => setForm(value || { ativo: true }), [value]);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({...e, [k]: null}));
  };

  // Limpa campos dependentes quando troca função
  useEffect(() => {
    if (!form) return;
    if (form.funcao !== "Lactação") set("nivelProducao", undefined);
    if (form.funcao !== "Tratamento") set("tipoTratamento", undefined);
    if (form.funcao !== "Descarte") set("motivoDescarte", undefined);
  }, [form?.funcao]);

  // Validação
  const validate = () => {
    const errs = {};
    if (!form?.nome?.trim()) errs.nome = "Nome é obrigatório";
    if (!form?.funcao) errs.funcao = "Função é obrigatória";
    if (form?.funcao === "Lactação" && !form?.nivelProducao) errs.nivelProducao = "Nível produtivo é obrigatório";
    if (form?.funcao === "Tratamento" && !form?.tipoTratamento) errs.tipoTratamento = "Tipo de tratamento é obrigatório";
    if (form?.funcao === "Descarte" && !form?.motivoDescarte) errs.motivoDescarte = "Motivo é obrigatório";
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave(form);
  };

  // Refs para navegação
  const refNome = useRef(null);
  const refDesc = useRef(null);
  
  useEffect(() => {
    setTimeout(() => refNome.current?.focus(), 100);
  }, []);

  const corAtual = FUNCOES_CORES[form?.funcao] || FUNCOES_CORES["Outro"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Card de Identificação */}
      <div style={sectionCard}>
        <div style={sectionTitle}>Identificação</div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={inputGroup}>
            <label style={labelStyle}>Nome do Lote *</label>
            <input
              ref={refNome}
              type="text"
              value={form?.nome || ""}
              onChange={(e) => set("nome", e.target.value)}
              placeholder="Ex: Lote Alta Produção 01"
              style={{
                ...inputStyle,
                borderColor: errors.nome ? "#ef4444" : "#e2e8f0",
                boxShadow: errors.nome ? "0 0 0 3px rgba(239, 68, 68, 0.1)" : "none"
              }}
            />
            {errors.nome && <span style={errorStyle}>{errors.nome}</span>}
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Função *</label>
            <Select
              value={form?.funcao ? { value: form.funcao, label: `${FUNCOES_ICONS[form.funcao]} ${form.funcao}` } : null}
              onChange={(opt) => set("funcao", opt?.value)}
              options={funcoes.map(f => ({ value: f, label: `${FUNCOES_ICONS[f]} ${f}` }))}
              placeholder="Selecione..."
              styles={selectStyles}
              theme={selectTheme}
              menuPortalTarget={document.body}
            />
            {errors.funcao && <span style={errorStyle}>{errors.funcao}</span>}
          </div>
        </div>
      </div>

      {/* Card Condicional - Específico da Função */}
      {form?.funcao && (
        <div style={{
          ...sectionCard,
          backgroundColor: corAtual.bg,
          border: `2px solid ${corAtual.border}`,
          animation: "slideIn 0.3s ease-out"
        }}>
          <div style={{...sectionTitle, color: corAtual.text}}>
            Configurações de {form.funcao}
          </div>

          {form.funcao === "Lactação" && (
            <div style={inputGroup}>
              <label style={{...labelStyle, color: corAtual.text}}>Nível Produtivo *</label>
              <Select
                value={form?.nivelProducao ? { value: form.nivelProducao, label: form.nivelProducao } : null}
                onChange={(opt) => set("nivelProducao", opt?.value)}
                options={niveis.map(n => ({ value: n, label: n }))}
                placeholder="Selecione o nível produtivo..."
                styles={selectStyles}
                theme={selectTheme}
                menuPortalTarget={document.body}
              />
              {errors.nivelProducao && <span style={errorStyle}>{errors.nivelProducao}</span>}
            </div>
          )}

          {form.funcao === "Tratamento" && (
            <div style={inputGroup}>
              <label style={{...labelStyle, color: corAtual.text}}>Tipo de Tratamento *</label>
              <Select
                value={form?.tipoTratamento ? { value: form.tipoTratamento, label: form.tipoTratamento } : null}
                onChange={(opt) => set("tipoTratamento", opt?.value)}
                options={tratamentos.map(t => ({ value: t, label: t }))}
                placeholder="Selecione o tipo de tratamento..."
                styles={selectStyles}
                theme={selectTheme}
                menuPortalTarget={document.body}
              />
              {errors.tipoTratamento && <span style={errorStyle}>{errors.tipoTratamento}</span>}
            </div>
          )}

          {form.funcao === "Descarte" && (
            <div style={inputGroup}>
              <label style={{...labelStyle, color: corAtual.text}}>Motivo do Descarte *</label>
              <Select
                value={form?.motivoDescarte ? { value: form.motivoDescarte, label: form.motivoDescarte } : null}
                onChange={(opt) => set("motivoDescarte", opt?.value)}
                options={motivos.map(m => ({ value: m, label: m }))}
                placeholder="Selecione o motivo..."
                styles={selectStyles}
                theme={selectTheme}
                menuPortalTarget={document.body}
              />
              {errors.motivoDescarte && <span style={errorStyle}>{errors.motivoDescarte}</span>}
            </div>
          )}

          {(form.funcao === "Secagem" || form.funcao === "Pré-parto" || form.funcao === "Novilhas" || form.funcao === "Outro") && (
            <div style={{ padding: "12px 0", color: corAtual.text, fontSize: 14 }}>
              ℹ️ Não há configurações adicionais necessárias para lotes de <strong>{form.funcao}</strong>.
            </div>
          )}
        </div>
      )}

      {/* Descrição */}
      <div style={sectionCard}>
        <div style={sectionTitle}>Informações Adicionais</div>
        <div style={inputGroup}>
          <label style={labelStyle}>Descrição (opcional)</label>
          <textarea
            ref={refDesc}
            value={form?.descricao || ""}
            onChange={(e) => set("descricao", e.target.value)}
            placeholder="Adicione observações relevantes sobre este lote..."
            style={{...inputStyle, minHeight: 80, resize: "vertical", padding: 12}}
          />
        </div>
      </div>

      {/* Status Toggle Moderno */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        backgroundColor: form?.ativo ? "#f0fdf4" : "#f8fafc",
        border: `2px solid ${form?.ativo ? "#86efac" : "#e2e8f0"}`,
        borderRadius: 12,
        transition: "all 0.3s ease"
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: form?.ativo ? "#166534" : "#374151" }}>
            Status do Lote
          </div>
          <div style={{ fontSize: 12, color: form?.ativo ? "#22c55e" : "#64748b", marginTop: 2 }}>
            {form?.ativo ? "Lote ativo e disponível para uso" : "Lote inativo (não aparecerá em listagens)"}
          </div>
        </div>
        
        <button
          onClick={() => set("ativo", !form?.ativo)}
          style={{
            position: "relative",
            width: 56,
            height: 28,
            borderRadius: 14,
            border: "none",
            backgroundColor: form?.ativo ? "#22c55e" : "#cbd5e1",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
            padding: 0
          }}
        >
          <div style={{
            position: "absolute",
            top: 2,
            left: form?.ativo ? 30 : 2,
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            transition: "left 0.3s ease"
          }}/>
        </button>
      </div>

      {/* Footer Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
        <button style={secondaryButton} onClick={onCancel}>
          Cancelar
        </button>
        <button style={primaryButton} onClick={handleSave}>
          💾 Salvar Lote
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ===================== SUB-COMPONENTES ===================== */

function InfoCard({ label, value }) {
  return (
    <div style={{ padding: 12, backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
        {value}
      </div>
    </div>
  );
}

/* ===================== ESTILOS ===================== */

const overlay = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(15, 23, 42, 0.6)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: 20,
};

const modalCard = {
  width: "100%",
  maxWidth: 600,
  maxHeight: "90vh",
  backgroundColor: "#fff",
  borderRadius: 20,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
};

const modalHeader = {
  background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
  padding: "20px 24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const headerContent = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const headerIcon = {
  fontSize: 28,
  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
};

const headerTitle = {
  fontSize: 18,
  fontWeight: 800,
  color: "#fff",
  letterSpacing: "-0.025em",
};

const headerSubtitle = {
  fontSize: 13,
  color: "rgba(255,255,255,0.8)",
  marginTop: 2,
};

const closeButton = {
  width: 36,
  height: 36,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.3)",
  backgroundColor: "rgba(255,255,255,0.1)",
  color: "#fff",
  fontSize: 24,
  fontWeight: 300,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s",
};

const modalBody = {
  padding: 24,
  overflowY: "auto",
  backgroundColor: "#f8fafc",
};

const sectionCard = {
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 20,
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

const sectionTitle = {
  fontSize: 12,
  fontWeight: 800,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 16,
};

const inputGroup = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: "#374151",
};

const inputStyle = {
  width: "100%",
  height: 48,
  padding: "0 16px",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  fontSize: 14,
  fontFamily: "inherit",
  transition: "all 0.2s",
  outline: "none",
  boxSizing: "border-box",
};

const errorStyle = {
  fontSize: 12,
  color: "#ef4444",
  fontWeight: 600,
  marginTop: 4,
};

const primaryButton = {
  padding: "12px 24px",
  backgroundColor: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 1px 3px rgba(59, 130, 246, 0.3)",
  transition: "all 0.2s",
};

const secondaryButton = {
  padding: "12px 24px",
  backgroundColor: "#fff",
  color: "#64748b",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
};