import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/stats - Get dashboard statistics
export async function GET() {
  try {
    const [
      totalAgents,
      activeAgents,
      idleAgents,
      errorAgents,
      totalTasks,
      completedTasks,
      failedTasks,
      activeTasks,
      modelUsages,
      systemHealth,
    ] = await Promise.all([
      prisma.agent.count(),
      prisma.agent.count({ where: { status: 'running' } }),
      prisma.agent.count({ where: { status: 'idle' } }),
      prisma.agent.count({ where: { status: 'error' } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'completed' } }),
      prisma.task.count({ where: { status: 'failed' } }),
      prisma.task.count({ where: { status: { in: ['pending', 'running'] } } }),
      prisma.modelUsage.findMany({
        select: {
          tokensUsed: true,
          fallbackUsed: true,
          latency: true,
          success: true,
        },
      }),
      prisma.systemHealth.findMany({
        orderBy: { lastChecked: 'desc' },
        take: 10,
      }),
    ]);

    const totalTokens = modelUsages.reduce((sum, u) => sum + u.tokensUsed, 0);
    const totalModelCalls = modelUsages.length;
    const fallbackCount = modelUsages.filter((u) => u.fallbackUsed).length;
    const fallbackRate = totalModelCalls > 0 ? (fallbackCount / totalModelCalls) * 100 : 0;
    const successfulCalls = modelUsages.filter((u) => u.success).length;
    const averageLatency = modelUsages.length > 0
      ? modelUsages.reduce((sum, u) => sum + u.latency, 0) / modelUsages.length
      : 0;

    // Get gateway status
    const gatewayHealth = systemHealth.find((h) => h.metric === 'gateway_status');
    
    // Calculate uptime (mock for now - would need proper tracking)
    const uptime = 99.9;

    return NextResponse.json({
      totalAgents,
      activeAgents,
      idleAgents,
      errorAgents,
      totalTasks,
      completedTasks,
      failedTasks,
      activeTasks,
      totalTokens,
      totalModelCalls,
      fallbackRate,
      averageLatency,
      gatewayStatus: gatewayHealth?.status || 'healthy',
      uptime,
    });
  } catch (error) {
    console.error('[API] GET /stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
