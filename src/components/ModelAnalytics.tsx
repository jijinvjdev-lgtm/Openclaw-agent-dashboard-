'use client';

import { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { Brain, Zap, AlertTriangle, Clock } from 'lucide-react';
import type { ModelUsage, Agent } from '@/types';

const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];

export function ModelAnalytics() {
  const [usages, setUsages] = useState<ModelUsage[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [usageRes, agentsRes] = await Promise.all([
          fetch('/api/model-usage?limit=200'),
          fetch('/api/agents'),
        ]);
        
        if (usageRes.ok) {
          const data = await usageRes.json();
          setUsages(data.usages || []);
        }
        if (agentsRes.ok) setAgents(await agentsRes.json());
      } catch (error) {
        console.error('Failed to load model usage:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calculate stats
  const totalCalls = usages.length;
  const totalTokens = usages.reduce((sum, u) => sum + u.tokensUsed, 0);
  const fallbackCount = usages.filter(u => u.fallbackUsed).length;
  const fallbackRate = totalCalls > 0 ? (fallbackCount / totalCalls) * 100 : 0;
  const avgLatency = usages.length > 0 
    ? usages.reduce((sum, u) => sum + u.latency, 0) / usages.length 
    : 0;
  const failedCalls = usages.filter(u => !u.success).length;
  const failureRate = totalCalls > 0 ? (failedCalls / totalCalls) * 100 : 0;

  // Group by agent
  const byAgent = agents.map(agent => {
    const agentUsages = usages.filter(u => u.agentId === agent.id);
    return {
      name: agent.name,
      emoji: agent.emoji,
      calls: agentUsages.length,
      tokens: agentUsages.reduce((sum, u) => sum + u.tokensUsed, 0),
      fallbacks: agentUsages.filter(u => u.fallbackUsed).length,
    };
  }).filter(a => a.calls > 0);

  // Group by model
  const modelMap = new Map<string, { calls: number; tokens: number }>();
  usages.forEach(u => {
    const existing = modelMap.get(u.modelName) || { calls: 0, tokens: 0 };
    modelMap.set(u.modelName, {
      calls: existing.calls + 1,
      tokens: existing.tokens + u.tokensUsed,
    });
  });
  const byModel = Array.from(modelMap.entries()).map(([name, data]) => ({
    name: name.split('/').pop() || name,
    fullName: name,
    ...data,
  }));

  // Daily usage (mock - would need proper date aggregation)
  const dailyData = [
    { date: 'Mon', tokens: 125000, calls: 45 },
    { date: 'Tue', tokens: 189000, calls: 67 },
    { date: 'Wed', tokens: 156000, calls: 52 },
    { date: 'Thu', tokens: 210000, calls: 78 },
    { date: 'Fri', tokens: 198000, calls: 71 },
    { date: 'Sat', tokens: 145000, calls: 48 },
    { date: 'Sun', tokens: 112000, calls: 39 },
  ];

  if (loading) {
    return <div className="p-8 text-gray-400">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-gray-400">Total Calls</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalCalls}</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-gray-400">Tokens Used</span>
          </div>
          <p className="text-2xl font-bold text-white">{(totalTokens / 1000).toFixed(0)}K</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-gray-400">Fallback Rate</span>
          </div>
          <p className="text-2xl font-bold text-white">{fallbackRate.toFixed(1)}%</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Avg Latency</span>
          </div>
          <p className="text-2xl font-bold text-white">{avgLatency.toFixed(0)}ms</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage by Agent */}
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
          <h3 className="font-medium text-white mb-4">Usage by Agent</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byAgent} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  fontSize={12}
                  width={80}
                  tickFormatter={(value, index) => byAgent[index]?.emoji || ''}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="calls" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Usage by Model */}
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
          <h3 className="font-medium text-white mb-4">Usage by Model</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byModel}
                  dataKey="calls"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {byModel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Token Consumption */}
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
          <h3 className="font-medium text-white mb-4">Daily Token Consumption</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tokens" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fallback Frequency */}
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
          <h3 className="font-medium text-white mb-4">Fallback Events</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byAgent}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="fallbacks" name="Fallbacks" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Failure Rate */}
      {failedCalls > 0 && (
        <div className="p-4 rounded-xl border border-red-900/30 bg-red-900/10">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Failure Rate: {failureRate.toFixed(1)}%</span>
          </div>
          <p className="text-sm text-gray-400">
            {failedCalls} failed out of {totalCalls} total calls
          </p>
        </div>
      )}
    </div>
  );
}
