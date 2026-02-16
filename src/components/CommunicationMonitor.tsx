'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Filter, Search, MessageSquare } from 'lucide-react';
import type { Communication, Agent } from '@/types';

interface CommunicationMonitorProps {
  // Optional filters from parent
}

export function CommunicationMonitor({}: CommunicationMonitorProps) {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    agentId: '',
    taskId: '',
    status: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [commsRes, agentsRes] = await Promise.all([
          fetch('/api/communications?limit=100'),
          fetch('/api/agents'),
        ]);
        
        if (commsRes.ok) setCommunications(await commsRes.json());
        if (agentsRes.ok) setAgents(await agentsRes.json());
      } catch (error) {
        console.error('Failed to load communications:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredComms = communications.filter((comm) => {
    if (filters.agentId && comm.fromAgentId !== filters.agentId && comm.toAgentId !== filters.agentId) {
      return false;
    }
    if (filters.taskId && comm.taskId !== filters.taskId) {
      return false;
    }
    if (filters.status && comm.status !== filters.status) {
      return false;
    }
    if (searchQuery && !comm.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? `${agent.emoji} ${agent.name}` : agentId;
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Loading communications...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl border border-gray-800 bg-gray-900/50">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Filters:</span>
        </div>
        
        <select
          value={filters.agentId}
          onChange={(e) => setFilters({ ...filters, agentId: e.target.value })}
          className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300"
        >
          <option value="">All Agents</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.emoji} {agent.name}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300"
        >
          <option value="">All Statuses</option>
          <option value="sent">Sent</option>
          <option value="delivered">Delivered</option>
          <option value="failed">Failed</option>
        </select>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 placeholder-gray-500"
          />
        </div>

        <span className="text-sm text-gray-500">
          {filteredComms.length} messages
        </span>
      </div>

      {/* Communications List */}
      {filteredComms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
          <p>No communications found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredComms.map((comm) => (
            <div
              key={comm.id}
              className="p-4 rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-900 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{comm.fromAgent?.emoji}</span>
                  <div>
                    <p className="text-sm text-white font-medium">
                      {getAgentName(comm.fromAgentId)}
                    </p>
                    <p className="text-xs text-gray-500">
                      → {getAgentName(comm.toAgentId)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    comm.status === 'delivered' ? 'bg-green-600/20 text-green-400' :
                    comm.status === 'failed' ? 'bg-red-600/20 text-red-400' :
                    'bg-gray-600/20 text-gray-400'
                  }`}>
                    {comm.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(comm.timestamp), 'HH:mm:ss')}
                  </span>
                </div>
              </div>
              
              <p className="mt-3 text-sm text-gray-300 line-clamp-2">
                {comm.message}
              </p>

              {comm.taskId && (
                <div className="mt-2 text-xs text-gray-500">
                  Task: {comm.taskId}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
