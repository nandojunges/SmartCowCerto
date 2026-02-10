export const MODULOS_MENU = [
  { id: "inicio", label: "Início", icon: "🏠" },
  { id: "animais", label: "Animais", icon: "🐄" },
  { id: "bezerras", label: "Bezerras", icon: "🐮" },
  { id: "reproducao", label: "Reprodução", icon: "🧬" },
  { id: "leite", label: "Leite", icon: "🥛" },
  { id: "saude", label: "Saúde", icon: "💉" },
  { id: "consumo", label: "Consumo", icon: "📦" },
  { id: "financeiro", label: "Financeiro", icon: "💰" },
  { id: "calendario", label: "Calendário", icon: "📅" },
  { id: "ajustes", label: "Ajustes", icon: "⚙️" },
];

const MODULO_POR_PREFIXO = {
  inicio: "inicio",
  animais: "animais",
  bezerras: "bezerras",
  reproducao: "reproducao",
  leite: "leite",
  saude: "saude",
  consumo: "consumo",
  financeiro: "financeiro",
  calendario: "calendario",
  ajustes: "ajustes",
};

export function getModuloByPathname(pathname) {
  const segmento = String(pathname || "").split("/")[1] || "inicio";
  return MODULO_POR_PREFIXO[segmento] ?? null;
}
