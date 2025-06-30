
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { getOrchestrator, AIEventOrchestrator } from '@/lib/ai/orchestrator';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const orchestrator = new AIEventOrchestrator(prisma);
    const insights = await orchestrator.getAIInsights(
      session.user.tenantId,
      category || undefined,
      limit
    );

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('AI Insights Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI insights' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { analysisType, data, context } = body;

    const orchestrator = new AIEventOrchestrator(prisma);
    
    const aiContext = {
      userId: session.user.id,
      tenantId: session.user.tenantId,
      timestamp: new Date()
    };

    // Generate insights based on analysis type
    let result;
    switch (analysisType) {
      case 'ANOMALY_DETECTION':
        result = await orchestrator.processAIEvent('ANOMALY_DETECTION', data, aiContext);
        break;
      case 'PREDICTIVE_ANALYSIS':
        result = await orchestrator.processAIEvent('PREDICTIVE_ANALYSIS', data, aiContext);
        break;
      case 'RISK_ASSESSMENT':
        result = await orchestrator.processAIEvent('RISK_ASSESSMENT', data, aiContext);
        break;
      default:
        return NextResponse.json({ error: 'Invalid analysis type' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Insights Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI insights' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { insightId, actionTaken } = body;

    const orchestrator = new AIEventOrchestrator(prisma);
    await orchestrator.markInsightAsRead(insightId, actionTaken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('AI Insights Update Error:', error);
    return NextResponse.json(
      { error: 'Failed to update insight' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
