import React, { useMemo, useState, useEffect } from "react";
import Select from "react-select";
import { supabase } from "../../lib/supabaseClient";
import { useFazenda } from "../../context/FazendaContext";

export default function RegistrarParto(props) {
  // ✅ Compatível com as duas assinaturas:
  // - nova:  { animal, onClose }
  // - antiga:{ vaca, onFechar }
  const animalProp = props.animal ?? props.vaca ?? null;
  const onClose = props.onClose ?? props.onFechar ?? (() => {});
  const fazendaIdProp = props.fazendaId ?? props.fazenda_id ?? null;
  const animalIdProp = props.animalId ?? props.animal_id ?? null;
  const iaIdProp = props.iaId ?? props.ia_id ?? null;
  const assumidoCadastro = props.assumidoCadastro === true;
  const semSecagem = props.semSecagem === true;
  const onRegistrarSecagemAntes = props.onRegistrarSecagemAntes;

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
  const [complicacoesSelecionadas, setComplicacoesSelecionadas] = useState([]);
  const [complicacoesCustom, setComplicacoesCustom] = useState([]);
  const [mostrarNovaComplicacao, setMostrarNovaComplicacao] = useState(false);
  const [novaComplicacao, setNovaComplicacao] = useState("");
  const [bezerros, setBezerros] = useState([]);
  const [erro, setErro] = useState("");
  const [mostrarAvisoSemSecagem, setMostrarAvisoSemSecagem] = useState(semSecagem);
  const { fazendaAtualId } = useFazenda();

  function criarBezerroVazio(numero) {
    return {
      numero,
      sexo: null,
      peso: "",
      natimorto: false,
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

  useEffect(() => {
    setMostrarAvisoSemSecagem(semSecagem);
  }, [semSecagem]);

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

  const converterDataParaISO = (valor) => {
    const [dia, mes, ano] = String(valor || "").split("/");
    if (!dia || !mes || !ano) return null;
    const diaNum = Number(dia);
    const mesNum = Number(mes);
    const anoNum = Number(ano);
    if (!diaNum || !mesNum || !anoNum) return null;
    return `${String(anoNum).padStart(4, "0")}-${String(mesNum).padStart(2, "0")}-${String(
      diaNum
    ).padStart(2, "0")}`;
  };

  const converterDataParaDate = (valor) => {
    if (!valor) return null;
    if (valor instanceof Date) {
      const dt = new Date(valor);
      if (Number.isNaN(dt.getTime())) return null;
      dt.setHours(0, 0, 0, 0);
      return dt;
    }
    const texto = String(valor || "").trim();
    if (!texto) return null;
    const iso = texto.includes("/") ? converterDataParaISO(texto) : texto;
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return null;
    dt.setHours(0, 0, 0, 0);
    return dt;
  };

  const formatarDateISO = (valor) => {
    const dt = converterDataParaDate(valor);
    if (!dt) return null;
    const ano = dt.getFullYear();
    const mes = String(dt.getMonth() + 1).padStart(2, "0");
    const dia = String(dt.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  };

  const formatarDataBR = (valor) => {
    const dt = converterDataParaDate(valor);
    if (!dt) return "";
    return dt.toLocaleDateString("pt-BR");
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

  const atualizarNatimorto = (index, valor) => {
    setBezerros((prev) => {
      const novos = [...prev];
      if (!novos[index]) return prev;
      const natimorto = valor === true;
      const colostragemLimpa = {
        recebeu: null,
        hora: "",
        volume: "",
      };
      novos[index] = {
        ...novos[index],
        natimorto,
        peso: natimorto ? "" : novos[index].peso,
        sexo: natimorto ? null : novos[index].sexo,
        vitalidade: natimorto ? null : novos[index].vitalidade,
        colostragem: natimorto ? colostragemLimpa : novos[index].colostragem,
      };
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
      if (b?.natimorto) continue;
      if (!b?.sexo || !b?.vitalidade) {
        setErro(`Preencha sexo e vitalidade do bezerro ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const salvarLocalStorage = () => {
    const animais = JSON.parse(localStorage.getItem("animais") || "[]");
    const bezerrosExistentes = JSON.parse(localStorage.getItem("bezerros") || "[]");

    const alvoNumero = String(vacaSafe.numero);
    const indexMae = animais.findIndex((a) => String(a?.numero) === alvoNumero);

    if (indexMae === -1) {
      setErro("Não encontrei essa vaca no armazenamento local (localStorage).");
      return;
    }

    const meta = {};
    if (iaIdProp) {
      meta.ia_base_id = iaIdProp;
    }
    if (assumidoCadastro) {
      meta.assumido = true;
      meta.motivo_assuncao = "cadastro_animal_sem_dg";
      if (iaIdProp) {
        meta.ia_base_id = iaIdProp;
      }
    }

    const dadosParto = {
      animal_id: animalIdProp ?? vacaSafe?.id ?? vacaSafe?.animal_id ?? null,
      fazenda_id: fazendaIdProp ?? null,
      data: dataParto,
      hora: horaParto,
      facilidade: facilidade.value,
      assistencia: assistencia?.value || "Não necessária",
      colostroBrix,
      temperatura,
      numeroBezerros: bezerros.length,
      observacoes: observacoesMae,
      posPartoEventos: complicacoesSelecionadas.map((item) => item.value),
      ...(Object.keys(meta).length > 0 ? { meta } : {}),
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

    const novosBezerros = bezerros.filter((b) => !b?.natimorto).map((b) => {
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

  const salvar = async () => {
    if (!validarFormulario()) return;

    const dataISO = converterDataParaISO(dataParto);
    if (!dataISO) {
      setErro("Data do parto inválida. Use o formato dd/mm/aaaa.");
      return;
    }

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      salvarLocalStorage();
      return;
    }

    const resolvedFazendaId = fazendaIdProp ?? fazendaAtualId ?? vacaSafe?.fazenda_id ?? null;
    if (!resolvedFazendaId) {
      setErro("Não foi possível identificar a fazenda para registrar o parto.");
      return;
    }

    const animalId = animalIdProp ?? vacaSafe?.id ?? vacaSafe?.animal_id ?? null;
    if (!animalId) {
      setErro("Não foi possível identificar a vaca para registrar o parto.");
      return;
    }

    const logSupabaseError = (error, contexto) => {
      if (!error) return;
      console.error(`Erro Supabase (${contexto}):`, {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        status: error.status,
      });
    };

    const normalizarSexoBezerro = (valor) => {
      if (valor === null || valor === undefined) return null;
      const texto = String(valor).trim();
      if (!texto) return null;
      const semAcento = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const minusculo = semAcento.toLowerCase();
      if (minusculo === "femea" || minusculo === "f") return "femea";
      if (minusculo === "macho" || minusculo === "m") return "macho";
      return null;
    };

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        throw authError;
      }

      const userId = authData?.user?.id ?? null;
      if (!userId) {
        setErro("Sessão expirada. Faça login novamente.");
        return;
      }

      const metaParto = {
        origem: "manejos_pendentes",
        input_br: dataParto,
        bezerros_qtd: bezerros.length,
        modo: assumidoCadastro ? "historico" : "operacional",
        sem_secagem: semSecagem || false,
      };

      const { data: partoData, error: partoError } = await supabase
        .from("repro_eventos")
        .insert([
          {
            fazenda_id: resolvedFazendaId,
            animal_id: animalId,
            tipo: "PARTO",
            data_evento: dataISO,
            user_id: userId,
            meta: metaParto,
          },
        ])
        .select("id")
        .maybeSingle();

      if (partoError) {
        throw partoError;
      }

      const previsaoPartoRaw =
        vacaSafe?.data_prev_parto ??
        vacaSafe?.previsao_parto ??
        vacaSafe?.dataPrevParto ??
        vacaSafe?.data_prevista_parto ??
        vacaSafe?.previsaoParto ??
        null;
      const previsaoPartoISO = formatarDateISO(previsaoPartoRaw);
      const previsaoPartoDate = converterDataParaDate(previsaoPartoRaw);
      const dataPartoDate = converterDataParaDate(dataISO);
      const desvioDiasParto =
        previsaoPartoDate && dataPartoDate
          ? Math.round(
              (dataPartoDate.getTime() - previsaoPartoDate.getTime()) / (1000 * 60 * 60 * 24)
            )
          : null;

      const bezerroPrincipal = bezerros.find((b) => !b?.natimorto) ?? bezerros[0] ?? null;
      const statusBezerro = bezerroPrincipal && !bezerroPrincipal?.natimorto ? "Vivo" : "Natimorto";
      const sexoBezerro =
        statusBezerro === "Vivo" && bezerroPrincipal?.sexo?.value
          ? bezerroPrincipal.sexo.value
          : null;
      const tipoParto = facilidade?.value === "Sem assistência" ? "Normal" : "Distócico";
      const teveAuxilio = assistencia?.value ? assistencia.value !== "Não necessária" : false;

      const colostroTextoAtual = String(colostroBrix ?? "").trim();
      const colostroNumero =
        colostroTextoAtual === "" ? null : Number(colostroTextoAtual.replace(",", "."));
      const colostroValidoAtual = Number.isFinite(colostroNumero);
      const colostroAdequadoAtual = colostroValidoAtual ? colostroNumero >= 22 : null;

      const { error: reproPartoError } = await supabase.from("repro_partos").insert([
        {
          fazenda_id: resolvedFazendaId,
          animal_id: animalId,
          parto_evento_id: partoData?.id,
          user_id: userId,
          data_parto: dataISO,
          previsao_parto: previsaoPartoISO,
          desvio_dias: desvioDiasParto,
          tipo_parto: tipoParto,
          teve_auxilio: teveAuxilio,
          status_bezerro: statusBezerro,
          sexo_bezerro: sexoBezerro,
          colostro_brix: colostroValidoAtual ? colostroNumero : null,
          colostro_adequado: colostroAdequadoAtual,
          extras: null,
        },
      ]);

      if (reproPartoError) {
        console.warn(
          "Aviso: repro_eventos inserido, mas repro_partos falhou (evento órfão).",
          {
            fazenda_id: resolvedFazendaId,
            user_id: userId,
            parto_evento_id: partoData?.id ?? null,
          },
          reproPartoError
        );
        const partoEventoId = partoData?.id ?? null;
        if (partoEventoId) {
          const { error: rollbackError } = await supabase
            .from("repro_eventos")
            .delete()
            .eq("id", partoEventoId);
          if (rollbackError) {
            console.error("Falha ao remover repro_eventos após erro em repro_partos.", {
              fazenda_id: resolvedFazendaId,
              user_id: userId,
              parto_evento_id: partoEventoId,
            });
          }
        } else {
          console.warn("Parto_evento_id ausente; rollback não executado.");
        }
        setErro("Permissão do banco bloqueou repro_partos; nada foi salvo");
        return;
      }

      if (complicacoesSelecionadas.length > 0) {
        const itensComplicacoes = complicacoesSelecionadas.map((item) => item.value);
        const { error: posPartoError } = await supabase.from("pos_parto_eventos").insert([
          {
            fazenda_id: resolvedFazendaId,
            animal_id: animalId,
            parto_evento_id: partoData?.id,
            data_evento: dataISO,
            itens: itensComplicacoes,
            observacao: null,
            user_id: userId,
          },
        ]);
        if (posPartoError) {
          throw posPartoError;
        }
      }

      const bezerrosVivos = bezerros.filter((bezerro) => !bezerro?.natimorto);

      let bezerrosPayload = [];
      if (statusBezerro === "Vivo" && bezerrosVivos.length > 0) {
        const sexosNormalizados = bezerrosVivos.map((bezerro) =>
          normalizarSexoBezerro(bezerro?.sexo?.value ?? bezerro?.sexo)
        );
        if (sexosNormalizados.some((sexo) => !sexo)) {
          setErro("Selecione o sexo do bezerro (Macho ou Fêmea)");
          return;
        }

        const { data: maxData, error: maxError } = await supabase
          .from("animais")
          .select("numero")
          .eq("fazenda_id", resolvedFazendaId)
          .order("numero", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (maxError) {
          throw maxError;
        }

        let proximoNumero = (Number(maxData?.numero) || 0) + 1;

        bezerrosPayload = bezerrosVivos.map((bezerro, index) => {
          const numero = proximoNumero++;
          return {
            fazenda_id: resolvedFazendaId,
            user_id: userId,
            numero,
            brinco: `TEMP-${numero}`,
            nascimento: dataISO,
            sexo: sexosNormalizados[index],
            origem: "propriedade",
            mae_nome: numeroVaca ? `Mãe ${numeroVaca}` : null,
          };
        });

        if (bezerrosPayload.length > 0) {
          const bezerrosCriados = [];
          for (const payload of bezerrosPayload) {
            const { data: bezerroData, error: bezerrosError } = await supabase
              .from("animais")
              .insert(payload)
              .select("id")
              .single();
            if (bezerrosError) {
              logSupabaseError(bezerrosError, "insert_animais");
              throw bezerrosError;
            }
            if (bezerroData) {
              bezerrosCriados.push(bezerroData);
            }
          }
          if (bezerrosCriados.length > 0) {
            bezerrosPayload = bezerrosCriados;
          }
        }
      }

      window.dispatchEvent(new Event("animaisAtualizados"));
      onClose?.();
      props.onSaved?.({ data: dataISO, bezerros: bezerrosPayload });
    } catch (error) {
      logSupabaseError(error, "salvar_parto");
      console.error("Erro ao salvar parto:", error);
      setErro("Não foi possível salvar o parto agora. Tente novamente.");
    }
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
    avisoSemSecagem: {
      background: "#fef3c7",
      color: "#92400e",
      border: "1px solid #fcd34d",
      padding: "0.9rem",
      borderRadius: "0.6rem",
      marginBottom: "1rem",
      fontSize: "0.9rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
    },
    avisoSemSecagemAcoes: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.75rem",
    },
    avisoSemSecagemBtnSecagem: {
      background: "#2563eb",
      color: "#fff",
      border: "none",
      borderRadius: "0.45rem",
      padding: "0.5rem 0.85rem",
      fontSize: "0.85rem",
      fontWeight: 600,
      cursor: "pointer",
    },
    avisoSemSecagemBtnContinuar: {
      background: "#fff",
      color: "#92400e",
      border: "1px solid #fcd34d",
      borderRadius: "0.45rem",
      padding: "0.5rem 0.85rem",
      fontSize: "0.85rem",
      fontWeight: 600,
      cursor: "pointer",
    },
    badgeColostro: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.35rem",
      padding: "0.35rem 0.6rem",
      borderRadius: "999px",
      fontSize: "0.75rem",
      fontWeight: 600,
      marginTop: "0.4rem",
    },
    miniBox: {
      marginTop: "0.6rem",
      background: "#f9fafb",
      border: "1px solid #e5e7eb",
      borderRadius: "0.6rem",
      padding: "0.6rem 0.8rem",
      fontSize: "0.85rem",
      color: "#374151",
      display: "flex",
      flexDirection: "column",
      gap: "0.35rem",
    },
    avisoNatimorto: {
      background: "#fef2f2",
      border: "1px dashed #fca5a5",
      color: "#991b1b",
      padding: "0.6rem 0.75rem",
      borderRadius: "0.6rem",
      fontSize: "0.85rem",
    },
    linhaComplicacao: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      flexWrap: "wrap",
    },
    inputCurto: {
      flex: "1 1 240px",
      padding: "0.55rem",
      borderRadius: "0.5rem",
      border: "1px solid #e5e7eb",
      fontSize: "0.85rem",
      fontFamily: "Poppins, sans-serif",
    },
    botaoSecundario: {
      background: "#fff",
      color: "#0f172a",
      border: "1px solid #cbd5f0",
      borderRadius: "0.5rem",
      padding: "0.55rem 0.9rem",
      fontSize: "0.85rem",
      cursor: "pointer",
      fontWeight: 500,
    },
    botaoConfirmar: {
      background: "#10b981",
      color: "#fff",
      border: "none",
      borderRadius: "0.5rem",
      padding: "0.55rem 0.9rem",
      fontSize: "0.85rem",
      cursor: "pointer",
      fontWeight: 600,
    },
  };

  const selectStyles = {
    control: (base, state) => {
      const { border, borderColor, ...baseStyles } = base;
      return {
        ...baseStyles,
      borderRadius: "0.5rem",
      border: state.isFocused ? "2px solid #10b981" : "2px solid #e5e7eb",
      boxShadow: "none",
      minHeight: "40px",
      fontSize: "0.9rem",
      "&:hover": {
        border: "2px solid #10b981",
      },
      };
    },
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

  const opcoesComplicacoesBase = [
    { value: "Retenção de placenta", label: "Retenção de placenta" },
    { value: "Hipocalcemia (febre do leite)", label: "Hipocalcemia (febre do leite)" },
    { value: "Cetose", label: "Cetose" },
    { value: "Torção uterina", label: "Torção uterina" },
    { value: "Cesárea", label: "Cesárea" },
    { value: "Aborto", label: "Aborto" },
    { value: "Parto prematuro", label: "Parto prematuro" },
    { value: "Indução de lactação", label: "Indução de lactação" },
  ];

  const opcoesComplicacoes = [
    ...opcoesComplicacoesBase,
    ...complicacoesCustom.map((nome) => ({ value: nome, label: nome })),
  ];

  const previsaoPartoRaw =
    vacaSafe?.data_prev_parto ??
    vacaSafe?.previsao_parto ??
    vacaSafe?.dataPrevParto ??
    vacaSafe?.data_prevista_parto ??
    vacaSafe?.previsaoParto ??
    null;
  const previsaoPartoDate = converterDataParaDate(previsaoPartoRaw);
  const previsaoPartoTexto = previsaoPartoDate ? formatarDataBR(previsaoPartoDate) : "";
  const dataPartoDate = converterDataParaDate(converterDataParaISO(dataParto));
  const desvioDias =
    previsaoPartoDate && dataPartoDate
      ? Math.round((dataPartoDate.getTime() - previsaoPartoDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;
  const textoDesvio =
    desvioDias === null
      ? ""
      : `${desvioDias > 0 ? `+${desvioDias}` : desvioDias} dias ${
          desvioDias > 0 ? "(atrasou)" : desvioDias < 0 ? "(adiantou)" : "(no prazo)"
        }`;
  const colostroTexto = String(colostroBrix ?? "");
  const colostroTrim = colostroTexto.trim();
  const colostroValor = colostroTrim === "" ? null : Number(colostroTrim.replace(",", "."));
  const colostroValido = Number.isFinite(colostroValor);

  return (
    <div
      style={estilos.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div style={estilos.modal}>
        <div style={estilos.header}>🐄 Registrar Parto - Vaca {numeroVaca}</div>

        <div style={estilos.corpo}>
          {mostrarAvisoSemSecagem && (
            <div style={estilos.avisoSemSecagem}>
              <div>Não encontramos secagem registrada para esta gestação. Deseja continuar?</div>
              <div style={estilos.avisoSemSecagemAcoes}>
                <button
                  type="button"
                  style={estilos.avisoSemSecagemBtnSecagem}
                  onClick={() => onRegistrarSecagemAntes?.()}
                >
                  Registrar secagem antes
                </button>
                <button
                  type="button"
                  style={estilos.avisoSemSecagemBtnContinuar}
                  onClick={() => setMostrarAvisoSemSecagem(false)}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}
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
                {(previsaoPartoTexto || textoDesvio) && (
                  <div style={estilos.miniBox}>
                    {previsaoPartoTexto && (
                      <div>
                        <strong>Previsão:</strong> {previsaoPartoTexto}
                      </div>
                    )}
                    {textoDesvio && (
                      <div>
                        <strong>Desvio:</strong> {textoDesvio}
                      </div>
                    )}
                  </div>
                )}
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
                {colostroTrim !== "" && colostroValido && (
                  <div
                    style={{
                      ...estilos.badgeColostro,
                      background: colostroValor < 22 ? "#fee2e2" : "#d1fae5",
                      color: colostroValor < 22 ? "#991b1b" : "#065f46",
                    }}
                  >
                    {colostroValor < 22 ? "Colostro baixo (<22)" : "Colostro adequado (≥22)"}
                  </div>
                )}
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
            <div style={estilos.tituloSecao}>🩺 Complicações pós-parto (opcional)</div>
            <div style={estilos.campo}>
              <label style={estilos.label}>Complicações</label>
              <Select
                options={opcoesComplicacoes}
                value={complicacoesSelecionadas}
                onChange={(valores) => setComplicacoesSelecionadas(valores || [])}
                styles={selectStyles}
                placeholder="Selecione..."
                isMulti
                closeMenuOnSelect={false}
                isDisabled={!vacaSafe}
              />
            </div>
            <div style={estilos.linhaComplicacao}>
              {!mostrarNovaComplicacao ? (
                <button
                  type="button"
                  style={estilos.botaoSecundario}
                  onClick={() => setMostrarNovaComplicacao(true)}
                  disabled={!vacaSafe}
                >
                  ➕ Adicionar outra
                </button>
              ) : (
                <>
                  <input
                    type="text"
                    value={novaComplicacao}
                    onChange={(e) => setNovaComplicacao(e.target.value)}
                    style={estilos.inputCurto}
                    placeholder="Ex: Deslocamento de abomaso"
                    disabled={!vacaSafe}
                  />
                  <button
                    type="button"
                    style={estilos.botaoConfirmar}
                    onClick={() => {
                      const nome = novaComplicacao.trim();
                      if (!nome) return;
                      const jaExiste = opcoesComplicacoes.some(
                        (item) => item.value.toLowerCase() === nome.toLowerCase()
                      );
                      if (!jaExiste) {
                        const novaOpcao = { value: nome, label: nome };
                        setComplicacoesCustom((prev) => [...prev, nome]);
                        setComplicacoesSelecionadas((prev) => [...prev, novaOpcao]);
                      } else {
                        const opcaoExistente = opcoesComplicacoes.find(
                          (item) => item.value.toLowerCase() === nome.toLowerCase()
                        );
                        if (opcaoExistente) {
                          setComplicacoesSelecionadas((prev) => {
                            const jaSelecionado = prev.some(
                              (item) => item.value === opcaoExistente.value
                            );
                            return jaSelecionado ? prev : [...prev, opcaoExistente];
                          });
                        }
                      }
                      setNovaComplicacao("");
                      setMostrarNovaComplicacao(false);
                    }}
                    disabled={!vacaSafe}
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    style={estilos.botaoSecundario}
                    onClick={() => {
                      setNovaComplicacao("");
                      setMostrarNovaComplicacao(false);
                    }}
                    disabled={!vacaSafe}
                  >
                    Cancelar
                  </button>
                </>
              )}
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
                      <label style={estilos.label}>Natimorto</label>
                      <Select
                        options={opcoesSimNao}
                        value={
                          bezerro.natimorto
                            ? opcoesSimNao.find((op) => op.value === "Sim")
                            : opcoesSimNao.find((op) => op.value === "Não")
                        }
                        onChange={(v) => atualizarNatimorto(index, v?.value === "Sim")}
                        styles={selectStyles}
                        placeholder="Selecione..."
                        isDisabled={!vacaSafe}
                      />
                      {bezerro.natimorto && (
                        <div style={estilos.avisoNatimorto}>
                          Não será criado animal no plantel para este bezerro.
                        </div>
                      )}
                    </div>

                    {!bezerro.natimorto && (
                      <>
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
                      </>
                    )}
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
