'use client';

import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { Play, Clock, AlertCircle, Users } from 'lucide-react';
import type { Agent } from '@/types';

interface AgentGridProps {
  agents: Agent[];
  onSelectAgent: (id: string) => void;
}

const statusConfig = {
  idle: { label: 'Idle', icon: Clock, color: 'text-gray-400', bg: 'bg-gray-500/10' },
  running: { label: 'Running', icon: Play, color: 'text-green-400', bg: 'bg-green-500/10' },
  error: { label: 'Error', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
};

function formatStorage(bytes: number): string {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} MB`;
  return `${bytes} B`;
}

export function AgentGrid({ agents, onSelectAgent }: AgentGridProps) {
  if (agents.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
        <Users className="w-12 h-12 mb-4 opacity-50" />
        <p>No agents found</p>
        <p className="text-sm">Agents will appear here when they connect</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4">
      {agents.map((agent) => {
        const status = statusConfig[agent.status as keyof typeof statusConfig] || statusConfig.idle;
        const StatusIcon = status.icon;

        return (
          <button
            key={agent.id}
            onClick={() => onSelectAgent(agent.id)}
            className="relative flex flex-col p-3 md:p-4 rounded-lg md:rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-gray-700 transition-all text-left"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2 md:mb-3">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <span className="text-xl md:text-2xl flex-shrink-0">{agent.emoji}</span>
                <div className="min-w-0">
                  <h3 className="font-medium text-white truncate">{agent.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{agent.role}</p>
                </div>
              </div>
              <div className={clsx('flex items-center gap-1 px-2 py-0.5 md:py-1 rounded-full text-xs flex-shrink-0', status.bg, status.color)}>
                <StatusIcon className="w-3 h-3" />
                <span className="hidden sm:inline">{status.label}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 md:gap-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Tasks</p>
                <p className="text-white font-medium">{agent.totalTasks}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Calls</p>
                <p className="text-white font-medium">{agent.totalCalls}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Tokens</p>
                <p className="text-white font-medium">{(agent.totalTokens / 1000).toFixed(1)}K</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Storage</p>
                <p className="text-white font-medium text-xs">{formatStorage(agent.storageSize)}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-800 flex items-center justify-between">
              <p className="text-xs text-gray-500 truncate">
                {agent.lastActive 
                  ? `${formatDistanceToNow(new Date(agent.lastActive), { addSuffix: true })}`
                  : 'Never active'
                }
              </p>
              {agent.errorCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle className="w-3 h-3" />
                  {agent.errorCount}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
