import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useFazenda } from "../../context/FazendaContext";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  padding: 12,
};

const modalStyle = {
  background: "#fff",
  width: "min(520px, 92vw)",
  borderRadius: 16,
  boxShadow: "0 16px 40px rgba(15,23,42,0.35)",
  overflow: "hidden",
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

const DEFAULTS = {
  gestacao_dias: 280,
  secagem_antecedencia_dias: 60,
  preparto_antecedencia_dias: 21,
  aviso_secagem_dias: 7,
  aviso_parto_dias: 7,
};

export default function ModalParametrosRepro({ open, onClose, onSaved }) {
  const { fazendaAtualId } = useFazenda();
  const [formValues, setFormValues] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [userId, setUserId] = useState(null);

  const alertStyles = useMemo(
    () => ({
      base: {
        padding: "10px 12px",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: 600,
      },
      error: {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
        border: "1px solid #fecaca",
      },
      success: {
        backgroundColor: "#dcfce7",
        color: "#166534",
        border: "1px solid #bbf7d0",
      },
    }),
    []
  );

  useEffect(() => {
    if (!open) return;
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    let ativo = true;

    const carregar = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const currentUserId = userData?.user?.id ?? null;
      setUserId(currentUserId);

      if (userError || !fazendaAtualId || !currentUserId) {
        if (ativo) {
          setErrorMsg("Selecione a fazenda e o usuário para editar os parâmetros reprodutivos.");
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("config_repro_parametros")
        .select("*")
        .eq("fazenda_id", fazendaAtualId)
        .maybeSingle();

      if (!ativo) return;

      if (error) {
        setErrorMsg("Não foi possível carregar os parâmetros reprodutivos.");
        setLoading(false);
        return;
      }

      let registro = data;
      if (!registro) {
        const { error: createError } = await supabase
          .from("config_repro_parametros")
          .insert({
            fazenda_id: fazendaAtualId,
            user_id: currentUserId,
            ...DEFAULTS,
          });

        if (!ativo) return;

        if (createError) {
          setErrorMsg("Não foi possível criar os parâmetros reprodutivos.");
          setLoading(false);
          return;
        }

        const { data: createdRow, error: fetchError } = await supabase
          .from("config_repro_parametros")
          .select("*")
          .eq("fazenda_id", fazendaAtualId)
          .maybeSingle();

        if (!ativo) return;

        if (fetchError) {
          setErrorMsg("Não foi possível carregar os parâmetros reprodutivos.");
          setLoading(false);
          return;
        }

        registro = createdRow;
      }

      setFormValues({
        gestacao_dias: Number(registro?.gestacao_dias ?? DEFAULTS.gestacao_dias),
        secagem_antecedencia_dias: Number(
          registro?.secagem_antecedencia_dias ?? DEFAULTS.secagem_antecedencia_dias
        ),
        preparto_antecedencia_dias: Number(
          registro?.preparto_antecedencia_dias ?? DEFAULTS.preparto_antecedencia_dias
        ),
        aviso_secagem_dias: Number(registro?.aviso_secagem_dias ?? DEFAULTS.aviso_secagem_dias),
        aviso_parto_dias: Number(registro?.aviso_parto_dias ?? DEFAULTS.aviso_parto_dias),
      });
      setLoading(false);
    };

    carregar();

    return () => {
      ativo = false;
    };
  }, [open, fazendaAtualId]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const updateField = (field) => (event) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const parseField = (value) => {
    if (value === "" || value === null || value === undefined) return NaN;
    const num = Number(value);
    if (!Number.isFinite(num)) return NaN;
    return Math.trunc(num);
  };

  const handleSave = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    const gestacao = parseField(formValues.gestacao_dias);
    const secagem = parseField(formValues.secagem_antecedencia_dias);
    const preparto = parseField(formValues.preparto_antecedencia_dias);
    const avisoSecagem = parseField(formValues.aviso_secagem_dias);
    const avisoParto = parseField(formValues.aviso_parto_dias);

    if (![gestacao, secagem, preparto, avisoSecagem, avisoParto].every(Number.isFinite)) {
      setErrorMsg("Preencha todos os campos com números inteiros.");
      return;
    }
    if ([gestacao, secagem, preparto, avisoSecagem, avisoParto].some((v) => v < 0)) {
      setErrorMsg("Os valores devem ser inteiros iguais ou maiores que zero.");
      return;
    }
    if (gestacao < 200) {
      setErrorMsg("A gestação deve ser de pelo menos 200 dias.");
      return;
    }
    if (secagem > gestacao) {
      setErrorMsg("A antecedência da secagem não pode ser maior que os dias de gestação.");
      return;
    }
    if (preparto > gestacao) {
      setErrorMsg("A antecedência do pré-parto não pode ser maior que os dias de gestação.");
      return;
    }

    if (!fazendaAtualId || !userId) {
      setErrorMsg("Selecione a fazenda e o usuário para salvar os parâmetros.");
      return;
    }

    setLoading(true);

    const payload = {
      fazenda_id: fazendaAtualId,
      user_id: userId,
      gestacao_dias: gestacao,
      secagem_antecedencia_dias: secagem,
      preparto_antecedencia_dias: preparto,
      aviso_secagem_dias: avisoSecagem,
      aviso_parto_dias: avisoParto,
    };

    const response = await supabase
      .from("config_repro_parametros")
      .upsert(payload, { onConflict: "fazenda_id" });

    if (response.error) {
      setErrorMsg("Não foi possível salvar os parâmetros reprodutivos.");
      setLoading(false);
      return;
    }

    setSuccessMsg("Parâmetros reprodutivos atualizados com sucesso!");
    setLoading(false);
    onSaved?.();
    onClose?.();
  };

  return (
    <div style={overlayStyle} onMouseDown={onClose}>
      <div style={modalStyle} onMouseDown={(event) => event.stopPropagation()}>
        <div style={headerStyle}>
          <span>Parâmetros reprodutivos</span>
          <button type="button" onClick={onClose} style={closeButtonStyle}>
            Fechar
          </button>
        </div>

        <div style={{ padding: 20, display: "grid", gap: 12 }}>
          {errorMsg && <div style={{ ...alertStyles.base, ...alertStyles.error }}>{errorMsg}</div>}
          {successMsg && <div style={{ ...alertStyles.base, ...alertStyles.success }}>{successMsg}</div>}

          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600 }}>
            Gestação (dias)
            <input
              type="number"
              min={0}
              value={formValues.gestacao_dias}
              onChange={updateField("gestacao_dias")}
              style={inputStyle}
            />
            <span style={{ fontSize: 12, color: "#64748b" }}>
              Referência para cálculo da data prevista de parto.
            </span>
          </label>

          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600 }}>
            Secagem (dias antes do parto)
            <input
              type="number"
              min={0}
              value={formValues.secagem_antecedencia_dias}
              onChange={updateField("secagem_antecedencia_dias")}
              style={inputStyle}
            />
            <span style={{ fontSize: 12, color: "#64748b" }}>
              Define a antecedência da secagem em relação ao parto.
            </span>
          </label>

          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600 }}>
            Pré-parto (dias antes do parto)
            <input
              type="number"
              min={0}
              value={formValues.preparto_antecedencia_dias}
              onChange={updateField("preparto_antecedencia_dias")}
              style={inputStyle}
            />
            <span style={{ fontSize: 12, color: "#64748b" }}>
              Controla quando o animal entra em pré-parto.
            </span>
          </label>

          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600 }}>
            Aviso de secagem (dias antes)
            <input
              type="number"
              min={0}
              value={formValues.aviso_secagem_dias}
              onChange={updateField("aviso_secagem_dias")}
              style={inputStyle}
            />
            <span style={{ fontSize: 12, color: "#64748b" }}>
              Dias antes da data prevista de secagem para iniciar o aviso.
            </span>
          </label>

          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600 }}>
            Aviso de parto (dias antes)
            <input
              type="number"
              min={0}
              value={formValues.aviso_parto_dias}
              onChange={updateField("aviso_parto_dias")}
              style={inputStyle}
            />
            <span style={{ fontSize: 12, color: "#64748b" }}>
              Dias antes da data prevista de parto para iniciar o aviso.
            </span>
          </label>
        </div>

        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          <button type="button" onClick={onClose} style={closeButtonStyle}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            style={{
              ...closeButtonStyle,
              background: "#2563eb",
              borderColor: "#2563eb",
              color: "#fff",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
