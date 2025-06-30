
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Nachricht ist erforderlich' },
        { status: 400 }
      );
    }

    // Prepare the AI request
    const aiRequest = {
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `Du bist ein KI-Assistent für die weGROUP DeepAgent Plattform. 
          Du hilfst Benutzern bei CRM-Aufgaben, Kundenmanagement und Geschäftsprozessen.
          Antworte professionell und hilfreich auf Deutsch.
          
          Kontext: ${context ? JSON.stringify(context) : 'Keine zusätzlichen Kontextinformationen verfügbar.'}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    };

    // Call the AI API
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify(aiRequest),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const aiMessage = aiResponse.choices?.[0]?.message?.content;

    if (!aiMessage) {
      throw new Error('Keine Antwort vom AI-Service erhalten');
    }

    return NextResponse.json({
      message: aiMessage,
      usage: aiResponse.usage,
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Verarbeiten der AI-Anfrage' },
      { status: 500 }
    );
  }
}
