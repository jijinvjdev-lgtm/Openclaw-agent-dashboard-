import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/model-usage - Get model usage statistics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const limit = parseInt(searchParams.get('limit') || '100');

    const where: Record<string, unknown> = {};
    if (agentId) where.agentId = agentId;

    const usages = await prisma.modelUsage.findMany({
      where,
      include: {
        agent: { select: { id: true, name: true, emoji: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    // Calculate aggregations
    const byAgent = await prisma.modelUsage.groupBy({
      by: ['agentId'],
      _count: true,
      _sum: { tokensUsed: true },
      where,
    });

    const byModel = await prisma.modelUsage.groupBy({
      by: ['modelName'],
      _count: true,
      _sum: { tokensUsed: true },
      where,
    });

    return NextResponse.json({
      usages,
      byAgent,
      byModel,
    });
  } catch (error) {
    console.error('[API] GET /model-usage error:', error);
    return NextResponse.json({ error: 'Failed to fetch model usage' }, { status: 500 });
  }
}

// POST /api/model-usage - Log model usage
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const usage = await prisma.modelUsage.create({
      data: {
        agentId: body.agentId,
        modelName: body.modelName,
        tokensUsed: body.tokensUsed || 0,
        latency: body.latency || 0,
        fallbackUsed: body.fallbackUsed || false,
        success: body.success ?? true,
        errorMessage: body.errorMessage,
      },
    });

    // Update agent stats
    await prisma.agent.update({
      where: { id: body.agentId },
      data: {
        totalCalls: { increment: 1 },
        totalTokens: { increment: body.tokensUsed || 0 },
        errorCount: body.success === false ? { increment: 1 } : undefined,
        lastActive: new Date(),
      },
    });

    return NextResponse.json(usage, { status: 201 });
  } catch (error) {
    console.error('[API] POST /model-usage error:', error);
    return NextResponse.json({ error: 'Failed to log model usage' }, { status: 500 });
  }
}
