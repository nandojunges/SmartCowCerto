import { Outlet } from "react-router-dom";
import BottomNav from "../layout/BottomNav";
import TopBarMobile from "../layout/TopBarMobile";

export default function MobileShell() {
  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb", color: "#0f172a" }}>
      <TopBarMobile />
      <main style={{ padding: "14px 14px 90px" }}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
