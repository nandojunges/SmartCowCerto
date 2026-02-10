// src/Pages/Ajustes/CentroOperacoes/PermissoesGranulares.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Shield, Check, X } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "../../../lib/supabaseClient";
import { useFazenda } from "../../../context/FazendaContext";
import { MODULOS_MENU } from "../../../lib/permissoes";

const MODULOS = MODULOS_MENU.map((item) => ({
  id: item.id,
  label: item.label,
  icon: item.icon,
}));

export default function PermissoesGranulares({ membros }) {
  const { fazendaAtualId } = useFazenda();
  const [membroSelecionado, setMembroSelecionado] = useState(null);
  const [permissoes, setPermissoes] = useState({});
  const [carregandoPermissoes, setCarregandoPermissoes] = useState(false);
  const [salvandoPermissoes, setSalvandoPermissoes] = useState(false);

  const membrosAtivos = useMemo(
    () => (membros || []).filter((m) => m.status === "ATIVO"),
    [membros]
  );

  useEffect(() => {
    if (!membroSelecionado || !fazendaAtualId) {
      setPermissoes({});
      return;
    }

    let isMounted = true;

    async function carregarPermissoes() {
      setCarregandoPermissoes(true);
      try {
        const { data, error } = await supabase
          .from("fazenda_permissoes")
          .select("modulo, pode_ver, pode_editar")
          .eq("fazenda_id", fazendaAtualId)
          .eq("user_id", membroSelecionado.user_id);

        if (error) {
          throw error;
        }

        if (!isMounted) return;

        const nextState = {};
        MODULOS.forEach((modulo) => {
          const row = (data || []).find((item) => item.modulo === modulo.id);
          nextState[modulo.id] = {
            pode_ver: Boolean(row?.pode_ver),
            pode_editar: Boolean(row?.pode_editar),
          };
        });

        setPermissoes(nextState);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("Erro ao carregar permissões:", err?.message);
        }
        toast.error("Não foi possível carregar as permissões do profissional.");
      } finally {
        if (isMounted) {
          setCarregandoPermissoes(false);
        }
      }
    }

    carregarPermissoes();

    return () => {
      isMounted = false;
    };
  }, [fazendaAtualId, membroSelecionado]);

  const toggleVisualizar = (modulo) => {
    setPermissoes((prev) => {
      const atual = prev[modulo] || { pode_ver: false, pode_editar: false };
      const podeVer = !atual.pode_ver;

      return {
        ...prev,
        [modulo]: {
          pode_ver: podeVer,
          pode_editar: podeVer ? atual.pode_editar : false,
        },
      };
    });
  };

  const toggleEditar = (modulo) => {
    setPermissoes((prev) => {
      const atual = prev[modulo] || { pode_ver: false, pode_editar: false };
      if (!atual.pode_ver) {
        return prev;
      }

      return {
        ...prev,
        [modulo]: {
          ...atual,
          pode_editar: !atual.pode_editar,
        },
      };
    });
  };

  const salvarPermissoes = async () => {
    if (!membroSelecionado || !fazendaAtualId) return;

    try {
      setSalvandoPermissoes(true);

      const payload = MODULOS.map((modulo) => {
        const item = permissoes[modulo.id] || { pode_ver: false, pode_editar: false };
        const podeVer = Boolean(item.pode_ver);
        return {
          fazenda_id: fazendaAtualId,
          user_id: membroSelecionado.user_id,
          modulo: modulo.id,
          pode_ver: podeVer,
          pode_editar: podeVer && Boolean(item.pode_editar),
        };
      });

      const { error } = await supabase
        .from("fazenda_permissoes")
        .upsert(payload, { onConflict: "fazenda_id,user_id,modulo" });

      if (error) {
        throw error;
      }

      toast.success("Permissões salvas com sucesso.");
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Erro ao salvar permissões:", err?.message);
      }
      toast.error("Não foi possível salvar as permissões.");
    } finally {
      setSalvandoPermissoes(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
          Controle de Permissões
        </h3>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
          Defina os acessos de Visualizar e Editar por módulo.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            padding: 16,
          }}
        >
          <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#374151" }}>
            Selecionar Profissional
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {membrosAtivos.map((membro) => (
              <button
                key={membro.id}
                onClick={() => setMembroSelecionado(membro)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid",
                  borderColor: membroSelecionado?.id === membro.id ? "#3b82f6" : "#e2e8f0",
                  background: membroSelecionado?.id === membro.id ? "#eff6ff" : "#ffffff",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>
                  {membro.profiles?.full_name || membro.nome_profissional}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  {membro.tipo_profissional}
                </div>
              </button>
            ))}
          </div>
        </div>

        {membroSelecionado ? (
          <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24 }}>
            <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #e2e8f0" }}>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                Configurando: {membroSelecionado.profiles?.full_name || membroSelecionado.nome_profissional}
              </h4>
            </div>

            {carregandoPermissoes ? (
              <p style={{ color: "#64748b", margin: 0 }}>Carregando permissões...</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {MODULOS.map((modulo) => {
                  const estado = permissoes[modulo.id] || { pode_ver: false, pode_editar: false };

                  return (
                    <div
                      key={modulo.id}
                      style={{
                        padding: 16,
                        background: "#f8fafc",
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 20 }}>{modulo.icon}</span>
                        <span style={{ fontWeight: 700, color: "#0f172a" }}>{modulo.label}</span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(170px, 1fr))", gap: 12 }}>
                        <TogglePermissao
                          label="Visualizar"
                          ativo={estado.pode_ver}
                          onClick={() => toggleVisualizar(modulo.id)}
                        />
                        <TogglePermissao
                          label="Editar"
                          ativo={estado.pode_editar}
                          disabled={!estado.pode_ver}
                          onClick={() => toggleEditar(modulo.id)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={salvarPermissoes}
                disabled={carregandoPermissoes || salvandoPermissoes}
                style={{
                  padding: "10px 24px",
                  background: "#0f172a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: carregandoPermissoes || salvandoPermissoes ? 0.7 : 1,
                }}
              >
                {salvandoPermissoes ? "Salvando..." : "Salvar Permissões"}
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              padding: 48,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
            }}
          >
            <Shield size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <p>Selecione um profissional para configurar permissões</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TogglePermissao({ label, ativo, disabled = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px",
        borderRadius: 8,
        border: `2px solid ${ativo ? "#10b981" : "#e2e8f0"}`,
        background: ativo ? "#d1fae5" : "#ffffff",
        cursor: disabled ? "not-allowed" : "pointer",
        textAlign: "center",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 13,
          color: ativo ? "#065f46" : "#374151",
          marginBottom: 4,
        }}
      >
        {ativo ? <Check size={14} style={{ display: "inline" }} /> : <X size={14} style={{ display: "inline" }} />} {label}
      </div>
    </button>
  );
}
