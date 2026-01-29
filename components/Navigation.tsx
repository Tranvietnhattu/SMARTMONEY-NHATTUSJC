
import React from 'react';
import { LayoutDashboard, Calendar, Plus, ChartBar, Settings2 } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', icon: <LayoutDashboard size={18} />, label: 'Home' },
    { id: 'calendar', icon: <Calendar size={18} />, label: 'Lịch' },
    { id: 'add', icon: null, label: '' }, 
    { id: 'ai', icon: <ChartBar size={18} />, label: 'AI' },
    { id: 'settings', icon: <Settings2 size={18} />, label: 'Menu' },
  ];

  const getIndicatorIndex = () => tabs.findIndex(t => t.id === activeTab);

  return (
    <nav className="bg-white/95 backdrop-blur-md border-t border-slate-100 px-2 h-16 flex items-center justify-around shadow-lg rounded-t-2xl relative safe-bottom">
      {/* Indicator */}
      <div 
        className="absolute top-0 h-0.5 w-6 bg-indigo-600 rounded-full transition-all duration-300 ease-[--motion-ease]"
        style={{ 
          left: `calc(${(getIndicatorIndex() * 20) + 10}% - 12px)`,
          opacity: activeTab === 'add' ? 0 : 1
        }}
      />

      {tabs.map((tab) => {
        if (tab.id === 'add') {
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange('add')}
              className="relative -top-4 flex items-center justify-center w-12 h-12 bg-slate-900 rounded-2xl shadow-xl text-white active:scale-90 transition-transform"
            >
              <Plus size={24} />
            </button>
          );
        }

        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors ${
              isActive ? 'text-indigo-600' : 'text-slate-400'
            }`}
          >
            <div className={`transition-transform duration-300 ${isActive ? 'translate-y-[-2px]' : ''}`}>
              {tab.icon}
            </div>
            <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
