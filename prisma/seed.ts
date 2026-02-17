import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample agents
  const agents = await Promise.all([
    prisma.agent.create({
      data: {
        name: 'Trends Scout',
        role: 'Product Research',
        emoji: '🔍',
        status: 'running',
        modelPrimary: 'minimax-portal/MiniMax-M2.5',
        totalTasks: 45,
        totalCalls: 123,
        totalTokens: 45000,
        lastActive: new Date(),
      },
    }),
    prisma.agent.create({
      data: {
        name: 'Supplier Intel',
        role: 'Supplier Analysis',
        emoji: '📦',
        status: 'idle',
        modelPrimary: 'minimax-portal/MiniMax-M2.5',
        totalTasks: 32,
        totalCalls: 89,
        totalTokens: 28000,
      },
    }),
    prisma.agent.create({
      data: {
        name: 'Risk Model',
        role: 'Risk Assessment',
        emoji: '⚖️',
        status: 'running',
        modelPrimary: 'minimax-portal/MiniMax-M2.5',
        modelFallback: 'minimax-portal/MiniMax-M2',
        totalTasks: 28,
        totalCalls: 67,
        totalTokens: 19000,
        lastActive: new Date(),
      },
    }),
    prisma.agent.create({
      data: {
        name: 'Validator',
        role: 'Product Validation',
        emoji: '✅',
        status: 'idle',
        modelPrimary: 'minimax-portal/MiniMax-M2.5',
        totalTasks: 56,
        totalCalls: 145,
        totalTokens: 52000,
      },
    }),
    prisma.agent.create({
      data: {
        name: 'Content Creator',
        role: 'Listing Content',
        emoji: '✍️',
        status: 'running',
        modelPrimary: 'minimax-portal/MiniMax-M2.5',
        totalTasks: 89,
        totalCalls: 234,
        totalTokens: 87000,
        lastActive: new Date(),
      },
    }),
  ]);

  console.log(`Created ${agents.length} agents`);

  // Create sample tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        agentId: agents[0].id,
        type: 'trends',
        status: 'completed',
        stage: 'trends',
        stageResult: 'pass',
        productId: 'prod_001',
        inputSummary: 'Analyzed trending products in home & garden',
        outputSummary: 'Found 15 potential products',
        startedAt: new Date(Date.now() - 3600000),
        completedAt: new Date(Date.now() - 3000000),
      },
    }),
    prisma.task.create({
      data: {
        agentId: agents[1].id,
        type: 'supplier_intel',
        status: 'running',
        stage: 'supplier_intel',
        productId: 'prod_001',
        inputSummary: 'Finding suppliers for product',
        startedAt: new Date(Date.now() - 1800000),
      },
    }),
    prisma.task.create({
      data: {
        agentId: agents[2].id,
        type: 'risk_model',
        status: 'pending',
        stage: 'risk_model',
        productId: 'prod_002',
        inputSummary: 'Analyzing risk factors',
      },
    }),
  ]);

  console.log(`Created ${tasks.length} tasks`);

  // Create sample model usage
  const modelUsages = await Promise.all([
    prisma.modelUsage.create({
      data: {
        agentId: agents[0].id,
        modelName: 'minimax-portal/MiniMax-M2.5',
        tokensUsed: 4500,
        latency: 1250,
        fallbackUsed: false,
        success: true,
      },
    }),
    prisma.modelUsage.create({
      data: {
        agentId: agents[2].id,
        modelName: 'minimax-portal/MiniMax-M2.5',
        tokensUsed: 3200,
        latency: 980,
        fallbackUsed: false,
        success: true,
      },
    }),
    prisma.modelUsage.create({
      data: {
        agentId: agents[4].id,
        modelName: 'minimax-portal/MiniMax-M2',
        tokensUsed: 5800,
        latency: 2100,
        fallbackUsed: true,
        success: true,
      },
    }),
  ]);

  console.log(`Created ${modelUsages.length} model usage records`);

  // Create sample system health
  await prisma.systemHealth.create({
    data: {
      metric: 'gateway_status',
      status: 'healthy',
      details: 'All systems operational',
      lastChecked: new Date(),
    },
  });

  console.log('Created system health record');
  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
