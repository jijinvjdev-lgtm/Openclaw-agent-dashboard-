'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import type { Task, Agent } from '@/types';

const stages = [
  { id: 'trends', label: 'Trends', color: '#8b5cf6', emoji: '🔍' },
  { id: 'supplier_intel', label: 'Supplier Intel', color: '#06b6d4', emoji: '📦' },
  { id: 'risk_model', label: 'Risk Model', color: '#f59e0b', emoji: '⚖️' },
  { id: 'validator', label: 'Validator', color: '#10b981', emoji: '✅' },
  { id: 'verification', label: 'Verification', color: '#3b82f6', emoji: '🔴' },
  { id: 'listing', label: 'Listing', color: '#ec4899', emoji: '🏷️' },
  { id: 'content', label: 'Content', color: '#f97316', emoji: '✍️' },
  { id: 'performance', label: 'Performance', color: '#14b8a6', emoji: '🎯' },
];

const statusConfig = {
  pending: { label: 'Pending', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-700' },
  running: { label: 'Running', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-600' },
  completed: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-600' },
  failed: { label: 'Failed', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-600' },
};

export function TaskFlow() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Record<string, Agent>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Load tasks
        const tasksRes = await fetch('/api/tasks?limit=50');
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
        }
        
        // Load agents for mapping
        const agentsRes = await fetch('/api/agents?limit=20');
        if (agentsRes.ok) {
          const agentsData = await agentsRes.json();
          const agentsMap: Record<string, Agent> = {};
          agentsData.forEach((a: Agent) => { agentsMap[a.id] = a; });
          setAgents(agentsMap);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getStageInfo = (stageId: string) => stages.find(s => s.id === stageId) || { label: stageId, color: '#6b7280', emoji: '❓' };

  if (loading) {
    return <div className="p-8 text-gray-400">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <p>No active tasks</p>
        <p className="text-sm">Tasks will appear here when agents are working</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Task List - Mobile Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:g-4">
        {(tasks || []).map((task) => {
          const agent = agents[task.agentId];
          const stage = getStageInfo(task.stage || task.type);
          const status = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.pending;
          
          return (
            <button
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className={`p-3 md:p-4 rounded-lg md:rounded-xl border ${status.border} ${status.bg} text-left hover:opacity-80 transition-opacity w-full`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">{stage.emoji}</span>
                  <div className="min-w-0">
                    <h4 className="font-medium text-white text-sm md:text-base truncate">{task.type}</h4>
                    <p className="text-xs text-gray-400 truncate">{agent?.name || 'Unknown Agent'}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs ${status.bg} ${status.color} flex-shrink-0`}>
                  {status.label}
                </span>
              </div>
              
              <p className="text-xs text-gray-400 truncate mb-2">{task.inputSummary || 'No description'}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{task.productId || '-'}</span>
                <span>{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedTask(null)}>
          <div 
            className="bg-gray-900 rounded-xl border border-gray-700 p-4 md:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getStageInfo(selectedTask.stage || selectedTask.type).emoji}</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedTask.type}</h3>
                  <p className="text-sm text-gray-400">{agents[selectedTask.agentId]?.name || 'Unknown Agent'}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded hover:bg-gray-800 text-gray-400"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase">Status</label>
                <p className={`text-sm ${statusConfig[selectedTask.status as keyof typeof statusConfig]?.color || 'text-gray-400'}`}>
                  {selectedTask.status}
                </p>
              </div>
              
              <div>
                <label className="text-xs text-gray-500 uppercase">Stage</label>
                <p className="text-sm text-white">{selectedTask.stage || '-'}</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-500 uppercase">Product ID</label>
                <p className="text-sm text-white">{selectedTask.productId || '-'}</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-500 uppercase">Input</label>
                <p className="text-sm text-gray-300">{selectedTask.inputSummary || 'No input'}</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-500 uppercase">Output</label>
                <p className="text-sm text-gray-300">{selectedTask.outputSummary || 'Pending...'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase">Created</label>
                  <p className="text-sm text-white">{format(new Date(selectedTask.createdAt), 'PPp')}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">Started</label>
                  <p className="text-sm text-white">{selectedTask.startedAt ? format(new Date(selectedTask.startedAt), 'PPp') : '-'}</p>
                </div>
              </div>
              
              {selectedTask.completedAt && (
                <div>
                  <label className="text-xs text-gray-500 uppercase">Completed</label>
                  <p className="text-sm text-white">{format(new Date(selectedTask.completedAt), 'PPp')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
