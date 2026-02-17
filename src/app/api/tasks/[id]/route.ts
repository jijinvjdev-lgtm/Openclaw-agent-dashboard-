import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// PATCH /api/tasks/[id] - Update task
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        status: body.status,
        outputSummary: body.outputSummary,
        stage: body.stage,
        stageResult: body.stageResult,
        completedAt: body.status === 'completed' ? new Date() : undefined,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('[API] PATCH /tasks/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// GET /api/tasks/[id] - Get single task
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        agent: { select: { id: true, name: true, emoji: true } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('[API] GET /tasks/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}
