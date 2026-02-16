import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import type { WSEvents, Agent, Task, Communication, ModelUsage, SystemHealth, ProductWorkflow } from '@/types';

let io: SocketIOServer | null = null;

export function initializeSocket(server: HTTPServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
    path: '/api/socket',
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    socket.on('agent:restart', async (data: { agentId: string }) => {
      console.log(`[WS] Agent restart requested: ${data.agentId}`);
      // Handle agent restart logic
      socket.emit('agent:restarted', { agentId: data.agentId, success: true });
    });

    socket.on('agent:disable', async (data: { agentId: string; disabled: boolean }) => {
      console.log(`[WS] Agent disable requested: ${data.agentId}, disabled: ${data.disabled}`);
      // Handle agent disable logic
    });

    socket.on('agent:updatePrompt', async (data: { agentId: string; systemPrompt: string }) => {
      console.log(`[WS] Agent prompt update: ${data.agentId}`);
      // Handle prompt update
    });

    socket.on('agent:clearWorkspace', async (data: { agentId: string }) => {
      console.log(`[WS] Clear workspace: ${data.agentId}`);
      // Handle workspace clear
    });

    socket.on('disconnect', () => {
      console.log(`[WS] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

// Emit functions for real-time updates
export function emitAgentUpdate(agent: Agent): void {
  io?.emit('agent:update', agent);
}

export function emitTaskUpdate(task: Task): void {
  io?.emit('task:update', task);
}

export function emitCommunication(communication: Communication): void {
  io?.emit('communication:new', communication);
}

export function emitModelUsage(usage: ModelUsage): void {
  io?.emit('model:usage', usage);
}

export function emitSystemHealth(health: SystemHealth): void {
  io?.emit('system:health', health);
}

export function emitWorkflowUpdate(workflow: ProductWorkflow): void {
  io?.emit('workflow:update', workflow);
}

// Broadcast to all connected clients
export function broadcast(event: string, data: unknown): void {
  io?.emit(event, data);
}
