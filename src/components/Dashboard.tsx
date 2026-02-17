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
import { Menu, X, LayoutDashboard, Users, GitBranch, MessageSquare, Brain, HardDrive, Activity, Database } from 'lucide-react';

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
  const [seeding, setSeeding] = useState(false);

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

  const addSampleData = async () => {
    setSeeding(true);
    try {
      const sampleAgents = [
        { name: 'Trends Scout', role: 'Product Research', emoji: '🔍', status: 'running', skills: '["market-analysis","trend-detection"]', authorities: '["read-data"]', modelPrimary: 'minimax-portal/MiniMax-M2.5', totalTasks: 45, totalCalls: 123, totalTokens: 45000 },
        { name: 'Supplier Intel', role: 'Supplier Analysis', emoji: '📦', status: 'idle', skills: '["supplier-research"]', authorities: '["read-data"]', modelPrimary: 'minimax-portal/MiniMax-M2.5', totalTasks: 32, totalCalls: 89, totalTokens: 28000 },
        { name: 'Risk Model', role: 'Risk Assessment', emoji: '⚖️', status: 'running', skills: '["risk-analysis"]', authorities: '["read-data","write-reports"]', modelPrimary: 'minimax-portal/MiniMax-M2.5', modelFallback: 'minimax-portal/MiniMax-M2', totalTasks: 28, totalCalls: 67, totalTokens: 19000 },
        { name: 'Validator', role: 'Product Validation', emoji: '✅', status: 'idle', skills: '["validation"]', authorities: '["read-data"]', modelPrimary: 'minimax-portal/MiniMax-M2.5', totalTasks: 56, totalCalls: 145, totalTokens: 52000 },
        { name: 'Content Creator', role: 'Listing Content', emoji: '✍️', status: 'running', skills: '["content-writing"]', authorities: '["read-data","write-content"]', modelPrimary: 'minimax-portal/MiniMax-M2.5', totalTasks: 89, totalCalls: 234, totalTokens: 87000 },
      ];

      for (const agent of sampleAgents) {
        await fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(agent),
        });
      }

      await loadData();
    } catch (err) {
      console.error('Failed to add sample data:', err);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
          <Database className="w-16 h-16 text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Agents Yet</h2>
          <p className="text-gray-400 mb-6">Add sample agents to test the dashboard</p>
          <button
            onClick={addSampleData}
            disabled={seeding}
            className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Database className="w-5 h-5" />
            {seeding ? 'Adding Sample Data...' : 'Add Sample Data'}
          </button>
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
