'use client';

import { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { formatDistanceToNow } from 'date-fns';
import type { ProductWorkflow } from '@/types';

const stages = [
  { id: 'trends', label: 'Trends', color: '#8b5cf6' },
  { id: 'supplier_intel', label: 'Supplier Intel', color: '#06b6d4' },
  { id: 'risk_model', label: 'Risk Model', color: '#f59e0b' },
  { id: 'validator', label: 'Validator', color: '#10b981' },
  { id: 'verification', label: 'Verification', color: '#3b82f6' },
  { id: 'listing', label: 'Listing', color: '#ec4899' },
  { id: 'content', label: 'Content', color: '#f97316' },
  { id: 'performance', label: 'Performance', color: '#14b8a6' },
];

function createFlowNodes(workflows: ProductWorkflow[]): Node[] {
  const nodes: Node[] = [];
  
  workflows.forEach((workflow, wIndex) => {
    stages.forEach((stage, sIndex) => {
      const result = workflow.stageResults?.[stage.id as keyof typeof workflow.stageResults];
      
      nodes.push({
        id: `${workflow.id}-${stage.id}`,
        position: { x: sIndex * 180, y: wIndex * 120 },
        data: { 
          label: stage.label,
          status: result || 'pending',
          productName: workflow.productName,
          bottleneck: workflow.bottleneck === stage.id,
        },
        style: {
          background: result === 'pass' ? '#10b98120' : result === 'fail' ? '#ef444420' : '#1f293720',
          border: `2px solid ${result === 'pass' ? '#10b981' : result === 'fail' ? '#ef4444' : result === 'pending' ? '#374151' : stage.color}`,
          borderRadius: '8px',
          padding: '10px',
          minWidth: '120px',
          textAlign: 'center' as const,
        },
      });
    });
  });
  
  return nodes;
}

function createFlowEdges(workflows: ProductWorkflow[]): Edge[] {
  const edges: Edge[] = [];
  
  workflows.forEach((workflow) => {
    for (let i = 0; i < stages.length - 1; i++) {
      const source = `${workflow.id}-${stages[i].id}`;
      const target = `${workflow.id}-${stages[i + 1].id}`;
      const result = workflow.stageResults?.[stages[i].id as keyof typeof workflow.stageResults];
      
      edges.push({
        id: `${source}-${target}`,
        source,
        target,
        type: 'smoothstep',
        animated: workflow.currentStage === stages[i].id,
        style: { 
          stroke: result === 'pass' ? '#10b981' : result === 'fail' ? '#ef4444' : '#4b5563',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: result === 'pass' ? '#10b981' : result === 'fail' ? '#ef4444' : '#4b5563',
        },
      });
    }
  });
  
  return edges;
}

export function TaskFlow() {
  const [workflows, setWorkflows] = useState<ProductWorkflow[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkflows() {
      try {
        const res = await fetch('/api/workflows?limit=20');
        if (res.ok) {
          const data = await res.json();
          setWorkflows(data);
          setNodes(createFlowNodes(data));
          setEdges(createFlowEdges(data));
        }
      } catch (error) {
        console.error('Failed to load workflows:', error);
      } finally {
        setLoading(false);
      }
    }
    loadWorkflows();
  }, [setNodes, setEdges]);

  // Custom node component
  const CustomNode = ({ data }: { data: { label: string; status: string; productName: string; bottleneck: boolean } }) => {
    const statusColors = {
      pass: 'text-green-400',
      fail: 'text-red-400',
      pending: 'text-gray-400',
    };
    
    return (
      <div className="text-center">
        <div className="text-xs font-medium text-gray-300 mb-1">{data.label}</div>
        <div className={`text-lg ${statusColors[data.status as keyof typeof statusColors] || statusColors.pending}`}>
          {data.status === 'pass' ? '✓' : data.status === 'fail' ? '✗' : '○'}
        </div>
        {data.bottleneck && (
          <div className="mt-1 text-xs text-amber-400">Bottleneck</div>
        )}
      </div>
    );
  };

  const nodeTypes = { custom: CustomNode };

  if (loading) {
    return <div className="p-8 text-gray-400">Loading workflows...</div>;
  }

  if (workflows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        <p>No product workflows active</p>
        <p className="text-sm">Workflows will appear here when products are being processed</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-6 p-3 rounded-lg bg-gray-900/50 border border-gray-800">
        <span className="text-sm text-gray-400">Legend:</span>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-gray-300">Pass</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs text-gray-300">Fail</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border-2 border-gray-500" />
          <span className="text-xs text-gray-300">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs text-gray-300">Active</span>
        </div>
      </div>

      {/* Flow Chart */}
      <div className="h-[500px] rounded-xl border border-gray-800 bg-gray-900/30 overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#374151" gap={20} />
          <Controls className="bg-gray-800 border-gray-700" />
        </ReactFlow>
      </div>

      {/* Workflow List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="p-4 rounded-xl border border-gray-800 bg-gray-900/50"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">{workflow.productName}</h4>
              <span className={`px-2 py-0.5 rounded text-xs ${
                workflow.status === 'active' ? 'bg-green-600/20 text-green-400' :
                workflow.status === 'completed' ? 'bg-blue-600/20 text-blue-400' :
                'bg-red-600/20 text-red-400'
              }`}>
                {workflow.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">
              Stage: {stages.find(s => s.id === workflow.currentStage)?.label}
            </p>
            <p className="text-xs text-gray-500">
              Updated {formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
