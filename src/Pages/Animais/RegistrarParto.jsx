import React, { useMemo, useState, useEffect } from "react";
import Select from "react-select";

export default function RegistrarParto(props) {
  // ✅ Compatível com as duas assinaturas:
  // - nova:  { animal, onClose }
  // - antiga:{ vaca, onFechar }
  const animalProp = props.animal ?? props.vaca ?? null;
  const onClose = props.onClose ?? props.onFechar ?? (() => {});

  // ✅ Blindagem: garante objeto seguro
  const vacaSafe = useMemo(
    () => (animalProp && typeof animalProp === "object" ? animalProp : null),
    [animalProp]
  );

  const numeroVaca = vacaSafe?.numero ?? vacaSafe?.num ?? "—";

  const [dataParto, setDataParto] = useState("");
  const [horaParto, setHoraParto] = useState("");
  const [facilidade, setFacilidade] = useState(null);
  const [assistencia, setAssistencia] = useState(null);
  const [colostroBrix, setColostroBrix] = useState("");
  const [temperatura, setTemperatura] = useState("");
  const [observacoesMae, setObservacoesMae] = useState("");
  const [bezerros, setBezerros] = useState([]);
  const [erro, setErro] = useState("");

  function criarBezerroVazio(numero) {
    return {
      numero,
      sexo: null,
      peso: "",
      vitalidade: null,
      colostragem: {
        recebeu: null,
        hora: "",
        volume: "",
      },
      observacoes: "",
    };
  }

  // ✅ Init: data/hora + bezerro inicial + ESC
  useEffect(() => {
    const hoje = new Date();
    setDataParto(hoje.toLocaleDateString("pt-BR"));
    setHoraParto(
      `${hoje.getHours().toString().padStart(2, "0")}:${hoje
        .getMinutes()
        .toString()
        .padStart(2, "0")}`
    );

    setBezerros([criarBezerroVazio(1)]);

    const keyHandler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [onClose]);

  // ✅ Se abriu sem vaca, mensagem amigável
  useEffect(() => {
    if (!vacaSafe) {
      setErro("Nenhuma vaca selecionada para registrar parto.");
    } else {
      setErro("");
    }
  }, [vacaSafe]);

  const formatarData = (valor) => {
    const limpo = String(valor || "").replace(/\D/g, "").slice(0, 8);
    const dia = limpo.slice(0, 2);
    const mes = limpo.slice(2, 4);
    const ano = limpo.slice(4, 8);
    return [dia, mes, ano].filter(Boolean).join("/");
  };

  const adicionarBezerro = () => {
    setBezerros((prev) => [...prev, criarBezerroVazio(prev.length + 1)]);
  };

  const removerBezerro = (index) => {
    setBezerros((prev) => {
      if (prev.length === 1) return prev;
      const novos = prev.filter((_, i) => i !== index);
      return novos.map((b, i) => ({ ...b, numero: i + 1 }));
    });
  };

  const atualizarBezerro = (index, campo, valor) => {
    setBezerros((prev) => {
      const novos = [...prev];
      if (!novos[index]) return prev;

      if (campo.includes(".")) {
        const [parent, child] = campo.split(".");
        novos[index] = {
          ...novos[index],
          [parent]: { ...novos[index][parent], [child]: valor },
        };
      } else {
        novos[index] = { ...novos[index], [campo]: valor };
      }
      return novos;
    });
  };

  const calcularTempoColostragem = (horaPartoStr, horaColostro) => {
    if (!horaPartoStr || !horaColostro) return null;
    const [h1, m1] = String(horaPartoStr).split(":").map(Number);
    const [h2, m2] = String(horaColostro).split(":").map(Number);
    if (![h1, m1, h2, m2].every((n) => Number.isFinite(n))) return null;
    const minutos = h2 * 60 + m2 - (h1 * 60 + m1);
    return minutos >= 0 ? minutos : null;
  };

  const getMensagemColostragem = (minutos) => {
    if (minutos === null) return null;
    if (minutos <= 120) return { tipo: "sucesso", texto: "✅ Excelente! Até 2h" };
    if (minutos <= 360) return { tipo: "alerta", texto: "⚠️ Atenção: 2-6h" };
    return { tipo: "erro", texto: "❌ Muito tarde: >6h" };
  };

  const validarFormulario = () => {
    if (!vacaSafe || vacaSafe.numero === undefined || vacaSafe.numero === null) {
      setErro("Selecione uma vaca válida antes de salvar.");
      return false;
    }

    if (!dataParto || !facilidade) {
      setErro("Preencha a data e a facilidade do parto");
      return false;
    }

    for (let i = 0; i < bezerros.length; i++) {
      const b = bezerros[i];
      if (!b?.sexo || !b?.vitalidade) {
        setErro(`Preencha sexo e vitalidade do bezerro ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const salvar = () => {
    if (!validarFormulario()) return;

    const animais = JSON.parse(localStorage.getItem("animais") || "[]");
    const bezerrosExistentes = JSON.parse(localStorage.getItem("bezerros") || "[]");

    const alvoNumero = String(vacaSafe.numero);
    const indexMae = animais.findIndex((a) => String(a?.numero) === alvoNumero);

    if (indexMae === -1) {
      setErro("Não encontrei essa vaca no armazenamento local (localStorage).");
      return;
    }

    const dadosParto = {
      data: dataParto,
      hora: horaParto,
      facilidade: facilidade.value,
      assistencia: assistencia?.value || "Não necessária",
      colostroBrix,
      temperatura,
      numeroBezerros: bezerros.length,
      observacoes: observacoesMae,
    };

    if (!animais[indexMae].historico) animais[indexMae].historico = [];
    animais[indexMae].historico.push({
      tipo: "parto",
      ...dadosParto,
    });

    animais[indexMae].statusReprodutivo = "pos-parto";
    animais[indexMae].ultimoParto = dataParto;

    const partosAtual = parseInt(animais[indexMae].numeroPartos || "0", 10);
    animais[indexMae].numeroPartos = String(Number.isFinite(partosAtual) ? partosAtual + 1 : 1);

    const todosNumeros = [
      ...animais.map((a) => Number(a?.numero) || 0),
      ...bezerrosExistentes.map((b) => Number(b?.numero) || 0),
    ];
    let proximoNumero = todosNumeros.length > 0 ? Math.max(...todosNumeros) + 1 : 1;

    const novosBezerros = bezerros.map((b) => {
      const minutos = calcularTempoColostragem(horaParto, b.colostragem.hora);
      return {
        numero: proximoNumero++,
        mae: vacaSafe.numero,
        sexo: b.sexo.value,
        dataNascimento: dataParto,
        horaNascimento: horaParto,
        peso: b.peso,
        vitalidade: b.vitalidade.value,
        colostragem: {
          recebeu: b.colostragem.recebeu?.value === "Sim",
          hora: b.colostragem.hora,
          volume: b.colostragem.volume,
          tempoAposNascimento: minutos,
        },
        observacoes: b.observacoes,
      };
    });

    localStorage.setItem("bezerros", JSON.stringify([...bezerrosExistentes, ...novosBezerros]));
    localStorage.setItem("animais", JSON.stringify(animais));
    window.dispatchEvent(new Event("animaisAtualizados"));

    onClose?.();
    props.onSaved?.(dadosParto);
  };

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
      width: "900px",
      maxWidth: "95vw",
      maxHeight: "95vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Poppins, sans-serif",
      boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    },
    header: {
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      color: "white",
      padding: "1.5rem",
      fontSize: "1.2rem",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    corpo: {
      padding: "2rem",
      overflowY: "auto",
      flex: 1,
    },
    secao: {
      marginBottom: "2rem",
    },
    tituloSecao: {
      fontSize: "1.1rem",
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: "1rem",
      paddingBottom: "0.5rem",
      borderBottom: "2px solid #e5e7eb",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "1rem",
    },
    gridFull: {
      gridColumn: "1 / -1",
    },
    campo: {
      marginBottom: "0.5rem",
    },
    label: {
      display: "block",
      marginBottom: "0.4rem",
      fontWeight: "500",
      fontSize: "0.9rem",
      color: "#374151",
    },
    obrigatorio: {
      color: "#ef4444",
      marginLeft: "0.25rem",
    },
    input: {
      width: "100%",
      padding: "0.65rem",
      fontSize: "0.9rem",
      borderRadius: "0.5rem",
      border: "2px solid #e5e7eb",
      boxSizing: "border-box",
      transition: "border-color 0.2s",
      fontFamily: "Poppins, sans-serif",
    },
    textarea: {
      width: "100%",
      padding: "0.65rem",
      fontSize: "0.9rem",
      borderRadius: "0.5rem",
      border: "2px solid #e5e7eb",
      boxSizing: "border-box",
      resize: "vertical",
      minHeight: "60px",
      fontFamily: "Poppins, sans-serif",
    },
    cardBezerro: {
      border: "2px solid #e5e7eb",
      borderRadius: "0.75rem",
      padding: "1.5rem",
      marginBottom: "1rem",
      background: "#fafafa",
    },
    headerBezerro: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1rem",
    },
    tituloBezerro: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#059669",
    },
    botaoRemover: {
      background: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "0.4rem",
      padding: "0.4rem 0.8rem",
      fontSize: "0.85rem",
      cursor: "pointer",
      fontWeight: "500",
    },
    botaoAdicionar: {
      background: "#10b981",
      color: "white",
      border: "none",
      borderRadius: "0.5rem",
      padding: "0.75rem 1.5rem",
      fontSize: "0.95rem",
      cursor: "pointer",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      margin: "0 auto",
    },
    footer: {
      padding: "1.5rem",
      borderTop: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
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
    alertaColostro: {
      padding: "0.5rem",
      borderRadius: "0.4rem",
      fontSize: "0.8rem",
      marginTop: "0.3rem",
      fontWeight: "500",
    },
    info: {
      background: "#d1fae5",
      padding: "1rem",
      borderRadius: "0.5rem",
      fontSize: "0.85rem",
      color: "#065f46",
      marginTop: "1rem",
    },
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "0.5rem",
      border: `2px solid ${state.isFocused ? "#10b981" : "#e5e7eb"}`,
      boxShadow: "none",
      minHeight: "40px",
      fontSize: "0.9rem",
      "&:hover": {
        borderColor: "#10b981",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const opcoesFacilidade = [
    { value: "Sem assistência", label: "Sem assistência" },
    { value: "Assistência leve", label: "Assistência leve" },
    { value: "Assistência moderada", label: "Assistência moderada" },
    { value: "Dificil", label: "Difícil" },
    { value: "Cesárea", label: "Cesárea" },
  ];

  const opcoesAssistencia = [
    { value: "Não necessária", label: "Não necessária" },
    { value: "Médico veterinário", label: "Médico veterinário" },
    { value: "Técnico da fazenda", label: "Técnico da fazenda" },
  ];

  const opcoesSexo = [
    { value: "Macho", label: "🔵 Macho" },
    { value: "Fêmea", label: "🔴 Fêmea" },
  ];

  const opcoesVitalidade = [
    { value: "Excelente", label: "Excelente - vigoroso" },
    { value: "Boa", label: "Boa - normal" },
    { value: "Regular", label: "Regular - fraco" },
    { value: "Ruim", label: "Ruim - muito fraco" },
  ];

  const opcoesSimNao = [
    { value: "Sim", label: "Sim" },
    { value: "Não", label: "Não" },
  ];

  return (
    <div
      style={estilos.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div style={estilos.modal}>
        <div style={estilos.header}>🐄 Registrar Parto - Vaca {numeroVaca}</div>

        <div style={estilos.corpo}>
          {erro && <div style={estilos.erro}>⚠️ {erro}</div>}

          <div style={estilos.secao}>
            <div style={estilos.tituloSecao}>📋 Dados do Parto</div>
            <div style={estilos.grid}>
              <div style={estilos.campo}>
                <label style={estilos.label}>
                  Data<span style={estilos.obrigatorio}>*</span>
                </label>
                <input
                  type="text"
                  value={dataParto}
                  onChange={(e) => setDataParto(formatarData(e.target.value))}
                  style={estilos.input}
                  placeholder="dd/mm/aaaa"
                  autoFocus
                  disabled={!vacaSafe}
                />
              </div>

              <div style={estilos.campo}>
                <label style={estilos.label}>Horário</label>
                <input
                  type="time"
                  value={horaParto}
                  onChange={(e) => setHoraParto(e.target.value)}
                  style={estilos.input}
                  disabled={!vacaSafe}
                />
              </div>

              <div style={estilos.campo}>
                <label style={estilos.label}>
                  Facilidade<span style={estilos.obrigatorio}>*</span>
                </label>
                <Select
                  options={opcoesFacilidade}
                  value={facilidade}
                  onChange={setFacilidade}
                  styles={selectStyles}
                  placeholder="Selecione..."
                  isDisabled={!vacaSafe}
                />
              </div>

              <div style={estilos.campo}>
                <label style={estilos.label}>Assistência</label>
                <Select
                  options={opcoesAssistencia}
                  value={assistencia}
                  onChange={setAssistencia}
                  styles={selectStyles}
                  placeholder="Selecione..."
                  isDisabled={!vacaSafe}
                />
              </div>

              <div style={estilos.campo}>
                <label style={estilos.label}>BRIX Colostro (%)</label>
                <input
                  type="number"
                  value={colostroBrix}
                  onChange={(e) => setColostroBrix(e.target.value)}
                  style={estilos.input}
                  placeholder="Ex: 22"
                  step="0.1"
                  disabled={!vacaSafe}
                />
              </div>

              <div style={estilos.campo}>
                <label style={estilos.label}>Temperatura (°C)</label>
                <input
                  type="number"
                  value={temperatura}
                  onChange={(e) => setTemperatura(e.target.value)}
                  style={estilos.input}
                  placeholder="Ex: 38.5"
                  step="0.1"
                  disabled={!vacaSafe}
                />
              </div>

              <div style={{ ...estilos.campo, ...estilos.gridFull }}>
                <label style={estilos.label}>Observações da Mãe</label>
                <textarea
                  value={observacoesMae}
                  onChange={(e) => setObservacoesMae(e.target.value)}
                  style={estilos.textarea}
                  placeholder="Retenção de placenta, comportamento pós-parto, etc..."
                  disabled={!vacaSafe}
                />
              </div>
            </div>
          </div>

          <div style={estilos.secao}>
            <div style={estilos.tituloSecao}>🐮 Bezerro(s)</div>

            {bezerros.map((bezerro, index) => {
              const minutosColostro = calcularTempoColostragem(
                horaParto,
                bezerro.colostragem.hora
              );
              const mensagem = getMensagemColostragem(minutosColostro);

              return (
                <div key={index} style={estilos.cardBezerro}>
                  <div style={estilos.headerBezerro}>
                    <div style={estilos.tituloBezerro}>Bezerro {bezerro.numero}</div>
                    {bezerros.length > 1 && (
                      <button
                        type="button"
                        style={estilos.botaoRemover}
                        onClick={() => removerBezerro(index)}
                        disabled={!vacaSafe}
                      >
                        ✕ Remover
                      </button>
                    )}
                  </div>

                  <div style={estilos.grid}>
                    <div style={estilos.campo}>
                      <label style={estilos.label}>
                        Sexo<span style={estilos.obrigatorio}>*</span>
                      </label>
                      <Select
                        options={opcoesSexo}
                        value={bezerro.sexo}
                        onChange={(v) => atualizarBezerro(index, "sexo", v)}
                        styles={selectStyles}
                        placeholder="Selecione..."
                        isDisabled={!vacaSafe}
                      />
                    </div>

                    <div style={estilos.campo}>
                      <label style={estilos.label}>Peso (kg)</label>
                      <input
                        type="number"
                        value={bezerro.peso}
                        onChange={(e) => atualizarBezerro(index, "peso", e.target.value)}
                        style={estilos.input}
                        placeholder="Ex: 35"
                        step="0.1"
                        disabled={!vacaSafe}
                      />
                    </div>

                    <div style={{ ...estilos.campo, ...estilos.gridFull }}>
                      <label style={estilos.label}>
                        Vitalidade<span style={estilos.obrigatorio}>*</span>
                      </label>
                      <Select
                        options={opcoesVitalidade}
                        value={bezerro.vitalidade}
                        onChange={(v) => atualizarBezerro(index, "vitalidade", v)}
                        styles={selectStyles}
                        placeholder="Selecione..."
                        isDisabled={!vacaSafe}
                      />
                    </div>

                    <div style={estilos.campo}>
                      <label style={estilos.label}>Recebeu Colostro?</label>
                      <Select
                        options={opcoesSimNao}
                        value={bezerro.colostragem.recebeu}
                        onChange={(v) => atualizarBezerro(index, "colostragem.recebeu", v)}
                        styles={selectStyles}
                        placeholder="Selecione..."
                        isDisabled={!vacaSafe}
                      />
                    </div>

                    {bezerro.colostragem.recebeu?.value === "Sim" && (
                      <>
                        <div style={estilos.campo}>
                          <label style={estilos.label}>Hora da Colostragem</label>
                          <input
                            type="time"
                            value={bezerro.colostragem.hora}
                            onChange={(e) =>
                              atualizarBezerro(index, "colostragem.hora", e.target.value)
                            }
                            style={estilos.input}
                            disabled={!vacaSafe}
                          />
                          {mensagem && (
                            <div
                              style={{
                                ...estilos.alertaColostro,
                                background:
                                  mensagem.tipo === "sucesso"
                                    ? "#d1fae5"
                                    : mensagem.tipo === "alerta"
                                    ? "#fef3c7"
                                    : "#fee2e2",
                                color:
                                  mensagem.tipo === "sucesso"
                                    ? "#065f46"
                                    : mensagem.tipo === "alerta"
                                    ? "#92400e"
                                    : "#991b1b",
                              }}
                            >
                              {mensagem.texto}
                            </div>
                          )}
                        </div>

                        <div style={estilos.campo}>
                          <label style={estilos.label}>Volume (litros)</label>
                          <input
                            type="number"
                            value={bezerro.colostragem.volume}
                            onChange={(e) =>
                              atualizarBezerro(index, "colostragem.volume", e.target.value)
                            }
                            style={estilos.input}
                            placeholder="Ex: 4"
                            step="0.1"
                            disabled={!vacaSafe}
                          />
                        </div>
                      </>
                    )}

                    <div style={{ ...estilos.campo, ...estilos.gridFull }}>
                      <label style={estilos.label}>Observações</label>
                      <textarea
                        value={bezerro.observacoes}
                        onChange={(e) => atualizarBezerro(index, "observacoes", e.target.value)}
                        style={estilos.textarea}
                        placeholder="Problemas ao nascer, coloração, vigor..."
                        disabled={!vacaSafe}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              style={estilos.botaoAdicionar}
              onClick={adicionarBezerro}
              disabled={!vacaSafe}
            >
              ➕ Adicionar Bezerro (Gêmeos)
            </button>
          </div>

          <div style={estilos.info}>
            💡 <strong>Dica:</strong> Colostro de qualidade (BRIX {">"}22%) fornecido nas primeiras
            2h é fundamental para a saúde do bezerro.
          </div>
        </div>

        <div style={estilos.footer}>
          <div>
            {bezerros.length > 1 && (
              <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                {bezerros.length} bezerros registrados
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={() => onClose?.()} className="botao-cancelar">
              Cancelar
            </button>
            <button onClick={salvar} className="botao-acao" disabled={!vacaSafe}>
              💾 Salvar Parto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
