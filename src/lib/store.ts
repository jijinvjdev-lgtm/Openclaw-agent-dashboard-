import { create } from 'zustand';
import type { 
  Agent, 
  Task, 
  Communication, 
  ModelUsage, 
  SystemHealth, 
  ProductWorkflow,
  DashboardStats,
  CommunicationFilter 
} from '@/types';

interface DashboardState {
  // Data
  agents: Agent[];
  tasks: Task[];
  communications: Communication[];
  modelUsage: ModelUsage[];
  workflows: ProductWorkflow[];
  systemHealth: SystemHealth[];
  stats: DashboardStats;
  
  // Filters
  communicationFilter: CommunicationFilter;
  
  // UI State
  selectedAgentId: string | null;
  selectedWorkflowId: string | null;
  sidebarOpen: boolean;
  activeTab: string;
  
  // Actions
  setAgents: (agents: Agent[]) => void;
  updateAgent: (agent: Agent) => void;
  setTasks: (tasks: Task[]) => void;
  updateTask: (task: Task) => void;
  addCommunication: (comm: Communication) => void;
  setCommunications: (comms: Communication[]) => void;
  addModelUsage: (usage: ModelUsage) => void;
  setModelUsage: (usages: ModelUsage[]) => void;
  setWorkflows: (workflows: ProductWorkflow[]) => void;
  updateWorkflow: (workflow: ProductWorkflow) => void;
  setSystemHealth: (health: SystemHealth[]) => void;
  setStats: (stats: DashboardStats) => void;
  setCommunicationFilter: (filter: CommunicationFilter) => void;
  setSelectedAgentId: (id: string | null) => void;
  setSelectedWorkflowId: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  // Initial Data
  agents: [],
  tasks: [],
  communications: [],
  modelUsage: [],
  workflows: [],
  systemHealth: [],
  stats: {
    totalAgents: 0,
    activeAgents: 0,
    idleAgents: 0,
    errorAgents: 0,
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    activeTasks: 0,
    totalTokens: 0,
    totalModelCalls: 0,
    fallbackRate: 0,
    averageLatency: 0,
    gatewayStatus: 'healthy',
    uptime: 0,
  },
  
  // Initial Filters
  communicationFilter: {},
  
  // Initial UI State
  selectedAgentId: null,
  selectedWorkflowId: null,
  sidebarOpen: true,
  activeTab: 'overview',
  
  // Actions
  setAgents: (agents) => set({ agents }),
  updateAgent: (agent) => set((state) => ({
    agents: state.agents.map((a) => (a.id === agent.id ? agent : a)),
  })),
  setTasks: (tasks) => set({ tasks }),
  updateTask: (task) => set((state) => ({
    tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
  })),
  addCommunication: (comm) => set((state) => ({
    communications: [comm, ...state.communications].slice(0, 1000),
  })),
  setCommunications: (comms) => set({ communications: comms }),
  addModelUsage: (usage) => set((state) => ({
    modelUsage: [usage, ...state.modelUsage].slice(0, 1000),
  })),
  setModelUsage: (usages) => set({ modelUsage: usages }),
  setWorkflows: (workflows) => set({ workflows }),
  updateWorkflow: (workflow) => set((state) => ({
    workflows: state.workflows.map((w) => (w.id === workflow.id ? workflow : w)),
  })),
  setSystemHealth: (health) => set({ systemHealth: health }),
  setStats: (stats) => set({ stats }),
  setCommunicationFilter: (filter) => set({ communicationFilter: filter }),
  setSelectedAgentId: (id) => set({ selectedAgentId: id }),
  setSelectedWorkflowId: (id) => set({ selectedWorkflowId: id }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
