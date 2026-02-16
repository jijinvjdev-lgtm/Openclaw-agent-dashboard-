import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/tasks - List tasks with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');
    const stage = searchParams.get('stage');
    const limit = parseInt(searchParams.get('limit') || '100');

    const where: Record<string, unknown> = {};
    if (agentId) where.agentId = agentId;
    if (status) where.status = status;
    if (stage) where.stage = stage;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        agent: { select: { id: true, name: true, emoji: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('[API] GET /tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST /api/tasks - Create task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const task = await prisma.task.create({
      data: {
        agentId: body.agentId,
        type: body.type,
        status: 'pending',
        productId: body.productId,
        inputSummary: body.inputSummary,
        stage: body.stage || 'trends',
        startedAt: new Date(),
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('[API] POST /tasks error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
