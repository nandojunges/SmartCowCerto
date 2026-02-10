import { useState } from "react";
import { Outlet } from "react-router-dom";
import MobileDrawerNav from "../layout/MobileDrawerNav";
import TopBarMobile from "../layout/TopBarMobile";

export default function MobileShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb", color: "#0f172a" }}>
      <TopBarMobile onOpenMenu={() => setDrawerOpen(true)} title="SmartCow" />
      <MobileDrawerNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <main style={{ padding: "70px 14px 18px", maxWidth: 720, margin: "0 auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
