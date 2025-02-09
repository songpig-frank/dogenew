import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

const AdminLayout = () => {
  // TODO: Replace with actual auth check
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: FileText, label: "Submissions", href: "/admin/submissions" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="p-6">
          <h1 className="text-lg font-bold">Admin Panel</h1>
        </div>
        <nav className="space-y-2 p-4">
          {sidebarItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <a href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </a>
            </Button>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
