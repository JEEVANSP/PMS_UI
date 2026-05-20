import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAppSelector } from "@app/store";
import Sidebar from "../Sidebar/Sidebar";
import TopNavBar from "../TopNavBar/TopNavBar";

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const user = useAppSelector((s) => s.auth.user);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <TopNavBar
        userName={user.username}
        userRole={user.role}
        avatar={user.avatarUrl}
      />

      {/* Sidebar */}
      <Sidebar
        user={{
          id: user.id,
          username: user.username,
          role: user.role,
          avatarUrl: user.avatarUrl,
        }}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content area shifted for navbar + sidebar */}
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarCollapsed ? "pl-16" : "pl-64"
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
