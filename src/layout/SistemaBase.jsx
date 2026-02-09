import { useEffect, useMemo, useReducer, useRef } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import NavegacaoPrincipal from "./NavegacaoPrincipal";

function KeepAliveOutlet({ max = 12 }) {
  const location = useLocation();
  const outlet = useOutlet();

  const key = location.pathname;

  const cacheRef = useRef(new Map()); // pathname -> element
  const orderRef = useRef([]); // LRU
  const [, bump] = useReducer((x) => x + 1, 0);

  // ✅ entries SEMPRE inclui a rota atual (mesmo antes de entrar no cache)
  const entries = useMemo(() => {
    const cache = cacheRef.current;
    const arr = Array.from(cache.entries());

    const hasCurrent = cache.has(key);
    if (!hasCurrent && outlet) {
      // mostra a página atual imediatamente (evita tela branca)
      arr.push([key, outlet]);
    }
    return arr;
  }, [key, outlet]);

  useEffect(() => {
    if (!outlet) return;

    const cache = cacheRef.current;
    const order = orderRef.current;

    const existed = cache.has(key);
    if (!existed) {
      cache.set(key, outlet);
      order.push(key);

      // LRU
      while (order.length > max) {
        const oldest = order.shift();
        if (oldest && oldest !== key) cache.delete(oldest);
      }

      // ✅ força re-render após inserir no cache
      bump();
      return;
    }

    // atualiza referência do elemento atual (caso o outlet mude)
    cache.set(key, outlet);

    const idx = order.indexOf(key);
    if (idx >= 0) {
      order.splice(idx, 1);
      order.push(key);
    }

    // ✅ garante re-render quando atualiza o cache do atual
    bump();
  }, [key, outlet, max]);

  return (
    <>
      {entries.map(([path, element]) => (
        <div
          key={path}
          style={{ display: path === key ? "block" : "none" }}
          aria-hidden={path !== key}
        >
          {element}
        </div>
      ))}
    </>
  );
}

export default function SistemaBase({ tipoConta }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f3f4f6",
        fontFamily: "'Inter', 'Poppins', sans-serif",
      }}
    >
      <header
        style={{
          width: "100%",
          backgroundColor: "#1c3586",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          zIndex: 10,
        }}
      >
        <NavegacaoPrincipal tipoConta={tipoConta} />
      </header>

      <main
        style={{
          flex: 1,
          width: "100%",
          overflowY: "auto",
          backgroundColor: "#f9fafb",
        }}
      >
        <div
          style={{
            width: "100%",
            padding: "16px 16px 32px 16px",
            boxSizing: "border-box",
          }}
        >
          <KeepAliveOutlet max={12} />
        </div>
      </main>
    </div>
  );
}
