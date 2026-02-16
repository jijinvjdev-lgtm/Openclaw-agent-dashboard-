'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { HardDrive, Trash2, Download, Archive, Folder } from 'lucide-react';
import type { Agent, MemoryLog } from '@/types';

export function StoragePanel() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgents() {
      try {
        const res = await fetch('/api/agents');
        if (res.ok) setAgents(await res.json());
      } catch (error) {
        console.error('Failed to load agents:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAgents();
  }, []);

  const handleCleanLogs = async (agentId: string) => {
    if (confirm('Clean all logs for this agent?')) {
      await fetch(`/api/agents/${agentId}/clean-logs`, { method: 'POST' });
    }
  };

  const handleExportMemory = async (agentId: string) => {
    const res = await fetch(`/api/agents/${agentId}/memory`);
    if (res.ok) {
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agent-${agentId}-memory.json`;
      a.click();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} MB`;
    return `${bytes} B`;
  };

  const totalStorage = agents.reduce((sum, a) => sum + a.storageSize, 0);

  if (loading) {
    return <div className="p-8 text-gray-400">Loading storage data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-gray-900/50">
        <div className="flex items-center gap-3">
          <HardDrive className="w-5 h-5 text-cyan-400" />
          <div>
            <p className="text-sm text-gray-400">Total Storage Used</p>
            <p className="text-xl font-bold text-white">{formatSize(totalStorage)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">{agents.length} Agents</p>
          <p className="text-sm text-gray-500">
            Last cleanup: Never (not implemented)
          </p>
        </div>
      </div>

      {/* Agent Storage List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="p-4 rounded-xl border border-gray-800 bg-gray-900/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">{agent.emoji}</span>
              <div>
                <h4 className="font-medium text-white">{agent.name}</h4>
                <p className="text-xs text-gray-500">{agent.role}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Workspace</span>
                <span className="text-white">{formatSize(agent.storageSize)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Memory Files</span>
                <span className="text-white">-</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Log Size</span>
                <span className="text-white">-</span>
              </div>
            </div>

            {/* Storage Bar */}
            <div className="h-2 rounded-full bg-gray-800 mb-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full"
                style={{ width: `${Math.min((agent.storageSize / (100 * 1024 * 1024)) * 100, 100)}%` }}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCleanLogs(agent.id)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 text-xs transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clean
              </button>
              <button
                onClick={() => handleExportMemory(agent.id)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 text-xs transition-colors"
              >
                <Download className="w-3 h-3" />
                Export
              </button>
            </div>
          </div>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Folder className="w-12 h-12 mb-4 opacity-50" />
          <p>No agents found</p>
        </div>
      )}
    </div>
  );
}
