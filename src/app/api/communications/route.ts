import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/communications - List communications with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromAgentId = searchParams.get('fromAgentId');
    const toAgentId = searchParams.get('toAgentId');
    const taskId = searchParams.get('taskId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');

    const where: Record<string, unknown> = {};
    if (fromAgentId) where.fromAgentId = fromAgentId;
    if (toAgentId) where.toAgentId = toAgentId;
    if (taskId) where.taskId = taskId;
    if (status) where.status = status;

    const communications = await prisma.communication.findMany({
      where,
      include: {
        fromAgent: { select: { id: true, name: true, emoji: true } },
        toAgent: { select: { id: true, name: true, emoji: true } },
        task: { select: { id: true, type: true, stage: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return NextResponse.json(communications);
  } catch (error) {
    console.error('[API] GET /communications error:', error);
    return NextResponse.json({ error: 'Failed to fetch communications' }, { status: 500 });
  }
}

// POST /api/communications - Create communication
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const communication = await prisma.communication.create({
      data: {
        fromAgentId: body.fromAgentId,
        toAgentId: body.toAgentId,
        message: body.message,
        taskId: body.taskId,
        status: 'sent',
      },
      include: {
        fromAgent: { select: { id: true, name: true, emoji: true } },
        toAgent: { select: { id: true, name: true, emoji: true } },
      },
    });

    return NextResponse.json(communication, { status: 201 });
  } catch (error) {
    console.error('[API] POST /communications error:', error);
    return NextResponse.json({ error: 'Failed to create communication' }, { status: 500 });
  }
}
