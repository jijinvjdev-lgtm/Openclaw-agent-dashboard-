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
  ChevronRight,
  Menu,
  X
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

export function Sidebar({ tabs, activeTab, onTabChange }: SidebarProps) {
  const { sidebarOpen, setSidebarOpen } = useDashboardStore();

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:relative z-50 flex flex-col border-r border-gray-800 bg-gray-900 transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-0 lg:w-16',
          'h-full -translate-x-full lg:translate-x-0',
          sidebarOpen && 'translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">DC</span>
          </div>
          {sidebarOpen && (
            <span className="font-semibold text-white truncate">DropshipControl</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                  isActive
                    ? 'bg-violet-600/20 text-violet-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="text-sm font-medium truncate">{tab.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse Toggle - Desktop only */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex p-3 border-t border-gray-800 text-gray-400 hover:text-white transition-colors justify-center"
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
      </aside>

      {/* Mobile Toggle Button - Always visible on mobile when sidebar closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 lg:hidden p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
