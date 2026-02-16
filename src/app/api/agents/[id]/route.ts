import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/agents/[id] - Get single agent
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
      include: {
        tasks: {
          take: 50,
          orderBy: { createdAt: 'desc' },
        },
        communications: {
          take: 50,
          orderBy: { timestamp: 'desc' },
          include: {
            fromAgent: { select: { id: true, name: true, emoji: true } },
            toAgent: { select: { id: true, name: true, emoji: true } },
          },
        },
        memoryLogs: {
          take: 50,
          orderBy: { timestamp: 'desc' },
        },
        modelUsages: {
          take: 100,
          orderBy: { timestamp: 'desc' },
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
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Parse JSON fields
    return NextResponse.json({
      ...agent,
      skills: JSON.parse(agent.skills || '[]'),
      authorities: JSON.parse(agent.authorities || '[]'),
    });
  } catch (error) {
    console.error('[API] GET /agents/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 });
  }
}

// PATCH /api/agents/[id] - Update agent
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const updateData: Record<string, unknown> = {};
    
    if (body.name) updateData.name = body.name;
    if (body.role) updateData.role = body.role;
    if (body.emoji) updateData.emoji = body.emoji;
    if (body.status) updateData.status = body.status;
    if (body.systemPrompt !== undefined) updateData.systemPrompt = body.systemPrompt;
    if (body.skills) updateData.skills = JSON.stringify(body.skills);
    if (body.authorities) updateData.authorities = JSON.stringify(body.authorities);
    if (body.modelPrimary) updateData.modelPrimary = body.modelPrimary;
    if (body.modelFallback !== undefined) updateData.modelFallback = body.modelFallback;
    if (body.disabled !== undefined) updateData.disabled = body.disabled;
    if (body.totalTasks) updateData.totalTasks = body.totalTasks;
    if (body.totalCalls) updateData.totalCalls = body.totalCalls;
    if (body.totalTokens) updateData.totalTokens = body.totalTokens;
    if (body.errorCount) updateData.errorCount = body.errorCount;

    const agent = await prisma.agent.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(agent);
  } catch (error) {
    console.error('[API] PATCH /agents/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}

// DELETE /api/agents/[id] - Delete agent
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.agent.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /agents/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 });
  }
}
