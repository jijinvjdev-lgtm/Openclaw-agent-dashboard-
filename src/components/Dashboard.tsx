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
import { 
  LayoutDashboard, 
  Users, 
  GitBranch, 
  MessageSquare, 
  Brain, 
  HardDrive, 
  Activity 
} from 'lucide-react';

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
      // Handle different event types
      switch (data.type) {
        case 'agent:update':
          useDashboardStore.getState().updateAgent(data.payload);
          break;
        case 'task:update':
          useDashboardStore.getState().updateTask(data.payload);
          break;
        // Add other handlers as needed
      }
    };

    return () => ws.close();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-950">
        {/* Header */}
        <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">
                Agent Control Center
              </h1>
              <p className="text-sm text-gray-400">
                Multi-Agent Dropshipping System
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-gray-400">Live</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
