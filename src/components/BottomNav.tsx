import React from 'react';
import { Home, CheckSquare, PlusCircle, Wallet, User } from 'lucide-react';

export type MobileTab = 'home' | 'tasks' | 'recharge' | 'assets' | 'profile';

interface BottomNavProps {
  currentTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  activePlansCount?: number;
  pendingTasksCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  activePlansCount = 0,
  pendingTasksCount = 0,
}) => {
  const tabs = [
    {
      id: 'home' as MobileTab,
      label: 'Accueil',
      icon: Home,
    },
    {
      id: 'tasks' as MobileTab,
      label: 'Tâches VIP',
      icon: CheckSquare,
      isPrimary: true,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: 'recharge' as MobileTab,
      label: 'Dépôt',
      icon: PlusCircle,
    },
    {
      id: 'assets' as MobileTab,
      label: 'Solde & Gains',
      icon: Wallet,
      badge: activePlansCount > 0 ? activePlansCount : undefined,
    },
    {
      id: 'profile' as MobileTab,
      label: 'Profil',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isPrimary) {
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className="flex flex-col items-center justify-center -mt-5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 group-active:scale-90 transition-transform border-2 border-slate-950">
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-extrabold text-amber-400 mt-1">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-amber-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-slate-950 text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-slate-950">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'font-bold text-amber-400' : 'font-medium text-slate-400'}`}>
                {tab.label}
              </span>

              {/* Active Tab Indicator Bar */}
              {isActive && (
                <div className="absolute -bottom-1.5 w-6 h-1 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
