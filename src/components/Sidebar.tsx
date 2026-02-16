'use client';

import { clsx } from 'clsx';
import { 
  LayoutDashboard, 
  Users, 
  GitBranch, 
  MessageSquare, 
  Brain, 
  HardDrive, 
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useDashboardStore } from '@/lib/store';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  GitBranch,
  MessageSquare,
  Brain,
  HardDrive,
  Activity,
};

export function Sidebar({ tabs, activeTab, onTabChange }: SidebarProps) {
  const { sidebarOpen, setSidebarOpen } = useDashboardStore();

  return (
    <aside
      className={clsx(
        'flex flex-col border-r border-gray-800 bg-gray-900 transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">DC</span>
        </div>
        {sidebarOpen && (
          <span className="font-semibold text-white">DropshipControl</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {tabs.map((tab) => {
          const Icon = iconMap[tab.icon.name] || LayoutDashboard;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                isActive
                  ? 'bg-violet-600/20 text-violet-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="text-sm font-medium">{tab.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-3 border-t border-gray-800 text-gray-400 hover:text-white transition-colors"
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-5 h-5 mx-auto" />
        ) : (
          <ChevronRight className="w-5 h-5 mx-auto" />
        )}
      </button>
    </aside>
  );
}
