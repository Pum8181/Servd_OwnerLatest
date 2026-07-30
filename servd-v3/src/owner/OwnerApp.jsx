import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { subscribeOrders } from "../lib/orders";
import { subscribeMenu } from "../lib/menu";
import Sidebar from "./components/Sidebar";
import OrdersPanel from "./components/OrdersPanel";
import KitchenPanel from "./components/KitchenPanel";
import SettingsPanel from "./components/SettingsPanel";
import AnalyticsPanel from "./components/AnalyticsPanel";
import StaffPanel from "./components/StaffPanel";
import QrCodesPanel from "./components/QrCodesPanel";
import StaffLoginOverlay from "./components/StaffLoginOverlay";
import { subscribeStaff } from "../lib/staff";
import { friendlyFirebaseError } from "../lib/errors";

const ACTIVE_STAFF_KEY = "servd_active_staff";

export default function OwnerApp() {
  const [tab, setTab] = useState("orders");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [activeStaff, setActiveStaff] = useState(() => {
    try {
      const raw = sessionStorage.getItem(ACTIVE_STAFF_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Same fix as the staff listener: surface a connection/permission
  // problem instead of leaving orders/menu silently stuck empty.
  useEffect(() => subscribeOrders(setOrders, (err) => setLoadError(friendlyFirebaseError(err, "load live orders"))), []);
  useEffect(() => subscribeMenu(setMenuItems, (err) => setLoadError(friendlyFirebaseError(err, "load the menu"))), []);

  // FIX (critical security bug, part 2): the login screen already
  // refuses to let a deleted/changed profile log IN (see
  // getStaffMemberById in StaffLoginOverlay). This half covers the
  // other gap — a session that was already active before the owner
  // deleted that person. Without this, sessionStorage alone kept them
  // signed in indefinitely (surviving reloads) with zero re-validation.
  // This subscribes to the live staff roster for as long as the
  // dashboard is open and force-logs-out the instant the active
  // person's profile disappears or their PIN changes underneath them.
  useEffect(() => {
    if (!activeStaff) return undefined;
    return subscribeStaff((staffList) => {
      const stillValid = staffList.some((s) => s.id === activeStaff.id && s.pin === activeStaff.pin);
      if (!stillValid) {
        setActiveStaff(null);
        sessionStorage.removeItem(ACTIVE_STAFF_KEY);
      }
    });
  }, [activeStaff]);

  const liveCount = orders.filter((o) => o.status === "pending" || o.status === "in_progress").length;

  function handleLogin(staff) {
    setActiveStaff(staff);
    sessionStorage.setItem(ACTIVE_STAFF_KEY, JSON.stringify(staff));
  }

  function handleLogout() {
    setActiveStaff(null);
    sessionStorage.removeItem(ACTIVE_STAFF_KEY);
  }

  // Locked behind a PIN pad until a staff member is identified — every
  // approval afterward gets tagged with this person's name (see
  // OrdersPanel → approveOrder(id, activeStaff.name)).
  if (!activeStaff) {
    return <StaffLoginOverlay onLogin={handleLogin} />;
  }

  return (
    <div className="o-shell">
      <Sidebar active={tab} onChange={setTab} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="o-main">
        <div className="o-topbar">
          <button type="button" className="o-menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="o-live-pill"><span className="o-live-dot" /> LIVE ORDERS · {liveCount}</span>
          <button type="button" className="o-avatar" onClick={handleLogout} title={`Logged in as ${activeStaff.name} — click to log out`}>
            {activeStaff.name.charAt(0).toUpperCase()}
          </button>
        </div>

        {loadError && <div className="o-error-banner">{loadError}</div>}

        {tab === "orders" && <h1 className="o-headline">Human Review = Fewer Mistakes</h1>}

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {tab === "orders" && <OrdersPanel orders={orders} activeStaff={activeStaff} />}
            {tab === "kitchen" && <KitchenPanel orders={orders} />}
            {tab === "staff" && <StaffPanel />}
            {tab === "analytics" && <AnalyticsPanel orders={orders} menuItems={menuItems} />}
            {tab === "settings" && <SettingsPanel menuItems={menuItems} />}
            {tab === "qrcodes" && <QrCodesPanel />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
