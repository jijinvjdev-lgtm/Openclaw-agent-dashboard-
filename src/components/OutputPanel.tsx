'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FileOutput, Search, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import type { Task, Agent } from '@/types';

export function OutputPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [tasksRes, agentsRes] = await Promise.all([
          fetch(`/api/tasks?limit=100&t=${Date.now()}`),
          fetch('/api/agents'),
        ]);
        
        if (tasksRes.ok) setTasks(await tasksRes.json());
        if (agentsRes.ok) setAgents(await agentsRes.json());
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? `${agent.emoji} ${agent.name}` : agentId;
  };

  const getAgentEmoji = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent?.emoji || '🤖';
  };

  const filteredTasks = tasks.filter(t => 
    t.outputSummary && 
    (t.inputSummary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     t.outputSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
     t.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-amber-400" />;
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Loading outputs...</div>;
  }

  const tasksWithOutput = filteredTasks.length;

  if (tasksWithOutput === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <FileOutput className="w-12 h-12 mb-4 opacity-50" />
        <p>No outputs yet</p>
        <p className="text-sm">Agent outputs will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-gray-800 bg-gray-900/50">
        <div className="flex items-center gap-2">
          <FileOutput className="w-5 h-5 text-violet-400" />
          <span className="text-white font-medium">Agent Outputs</span>
          <span className="px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 text-sm">
            {tasksWithOutput}
          </span>
        </div>
        
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search outputs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 placeholder-gray-500"
          />
        </div>
      </div>

      {/* Output Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task) => (
          <button
            key={task.id}
            onClick={() => setSelectedTask(task)}
            className="p-4 rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-gray-700 transition-all text-left"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getAgentEmoji(task.agentId)}</span>
                <div>
                  <h4 className="font-medium text-white">{task.type}</h4>
                  <p className="text-xs text-gray-500">{getAgentName(task.agentId)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(task.status)}
                <span className={`text-xs ${
                  task.status === 'completed' ? 'text-green-400' :
                  task.status === 'failed' ? 'text-red-400' : 'text-amber-400'
                }`}>
                  {task.status}
                </span>
              </div>
            </div>

            {task.inputSummary && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 uppercase mb-1">Input</p>
                <p className="text-sm text-gray-300 line-clamp-2">{task.inputSummary}</p>
              </div>
            )}

            {task.outputSummary && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <ArrowRight className="w-3 h-3 text-violet-400" />
                  <p className="text-xs text-gray-500 uppercase">Output</p>
                </div>
                <p className="text-sm text-white line-clamp-3">{task.outputSummary}</p>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
              <span>{task.productId || '-'}</span>
              <span>{format(new Date(task.updatedAt), 'HH:mm:ss')}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Output Detail Modal */}
      {selectedTask && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTask(null)}
        >
          <div 
            className="bg-gray-900 rounded-xl border border-gray-700 p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getAgentEmoji(selectedTask.agentId)}</span>
                <div>
                  <h3 className="text-xl font-semibold text-white capitalize">{selectedTask.type}</h3>
                  <p className="text-sm text-gray-400">{getAgentName(selectedTask.agentId)}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-2">
                {getStatusIcon(selectedTask.status)}
                <span className={`text-lg ${
                  selectedTask.status === 'completed' ? 'text-green-400' :
                  selectedTask.status === 'failed' ? 'text-red-400' : 'text-amber-400'
                }`}>
                  {selectedTask.status}
                </span>
              </div>

              {/* Input */}
              {selectedTask.inputSummary && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2 uppercase">Input</h4>
                  <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <p className="text-white">{selectedTask.inputSummary}</p>
                  </div>
                </div>
              )}

              {/* Output */}
              {selectedTask.outputSummary && (
                <div>
                  <h4 className="text-sm font-medium text-violet-400 mb-2 uppercase flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" /> Output
                  </h4>
                  <div className="p-4 rounded-lg bg-violet-900/20 border border-violet-700/50">
                    <p className="text-white whitespace-pre-wrap">{selectedTask.outputSummary}</p>
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Product ID</p>
                  <p className="text-sm text-white">{selectedTask.productId || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Stage</p>
                  <p className="text-sm text-white">{selectedTask.stage || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Created</p>
                  <p className="text-sm text-white">{format(new Date(selectedTask.createdAt), 'PPpp')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Last Updated</p>
                  <p className="text-sm text-white">{format(new Date(selectedTask.updatedAt), 'PPpp')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
