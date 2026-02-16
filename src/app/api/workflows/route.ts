import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/workflows - List product workflows
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const workflows = await prisma.productWorkflow.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    // Parse stageResults JSON
    const parsed = workflows.map((w) => ({
      ...w,
      stageResults: JSON.parse(w.stageResults || '{}'),
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('[API] GET /workflows error:', error);
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }
}

// POST /api/workflows - Create workflow
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const workflow = await prisma.productWorkflow.create({
      data: {
        productId: body.productId,
        productName: body.productName,
        currentStage: 'trends',
        stageResults: JSON.stringify({
          trends: 'pending',
          supplier_intel: 'pending',
          risk_model: 'pending',
          validator: 'pending',
          verification: 'pending',
          listing: 'pending',
          content: 'pending',
          performance: 'pending',
        }),
        status: 'active',
      },
    });

    return NextResponse.json({
      ...workflow,
      stageResults: JSON.parse(workflow.stageResults),
    }, { status: 201 });
  } catch (error) {
    console.error('[API] POST /workflows error:', error);
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
  }
}
