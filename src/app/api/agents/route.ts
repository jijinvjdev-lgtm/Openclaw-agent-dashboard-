import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/agents - List all agents
export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        tasks: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            tasks: true,
            communications: true,
            modelUsages: true,
            memoryLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error('[API] GET /agents error:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

// POST /api/agents - Create new agent
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const agent = await prisma.agent.create({
      data: {
        name: body.name,
        role: body.role,
        emoji: body.emoji || '🤖',
        status: 'idle',
        systemPrompt: body.systemPrompt,
        skills: JSON.stringify(body.skills || []),
        authorities: JSON.stringify(body.authorities || []),
        modelPrimary: body.modelPrimary || 'minimax-portal/MiniMax-M2.5',
        modelFallback: body.modelFallback,
      },
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error('[API] POST /agents error:', error);
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}
