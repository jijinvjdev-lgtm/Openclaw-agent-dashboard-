// Type definitions for the Dropshipping Dashboard

export type AgentStatus = 'idle' | 'running' | 'error';

export interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  status: AgentStatus;
  systemPrompt?: string;
  skills: string[];
  authorities: string[];
  modelPrimary: string;
  modelFallback?: string;
  totalTasks: number;
  totalCalls: number;
  totalTokens: number;
  errorCount: number;
  storageSize: number;
  lastActive?: Date;
  disabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  agentId: string;
  type: TaskType;
  status: TaskStatus;
  productId?: string;
  inputSummary?: string;
  outputSummary?: string;
  stage: WorkflowStage;
  stageResult?: 'pass' | 'fail' | 'pending';
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskType = 
  | 'trends' 
  | 'supplier_intel' 
  | 'risk_model' 
  | 'validator' 
  | 'verification' 
  | 'listing' 
  | 'content' 
  | 'performance';

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export type WorkflowStage = 
  | 'trends' 
  | 'supplier_intel' 
  | 'risk_model' 
  | 'validator' 
  | 'verification' 
  | 'listing' 
  | 'content' 
  | 'performance';

export interface Communication {
  id: string;
  fromAgentId: string;
  fromAgent?: Agent;
  toAgentId: string;
  toAgent?: Agent;
  message: string;
  taskId?: string;
  status: 'sent' | 'delivered' | 'failed';
  timestamp: Date;
}

export interface ModelUsage {
  id: string;
  agentId: string;
  modelName: string;
  tokensUsed: number;
  latency: number;
  fallbackUsed: boolean;
  success: boolean;
  errorMessage?: string;
  timestamp: Date;
}

export interface MemoryLog {
  id: string;
  agentId: string;
  entryType: 'info' | 'warning' | 'error' | 'decision' | 'memory';
  summary: string;
  details?: string;
  timestamp: Date;
}

export interface SystemHealth {
  id: string;
  metric: string;
  status: 'healthy' | 'degraded' | 'down';
  details?: string;
  lastChecked: Date;
}

export interface ProductWorkflow {
  id: string;
  productId: string;
  productName: string;
  currentStage: WorkflowStage;
  stageResults: Record<WorkflowStage, 'pass' | 'fail' | 'pending'>;
  bottleneck?: string;
  experimentId?: string;
  status: 'active' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

// WebSocket Events
export interface WSEvents {
  // Outgoing (Server → Client)
  'agent:update': Agent;
  'task:update': Task;
  'communication:new': Communication;
  'model:usage': ModelUsage;
  'system:health': SystemHealth;
  'workflow:update': ProductWorkflow;
  
  // Incoming (Client → Server)
  'agent:restart': { agentId: string };
  'agent:disable': { agentId: string; disabled: boolean };
  'agent:updatePrompt': { agentId: string; systemPrompt: string };
  'agent:clearWorkspace': { agentId: string };
  'task:create': Partial<Task>;
  'memory:clear': { agentId: string; logType?: string };
  'memory:export': { agentId: string };
}

// Dashboard Stats
export interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  idleAgents: number;
  errorAgents: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  activeTasks: number;
  totalTokens: number;
  totalModelCalls: number;
  fallbackRate: number;
  averageLatency: number;
  gatewayStatus: 'healthy' | 'degraded' | 'down';
  uptime: number;
}

// Filter Types
export interface CommunicationFilter {
  agentId?: string;
  taskId?: string;
  status?: 'sent' | 'delivered' | 'failed';
  fromDate?: Date;
  toDate?: Date;
}

export interface TaskFilter {
  agentId?: string;
  status?: TaskStatus;
  stage?: WorkflowStage;
  fromDate?: Date;
  toDate?: Date;
}
