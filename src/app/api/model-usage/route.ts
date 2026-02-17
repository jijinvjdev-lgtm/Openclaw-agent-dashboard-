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

// POST /api/model-usage - Log model usage or seed data
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if this is a seed request
    if (body.action === 'seed') {
      const count = body.count || 10;
      
      // Get all agents
      const agents = await prisma.agent.findMany({ take: 10 });
      
      const models = [
        'minimax-portal/MiniMax-M2.5',
        'minimax-portal/MiniMax-M2.1',
        'claude-opus-4-20251114',
        'gpt-4o',
      ];
      
      const usageRecords = [];
      
      for (let i = 0; i < Math.min(count, 50); i++) {
        const agent = agents[i % agents.length];
        const model = models[Math.floor(Math.random() * models.length)];
        const tokensUsed = Math.floor(Math.random() * 5000) + 500;
        const latency = Math.floor(Math.random() * 3000) + 200;
        const success = Math.random() > 0.1;
        
        const usage = await prisma.modelUsage.create({
          data: {
            agentId: agent.id,
            modelName: model,
            tokensUsed,
            latency,
            fallbackUsed: Math.random() > 0.8,
            success,
            errorMessage: success ? null : 'Sample error',
          },
        });
        
        usageRecords.push(usage);
        
        // Update agent stats
        await prisma.agent.update({
          where: { id: agent.id },
          data: {
            totalCalls: { increment: 1 },
            totalTokens: { increment: tokensUsed },
            errorCount: success ? undefined : { increment: 1 },
            lastActive: new Date(),
          },
        });
      }
      
      return NextResponse.json({ 
        message: `Created ${usageRecords.length} sample model usage records`,
        count: usageRecords.length 
      });
    }
    
    // Normal model usage logging
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
