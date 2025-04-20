import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuthStore, useModalStore } from "@/lib/stores";
import SparkModal from "@/components/modals/SparkModal";
import ResonateModal from "@/components/modals/ResonateModal";
import AddValueModal from "@/components/modals/AddValueModal";
import AddTaskModal from "@/components/modals/AddTaskModal";
import { Menu, X, User, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { calculateLevel } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuthStore();
  const { setSparkModalOpen } = useModalStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: totalXp } = useQuery({
    queryKey: ['xpTotal'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xp_ledger')
        .select('delta')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      return data.reduce((sum, item) => sum + item.delta, 0);
    },
    enabled: !!user?.id,
  });

  const level = totalXp ? calculateLevel(totalXp) : 1;
  const xpProgress = totalXp ? (totalXp % 100) / 100 : 0;
  const currentLevelXp = totalXp ? totalXp % 100 : 0;

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: "dashboard" },
    { name: "Feed", path: "/feed", icon: "rss_feed" },
    { name: "Kanban", path: "/kanban", icon: "view_kanban" },
    { name: "Compass", path: "/compass", icon: "explore" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 h-16 flex items-center justify-between z-10 border-b border-slate-200">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-slate-500 hover:text-primary"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <h1 className="text-xl font-semibold text-primary tracking-wide">AETHER LITE</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setSparkModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full flex items-center shadow-md transition-all"
          >
            <span className="material-icons mr-1 text-sm">add</span>
            <span>Spark</span>
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-slate-700 hover:text-primary rounded-full">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="font-medium">{user?.user_metadata?.name || 'User'}</div>
                <div className="text-xs text-slate-500">{user?.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside 
          className={`w-64 bg-white border-r border-slate-200 shadow-sm fixed h-full left-0 top-16 transition-all z-10 md:translate-x-0 transform ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="p-4 flex flex-col h-full">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link 
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <a
                    className={`flex items-center px-4 py-2 rounded-md ${
                      location === item.path
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="material-icons mr-3 text-sm">{item.icon}</span>
                    {item.name}
                  </a>
                </Link>
              ))}
            </div>
            
            <div className="mt-auto pb-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium">Current Level</div>
                  <div className="text-sm font-bold text-primary">{level}</div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-1">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${xpProgress * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <div>{currentLevelXp} XP</div>
                  <div>100 XP</div>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 md:ml-64 pt-6 transition-all">
          {children}
        </main>
      </div>

      {/* Modals */}
      <SparkModal />
      <ResonateModal />
      <AddValueModal />
      <AddTaskModal />
    </div>
  );
}
