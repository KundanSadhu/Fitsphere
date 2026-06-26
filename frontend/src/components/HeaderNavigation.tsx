import { ChevronRight, Trophy, Menu, Sun, Moon } from 'lucide-react';
import { User } from '../types';
import { StreakDisplay } from './StreakDisplay';
import { GoogleFitIndicator } from './GoogleFitIndicator';

interface HeaderNavigationProps {
  activeTab: string;
  user: User;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function HeaderNavigation({ activeTab, user, isSidebarOpen, onToggleSidebar, isDarkMode, onToggleDarkMode }: HeaderNavigationProps) {
  // Human readable title
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard Console';
      case 'workout': return 'Workout Regime Splits';
      case 'nutrition': return 'Nutrition Macro-Synthesis';
      case 'progress': return 'Body Progression Matrix';
      case 'ai-coach': return 'AI Coach Chamber';
      case 'meditation': return 'Mind-Muscle Chamber';
      case 'competitions': return 'Challenges & Leaderboards';
      case 'shop': return 'Supplements & Gear Store';
      case 'settings': return 'Settings';
      default: return 'Core Workspace';
    }
  };

  return (
    <header 
      id="app-header-navigation" 
      className="h-16 bg-theme border-b-2 border-theme flex items-center justify-between px-6 z-30 shrink-0 select-none theme-transition"
    >
      {/* Navigation breadcrumbs */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onToggleSidebar}
          className="hidden lg:flex p-1.5 mr-2 rounded-lg bg-card border-2 border-theme text-theme hover:bg-primary hover:text-white transition-colors shadow-brutal-sm active:translate-y-0.5 active:shadow-none"
          title="Toggle Sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>
        <span className="bg-primary text-white px-2.5 py-1 rounded-md border-2 border-primary text-xs font-black uppercase tracking-wider leading-none">
          FitSphere
        </span>
        <ChevronRight className="w-4 h-4 text-theme-muted" />
        <span className="text-theme text-sm font-black capitalize leading-none font-mono">
          {getTabTitle(activeTab)}
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl border border-theme text-theme-muted hover:text-primary hover:border-primary transition-all cursor-pointer"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Google Fit Sync Connection Indicator Badge */}
        <GoogleFitIndicator />

        <div className="hidden sm:block w-0.5 h-6 bg-theme-muted/30" />

        {/* Streak progress display widget */}
        <div className="border-2 border-theme rounded-xl overflow-hidden shadow-brutal-sm">
          <StreakDisplay streak={user.streak} />
        </div>

        <div className="w-0.5 h-6 bg-theme-muted/30" />

        {/* Loyalty reward points count */}
        <div 
          id="loyalty-points-pill" 
          className="flex items-center gap-1.5 bg-primary text-white border-2 border-primary px-3.5 py-1 rounded-xl text-xs font-black font-mono shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
        >
          <Trophy className="w-3.5 h-3.5 fill-white" />
          <span>{user.points} PTS</span>
        </div>

        {/* Small avatar block for rapid validation */}
        <img
          src={user.photoUrl}
          alt={user.name}
          referrerPolicy="no-referrer"
          className="w-8 h-8 rounded-lg object-cover border-2 border-theme block lg:hidden"
        />
      </div>
    </header>
  );
}
