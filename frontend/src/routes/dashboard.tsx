import { createFileRoute, Outlet, Navigate, Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "../contexts/AuthContext";
import { LayoutDashboard, UserCircle, LogOut } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { user, profile, isLoading, signOut } = useAuth();
  const router = useRouter();

  if (isLoading) return <div className="p-8 text-center text-zinc-300">Loading Dashboard...</div>;
  if (!user) return <Navigate to="/login" />;

  const handleSignOut = async () => {
    await signOut();
    router.navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <div className="w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Leader Sphere
          </h2>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">Dashboard</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors [&.active]:bg-blue-600/10 [&.active]:text-blue-400"
          >
            <LayoutDashboard size={18} />
            Overview
          </Link>
          <Link
            to="/dashboard/portfolio"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors [&.active]:bg-blue-600/10 [&.active]:text-blue-400"
          >
            <LayoutDashboard size={18} />
            Portfolio Builder
          </Link>
          <Link
            to="/dashboard/account"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors [&.active]:bg-blue-600/10 [&.active]:text-blue-400"
          >
            <UserCircle size={18} />
            Account
          </Link>
          {profile?.role === "SUPER_ADMIN" && (
            <Link
              to="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-500 hover:bg-zinc-800 transition-colors"
            >
              System Admin
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="truncate font-medium text-zinc-200">{user.email}</p>
              <p className="text-xs text-zinc-500">{profile?.role || "CLIENT"}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-950/30 rounded-md transition-colors"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
