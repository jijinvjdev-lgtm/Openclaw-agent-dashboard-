'use client';

import { clsx } from 'clsx';
import { 
  Users, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Cpu,
  Zap,
  TrendingUp
} from 'lucide-react';
import type { DashboardStats } from '@/types';

interface StatsBarProps {
  stats: DashboardStats;
}

const statConfig = [
  { key: 'totalAgents', label: 'Total Agents', icon: Users, color: 'violet' },
  { key: 'activeAgents', label: 'Active', icon: Play, color: 'green' },
  { key: 'idleAgents', label: 'Idle', icon: Clock, color: 'gray' },
  { key: 'errorAgents', label: 'Errors', icon: XCircle, color: 'red' },
  { key: 'activeTasks', label: 'Active Tasks', icon: Zap, color: 'amber' },
  { key: 'completedTasks', label: 'Completed', icon: CheckCircle, color: 'emerald' },
  { key: 'totalModelCalls', label: 'Model Calls', icon: Cpu, color: 'cyan' },
  { key: 'totalTokens', label: 'Tokens Used', icon: TrendingUp, color: 'purple' },
];

const colorClasses: Record<string, string> = {
  violet: 'from-violet-600/20 to-violet-600/5 border-violet-500/30',
  green: 'from-green-600/20 to-green-600/5 border-green-500/30',
  gray: 'from-gray-600/20 to-gray-600/5 border-gray-500/30',
  red: 'from-red-600/20 to-red-600/5 border-red-500/30',
  amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/30',
  emerald: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/30',
  cyan: 'from-cyan-600/20 to-cyan-600/5 border-cyan-500/30',
  purple: 'from-purple-600/20 to-purple-600/5 border-purple-500/30',
};

const iconColorClasses: Record<string, string> = {
  violet: 'text-violet-400',
  green: 'text-green-400',
  gray: 'text-gray-400',
  red: 'text-red-400',
  amber: 'text-amber-400',
  emerald: 'text-emerald-400',
  cyan: 'text-cyan-400',
  purple: 'text-purple-400',
};

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {statConfig.map(({ key, label, icon: Icon, color }) => {
        const value = stats[key as keyof DashboardStats] as number;
        
        return (
          <div
            key={key}
            className={clsx(
              'relative overflow-hidden rounded-xl border bg-gradient-to-br p-4',
              colorClasses[color]
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="text-xl font-bold text-white">
                  {formatNumber(value)}
                </p>
              </div>
              <Icon className={clsx('w-5 h-5', iconColorClasses[color])} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
