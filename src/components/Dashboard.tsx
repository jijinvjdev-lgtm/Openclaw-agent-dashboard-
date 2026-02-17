'use client';

import { useEffect, useState } from 'react';
import { useDashboardStore } from '@/lib/store';
import { AgentGrid } from '@/components/AgentGrid';
import { AgentProfile } from '@/components/AgentProfile';
import { TaskFlow } from '@/components/TaskFlow';
import { CommunicationMonitor } from '@/components/CommunicationMonitor';
import { ModelAnalytics } from '@/components/ModelAnalytics';
import { StoragePanel } from '@/components/StoragePanel';
import { SystemHealth } from '@/components/SystemHealth';
import { StatsBar } from '@/components/StatsBar';
import { Sidebar } from '@/components/Sidebar';
import { Menu, X } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
  { id: 'agents', label: 'Agents', icon: 'Users' },
  { id: 'workflows', label: 'Task Flows', icon: 'GitBranch' },
  { id: 'communications', label: 'Communications', icon: 'MessageSquare' },
  { id: 'models', label: 'Model Analytics', icon: 'Brain' },
  { id: 'storage', label: 'Storage', icon: 'HardDrive' },
  { id: 'health', label: 'System Health', icon: 'Activity' },
];

export function Dashboard() {
  const { 
    activeTab, 
    setActiveTab, 
    selectedAgentId, 
    setSelectedAgentId,
    stats,
    setStats,
    agents,
    setAgents,
    sidebarOpen,
    setSidebarOpen,
  } = useDashboardStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [statsRes, agentsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/agents'),
        ]);
        
        if (statsRes.ok) setStats(await statsRes.json());
        if (agentsRes.ok) setAgents(await agentsRes.json());
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [setStats, setAgents]);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/socket`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'agent:update':
          useDashboardStore.getState().updateAgent(data.payload);
          break;
        case 'task:update':
          useDashboardStore.getState().updateTask(data.payload);
          break;
      }
    };

    return () => ws.close();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="animate-pulse text-gray-400">Loading dashboard...</div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <StatsBar stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AgentGrid agents={agents} onSelectAgent={setSelectedAgentId} />
              <SystemHealth />
            </div>
          </div>
        );
      case 'agents':
        return (
          selectedAgentId ? (
            <AgentProfile agentId={selectedAgentId} onBack={() => setSelectedAgentId(null)} />
          ) : (
            <AgentGrid agents={agents} onSelectAgent={setSelectedAgentId} />
          )
        );
      case 'workflows':
        return <TaskFlow />;
      case 'communications':
        return <CommunicationMonitor />;
      case 'models':
        return <ModelAnalytics />;
      case 'storage':
        return <StoragePanel />;
      case 'health':
        return <SystemHealth />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen lg:h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-gray-800 bg-gray-900/95 backdrop-blute px-4 py-3 lg:px-6 lg:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <div>
                <h1 className="text-lg lg:text-xl font-semibold text-white">
                  Agent Control Center
                </h1>
                <p className="text-xs lg:text-sm text-gray-400 hidden sm:block">
                  Multi-Agent Dropshipping System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-gray-400 hidden sm:inline">Live</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content - Scrollable */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
