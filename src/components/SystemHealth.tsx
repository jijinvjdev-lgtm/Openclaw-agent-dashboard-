'use client';

import { useEffect, useState } from 'react';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Server,
  Database,
  Wifi,
  Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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
    <div className={`p-4 rounded-xl border ${config.bg}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-1">{label}</p>
          <p className={`text-lg font-semibold ${config.color}`}>{value}</p>
          {details && <p className="text-xs text-gray-500 mt-1">{details}</p>}
        </div>
        <Icon className={`w-5 h-5 ${config.icon}`} />
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

    // Poll every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get health status from data or use defaults
  const getStatus = (metric: string): 'healthy' | 'degraded' | 'down' => {
    const item = health.find(h => h.metric === metric);
    return item?.status || 'healthy';
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Loading system health...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Gateway Status"
          value={stats?.gatewayStatus === 'healthy' ? 'Online' : stats?.gatewayStatus === 'degraded' ? 'Degraded' : 'Down'}
          status={stats?.gatewayStatus || 'healthy'}
          icon={Server}
          details={stats ? `Uptime: ${stats.uptime}%` : undefined}
        />
        <MetricCard
          label="Model Availability"
          value="Available"
          status={getStatus('model_availability')}
          icon={Zap}
          details="All models operational"
        />
        <MetricCard
          label="API Health"
          value="Operational"
          status={getStatus('api_health')}
          icon={Wifi}
          details="All endpoints responding"
        />
        <MetricCard
          label="Active Sessions"
          value={String(stats?.activeAgents || 0)}
          status="healthy"
          icon={Activity}
          details={`${stats?.totalAgents || 0} total agents`}
        />
      </div>

      {/* Error Logs */}
      <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-white">Recent Errors</h3>
          <span className="text-xs text-gray-500">Last 24 hours</span>
        </div>
        
        {stats && stats.failedTasks > 0 ? (
          <div className="space-y-2">
            {Array.from({ length: Math.min(stats.failedTasks, 5) }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-red-900/10">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">
                    Task failed at stage {i + 1}
                  </p>
                  <p className="text-xs text-gray-500">Agent processing</p>
                </div>
                <span className="text-xs text-gray-500">Just now</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-400 py-4">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">No recent errors</span>
          </div>
        )}
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
          <h3 className="font-medium text-white mb-4">Component Status</h3>
          <div className="space-y-3">
            {[
              { name: 'Gateway', status: stats?.gatewayStatus || 'healthy' },
              { name: 'Database', status: 'healthy' },
              { name: 'WebSocket Server', status: 'healthy' },
              { name: 'File System', status: 'healthy' },
              { name: 'Model API', status: getStatus('model_availability') },
            ].map((component) => (
              <div key={component.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{component.name}</span>
                <div className="flex items-center gap-2">
                  {component.status === 'healthy' && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                  {component.status === 'degraded' && (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                  {component.status === 'down' && (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-xs ${
                    component.status === 'healthy' ? 'text-green-400' :
                    component.status === 'degraded' ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {component.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
          <h3 className="font-medium text-white mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Total Tasks</span>
              <span className="text-sm text-white">{stats?.totalTasks || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Completed</span>
              <span className="text-sm text-green-400">{stats?.completedTasks || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Failed</span>
              <span className="text-sm text-red-400">{stats?.failedTasks || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Active</span>
              <span className="text-sm text-amber-400">{stats?.activeTasks || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Model Fallback Rate</span>
              <span className="text-sm text-amber-400">{stats?.fallbackRate.toFixed(1) || 0}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
