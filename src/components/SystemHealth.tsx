'use client';

import { useEffect, useState } from 'react';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Server,
  Wifi,
  Zap
} from 'lucide-react';
import type { SystemHealth, DashboardStats } from '@/types';

interface MetricCardProps {
  label: string;
  value: string;
  status: 'healthy' | 'degraded' | 'down';
  icon: React.ComponentType<{ className?: string }>;
  details?: string;
}

function MetricCard({ label, value, status, icon: Icon, details }: MetricCardProps) {
  const statusConfig = {
    healthy: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: 'text-green-400' },
    degraded: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: 'text-amber-400' },
    down: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: 'text-red-400' },
  };
  
  const config = statusConfig[status];

  return (
    <div className={`p-3 md:p-4 rounded-lg md:rounded-xl border ${config.bg}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] md:text-xs text-gray-400 mb-0.5 md:mb-1">{label}</p>
          <p className={`text-base md:text-lg font-semibold ${config.color}`}>{value}</p>
          {details && <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1 hidden sm:block">{details}</p>}
        </div>
        <Icon className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 ${config.icon}`} />
      </div>
    </div>
  );
}

export function SystemHealth() {
  const [health, setHealth] = useState<SystemHealth[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [healthRes, statsRes] = await Promise.all([
          fetch('/api/health'),
          fetch('/api/stats'),
        ]);
        
        if (healthRes.ok) setHealth(await healthRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
      } catch (error) {
        console.error('Failed to load health data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatus = (metric: string): 'healthy' | 'degraded' | 'down' => {
    const item = health.find(h => h.metric === metric);
    return item?.status || 'healthy';
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Loading system health...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <MetricCard
          label="Gateway"
          value={stats?.gatewayStatus === 'healthy' ? 'Online' : stats?.gatewayStatus === 'degraded' ? 'Degraded' : 'Down'}
          status={stats?.gatewayStatus || 'healthy'}
          icon={Server}
          details={stats ? `Uptime: ${stats.uptime}%` : undefined}
        />
        <MetricCard
          label="Models"
          value="Available"
          status={getStatus('model_availability')}
          icon={Zap}
        />
        <MetricCard
          label="API"
          value="Operational"
          status={getStatus('api_health')}
          icon={Wifi}
        />
        <MetricCard
          label="Sessions"
          value={String(stats?.activeAgents || 0)}
          status="healthy"
          icon={Activity}
          details={`${stats?.totalAgents || 0} total`}
        />
      </div>

      {/* Quick Stats */}
      <div className="p-3 md:p-4 rounded-lg md:rounded-xl border border-gray-800 bg-gray-900/50">
        <h3 className="font-medium text-white mb-3 md:mb-4 text-sm md:text-base">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {[
            { label: 'Total Tasks', value: stats?.totalTasks || 0 },
            { label: 'Completed', value: stats?.completedTasks || 0, color: 'text-green-400' },
            { label: 'Failed', value: stats?.failedTasks || 0, color: 'text-red-400' },
            { label: 'Active', value: stats?.activeTasks || 0, color: 'text-amber-400' },
            { label: 'Fallback Rate', value: `${(stats?.fallbackRate || 0).toFixed(1)}%`, color: 'text-amber-400' },
          ].map((item) => (
            <div key={item.label} className="flex justify-between text-sm">
              <span className="text-gray-400">{item.label}</span>
              <span className={`text-white ${item.color || ''}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Error Logs */}
      <div className="p-3 md:p-4 rounded-lg md:rounded-xl border border-gray-800 bg-gray-900/50">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="font-medium text-white text-sm md:text-base">Recent Errors</h3>
        </div>
        
        {stats && stats.failedTasks > 0 ? (
          <div className="space-y-2">
            {Array.from({ length: Math.min(stats.failedTasks, 3) }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-red-900/10">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">Task failed at stage {i + 1}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-400 py-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">No recent errors</span>
          </div>
        )}
      </div>
    </div>
  );
}
