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
import { Menu, X, LayoutDashboard, Users, GitBranch, MessageSquare, Brain, HardDrive, Activity } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'agents', label: 'Agents', icon: Users },
  { id: 'workflows', label: 'Task Flows', icon: GitBranch },
  { id: 'communications', label: 'Communications', icon: MessageSquare },
  { id: 'models', label: 'Model Analytics', icon: Brain },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'health', label: 'System Health', icon: Activity },
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
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      const [statsRes, agentsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/agents'),
      ]);
      
      if (statsRes.ok) setStats(await statsRes.json());
      if (agentsRes.ok) setAgents(await agentsRes.json());
      
      if (!statsRes.ok || !agentsRes.ok) {
        setError('Failed to connect to database.');
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadData();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // WebSocket disabled - no socket server available
    // Real-time updates use polling instead
    return;
    // */
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="animate-pulse text-gray-400">Loading dashboard...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4">
          <div className="p-4 rounded-lg bg-red-900/20 border border-red-800 max-w-md mb-4">
            <p className="text-red-400 font-medium mb-2">Connection Error</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
          >
            Retry
          </button>
        </div>
      );
    }

    if (agents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4">
          <Users className="w-16 h-16 text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Agents Connected</h2>
          <p className="text-gray-400">Start your dropshipping agents to see them here</p>
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
      <Sidebar 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-30 border-b border-gray-800 bg-gray-900/95 backdrop-blute px-4 py-3 lg:px-6 lg:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
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

        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
