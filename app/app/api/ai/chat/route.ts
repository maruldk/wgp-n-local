
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { AIOrchestrator } from '@/lib/ai/orchestrator';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, context, module } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const orchestrator = new AIOrchestrator(prisma);
    
    // Create AI context
    const aiContext = {
      userId: session.user.id,
      tenantId: session.user.tenantId,
      resourceType: module || 'GENERAL',
      timestamp: new Date()
    };

    // Process the chat message through appropriate AI module
    let response;
    
    if (module === 'ANALYTICS') {
      response = await orchestrator.processAIEvent('ANALYTICS_GENERATION', {
        query: message,
        context: context
      }, aiContext);
    } else if (module === 'FINANCE') {
      response = await orchestrator.processAIEvent('FINANCE_PROCESSING', {
        query: message,
        context: context
      }, aiContext);
    } else if (module === 'PROJECT') {
      response = await orchestrator.processAIEvent('PROJECT_OPTIMIZATION', {
        query: message,
        context: context
      }, aiContext);
    } else {
      // General AI assistant
      const llmService = orchestrator['llmService'];
      const llmResponse = await llmService.chatCompletion({
        messages: [
          {
            role: 'system',
            content: 'Du bist der KI-Assistent der weGROUP DeepAgent Plattform. Hilf dem Benutzer bei Fragen zu Analytics, Finance, Projektmanagement und allgemeinen Geschäftsprozessen.'
          },
          {
            role: 'user',
            content: message
          }
        ]
      });
      
      response = {
        success: true,
        data: {
          message: llmResponse.choices[0]?.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.'
        }
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI chat request' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
