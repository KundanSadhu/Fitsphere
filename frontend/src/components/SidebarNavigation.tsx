import { 
  LayoutDashboard, Dumbbell, Apple, TrendingUp, Bot, 
  Medal, Trophy, ShoppingBag, Settings, LogOut, Sun, Moon
} from 'lucide-react';
import { User } from '../types';

interface SidebarNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  onLogout: () => void;
  isOpen?: boolean;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function SidebarNavigation({ activeTab, setActiveTab, user, onLogout, isOpen = true, isDarkMode, onToggleDarkMode }: SidebarNavigationProps) {
  const mainSidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'workout', icon: Dumbbell, label: 'Workout Splits' },
    { id: 'nutrition', icon: Apple, label: 'Nutrition & Meals' },
    { id: 'progress', icon: TrendingUp, label: 'Progress Matrix' },
    { id: 'meditation', icon: Medal, label: 'Meditation Zone' },
    { id: 'competitions', icon: Trophy, label: 'Client Challenges' },
    { id: 'shop', icon: SupplementsShop, label: 'Recommended Products' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  function SupplementsShop(props: any) {
    return <ShoppingBag {...props} />;
  }

  if (!isOpen) return null;

  return (
    <aside 
      id="app-sidebar-navigation" 
      className="w-64 bg-theme text-theme border-r-2 border-theme flex flex-col justify-between shrink-0 hidden lg:flex select-none theme-transition"
    >
      <div>
        {/* Brand visual header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b-2 border-theme bg-theme">
          <div className="w-8 h-8 rounded-lg bg-primary border border-primary flex items-center justify-center text-white font-black text-xs font-mono select-none shadow-[2px_2px_0px_var(--color-secondary)]">
            FΩ
          </div>
          <span className="font-extrabold text-theme text-lg tracking-tight leading-tight select-none">
            FitSphere <span className="bg-primary text-white px-1.5 py-0.5 rounded-md border border-primary text-xs font-black">AI</span>
          </span>
        </div>

        {/* User profile section */}
        <div className="p-5 border-b-2 border-theme bg-theme-secondary/30">
          <div className="flex items-center gap-3">
            <img
              src={user.photoUrl}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-cover border-2 border-theme shadow-brutal-sm"
            />
            <div className="min-w-0">
              <p className="text-xs font-black text-theme truncate leading-tight">{user.name}</p>
              <span className="bg-primary text-white px-1 py-0.2 rounded-md border border-primary text-[8px] font-black uppercase font-mono tracking-wider mt-1 inline-block">
                Level {user.level} Coach
              </span>
            </div>
          </div>

          {/* XP level slider */}
          <div className="mt-4">
            <div className="flex justify-between text-[8px] font-extrabold text-theme-muted font-mono mb-1">
              <span>XP: {user.xp} / {user.targetXp}</span>
              <span>Level {user.level}</span>
            </div>
            <div className="w-full h-2.5 bg-theme-secondary border-2 border-theme rounded-full overflow-hidden relative">
              <div
                className="h-full bg-primary border-r-2 border-theme transition-all duration-300"
                style={{ width: `${Math.min(100, (user.xp / user.targetXp) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dedicated Chatbot Assistant block */}
        <div className="px-3 pt-4">
          <button
            id="sidebar-item-ai-coach"
            onClick={() => setActiveTab('ai-coach')}
            className={`w-full flex flex-col justify-start text-left gap-2 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
              activeTab === 'ai-coach'
                ? 'bg-primary border-primary text-white shadow-[3px_3px_0px_var(--color-secondary)]'
                : 'bg-card border-theme hover:bg-theme-secondary text-theme shadow-brutal'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg border-2 ${activeTab === 'ai-coach' ? 'bg-white text-primary border-white' : 'bg-card text-theme border-theme'}`}>
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                 <p className={`text-[11px] font-black ${activeTab === 'ai-coach' ? 'text-white' : 'text-theme'}`}>Client Management Dashboard</p>
                 <span className={`text-[8.5px] font-mono px-1 rounded-sm ${activeTab === 'ai-coach' ? 'bg-white/20 text-white' : 'bg-primary text-white'}`}>🤖 ACTIVE ONLINE</span>
              </div>
            </div>
            <p className={`text-[10px] font-semibold leading-relaxed ${activeTab === 'ai-coach' ? 'text-white/80' : 'text-theme-muted'}`}>
              Manage client profiles, track progress & communicate.
            </p>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-320px)]">
          {mainSidebarItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-brutal-sm font-black'
                    : 'text-theme-muted bg-card border-transparent hover:border-theme hover:text-theme'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="p-4 border-t-2 border-theme bg-theme space-y-2">
        <button
          onClick={onToggleDarkMode}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border-2 border-theme text-theme-muted hover:text-primary hover:border-primary text-xs font-extrabold cursor-pointer transition-all active:scale-95"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button
          onClick={onLogout}
          id="btn-sidebar-logout"
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border-2 border-rose-600 hover:bg-rose-600/10 text-rose-600 text-xs font-extrabold cursor-pointer transition-all active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out System</span>
        </button>
      </div>
    </aside>
  );
}
