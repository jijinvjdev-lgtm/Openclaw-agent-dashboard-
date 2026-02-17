import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/agents - List all agents
export async function GET() {
  try {
    await prisma.$connect();
    
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/agents - Create new agent
export async function POST(request: Request) {
  try {
    await prisma.$connect();
    
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
