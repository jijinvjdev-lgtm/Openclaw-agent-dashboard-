'use client';

import { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Square, 
  RefreshCw, 
  Trash2, 
  Edit3,
  Save,
  X,
  Clock,
  Cpu,
  HardDrive,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import type { Agent, Task, Communication, MemoryLog, ModelUsage } from '@/types';

interface AgentProfileProps {
  agentId: string;
  onBack: () => void;
}

export function AgentProfile({ agentId, onBack }: AgentProfileProps) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [memoryLogs, setMemoryLogs] = useState<MemoryLog[]>([]);
  const [modelUsage, setModelUsage] = useState<ModelUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    async function loadAgent() {
      try {
        const res = await fetch(`/api/agents/${agentId}`);
        if (res.ok) {
          const data = await res.json();
          setAgent(data);
          setPrompt(data.systemPrompt || '');
          setTasks(data.tasks || []);
          setCommunications(data.communications || []);
          setMemoryLogs(data.memoryLogs || []);
          setModelUsage(data.modelUsages || []);
        }
      } catch (error) {
        console.error('Failed to load agent:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAgent();
  }, [agentId]);

  const handleRestart = async () => {
    await fetch(`/api/agents/${agentId}/restart`, { method: 'POST' });
  };

  const handleDisable = async () => {
    if (!agent) return;
    await fetch(`/api/agents/${agentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disabled: !agent.disabled }),
    });
    setAgent({ ...agent, disabled: !agent.disabled });
  };

  const handleUpdatePrompt = async () => {
    await fetch(`/api/agents/${agentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt: prompt }),
    });
    setEditingPrompt(false);
    if (agent) setAgent({ ...agent, systemPrompt: prompt });
  };

  const handleClearWorkspace = async () => {
    if (confirm('Are you sure you want to clear this agent\'s workspace?')) {
      await fetch(`/api/agents/${agentId}/clear-workspace`, { method: 'POST' });
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Loading agent...</div>;
  }

  if (!agent) {
    return <div className="p-8 text-gray-400">Agent not found</div>;
  }

  // Parse skills and authorities from JSON strings or arrays
  const parseJsonField = (field: any) => {
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return [];
      }
    }
    return [];
  };
  const skills = parseJsonField(agent.skills);
  const authorities = parseJsonField(agent.authorities);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{agent.emoji}</span>
          <div>
            <h2 className="text-xl font-semibold text-white">{agent.name}</h2>
            <p className="text-sm text-gray-400">{agent.role}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Restart
          </button>
          <button
            onClick={handleDisable}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            {agent.disabled ? <Play className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            {agent.disabled ? 'Enable' : 'Disable'}
          </button>
          <button
            onClick={handleClearWorkspace}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* System Prompt */}
          <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-white">System Prompt</h3>
              {editingPrompt ? (
                <div className="flex items-center gap-2">
                  <button onClick={handleUpdatePrompt} className="p-1.5 rounded bg-green-600/20 text-green-400">
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingPrompt(false)} className="p-1.5 rounded bg-gray-800 text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditingPrompt(true)} className="p-1.5 rounded hover:bg-gray-800 text-gray-400">
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
            {editingPrompt ? (
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-48 p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 text-sm font-mono resize-none"
              />
            ) : (
              <p className="text-sm text-gray-400 whitespace-pre-wrap">
                {agent.systemPrompt || 'No system prompt defined'}
              </p>
            )}
          </div>

          {/* Skills & Authorities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
              <h3 className="font-medium text-white mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span key={i} className="px-2 py-1 rounded-md bg-violet-600/20 text-violet-300 text-xs">
                    {skill}
                  </span>
                ))}
                {skills.length === 0 && <span className="text-gray-500 text-sm">No skills defined</span>}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
              <h3 className="font-medium text-white mb-3">Authorities</h3>
              <div className="flex flex-wrap gap-2">
                {authorities.map((auth, i) => (
                  <span key={i} className="px-2 py-1 rounded-md bg-cyan-600/20 text-cyan-300 text-xs">
                    {auth}
                  </span>
                ))}
                {authorities.length === 0 && <span className="text-gray-500 text-sm">No authorities defined</span>}
              </div>
            </div>
          </div>

          {/* Task History */}
          <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
            <h3 className="font-medium text-white mb-3">Task History</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${
                      task.status === 'completed' ? 'bg-green-500' :
                      task.status === 'running' ? 'bg-amber-500' :
                      task.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                    <span className="text-sm text-gray-300">{task.type}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {task.completedAt ? formatDistanceToNow(new Date(task.completedAt), { addSuffix: true }) : 'Pending'}
                  </span>
                </div>
              ))}
              {tasks.length === 0 && <p className="text-gray-500 text-sm">No tasks yet</p>}
            </div>
          </div>
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-4">
          {/* Model Info */}
          <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
            <h3 className="font-medium text-white mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-violet-400" />
              Model Usage
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Primary</p>
                <p className="text-sm text-white">{agent.modelPrimary}</p>
              </div>
              {agent.modelFallback && (
                <div>
                  <p className="text-xs text-gray-500">Fallback</p>
                  <p className="text-sm text-amber-400">{agent.modelFallback}</p>
                </div>
              )}
              <div className="pt-2 border-t border-gray-800 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Total Calls</p>
                  <p className="text-lg font-semibold text-white">{agent.totalCalls}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tokens Used</p>
                  <p className="text-lg font-semibold text-white">{(agent.totalTokens / 1000).toFixed(1)}K</p>
                </div>
              </div>
            </div>
          </div>

          {/* Storage */}
          <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
            <h3 className="font-medium text-white mb-3 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              Storage
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Workspace Size</span>
                <span className="text-white">{(agent.storageSize / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Memory Files</span>
                <span className="text-white">{memoryLogs.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Error Count</span>
                <span className={agent.errorCount > 0 ? 'text-red-400' : 'text-white'}>
                  {agent.errorCount}
                </span>
              </div>
            </div>
          </div>

          {/* Last Active */}
          <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
            <h3 className="font-medium text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Activity
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Last Active</span>
                <span className="text-white">
                  {agent.lastActive 
                    ? formatDistanceToNow(new Date(agent.lastActive), { addSuffix: true })
                    : 'Never'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created</span>
                <span className="text-white">
                  {format(new Date(agent.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
