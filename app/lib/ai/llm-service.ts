
import { PrismaClient } from '@prisma/client';

export interface LLMRequest {
  model?: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
}

export interface LLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class LLMService {
  private baseURL = 'https://apps.abacus.ai';
  private apiKey: string;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.apiKey = process.env.ABACUSAI_API_KEY || '';
    this.prisma = prisma;
  }

  async chatCompletion(request: LLMRequest): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model || 'gpt-4.1-mini',
          messages: request.messages,
          temperature: request.temperature || 0.7,
          max_tokens: request.max_tokens || 1000,
          ...(request.response_format && { response_format: request.response_format }),
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LLM Service Error:', error);
      throw new Error(`Failed to process LLM request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzePredictiveData(data: any, context: string): Promise<any> {
    const request: LLMRequest = {
      messages: [
        {
          role: 'system',
          content: `Du bist ein KI-Analytiker für die weGROUP DeepAgent Plattform. Analysiere die bereitgestellten Daten und erstelle präzise Vorhersagen und Insights. Antworte mit strukturiertem JSON.`
        },
        {
          role: 'user',
          content: `Kontext: ${context}\n\nDaten: ${JSON.stringify(data)}\n\nAnalysiere diese Daten und erstelle Vorhersagen, Trends und Empfehlungen.`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    };

    const response = await this.chatCompletion(request);
    return this.parseJsonResponse(response.choices[0]?.message?.content || '{}');
  }

  async generateInsights(data: any, category: string): Promise<any> {
    const request: LLMRequest = {
      messages: [
        {
          role: 'system',
          content: `Du bist ein KI-Experte für Geschäftsprozess-Optimierung. Generiere wertvolle Insights basierend auf den bereitgestellten Daten.`
        },
        {
          role: 'user',
          content: `Kategorie: ${category}\nDaten: ${JSON.stringify(data)}\n\nGeneriere actionable Insights und Empfehlungen für Geschäftsprozess-Verbesserungen.`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4
    };

    const response = await this.chatCompletion(request);
    return this.parseJsonResponse(response.choices[0]?.message?.content || '{}');
  }

  async optimizeWorkflow(workflowData: any, constraints: any): Promise<any> {
    const request: LLMRequest = {
      messages: [
        {
          role: 'system',
          content: `Du bist ein KI-Workflow-Optimierer. Analysiere Workflows und schlage Verbesserungen vor.`
        },
        {
          role: 'user',
          content: `Workflow-Daten: ${JSON.stringify(workflowData)}\nBeschränkungen: ${JSON.stringify(constraints)}\n\nOptimiere diesen Workflow und schlage konkrete Verbesserungen vor.`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    };

    const response = await this.chatCompletion(request);
    return this.parseJsonResponse(response.choices[0]?.message?.content || '{}');
  }

  async assessRisk(data: any, riskType: string): Promise<any> {
    const request: LLMRequest = {
      messages: [
        {
          role: 'system',
          content: `Du bist ein KI-Risiko-Analyst. Bewerte Risiken basierend auf bereitgestellten Daten und erstelle Risiko-Assessments.`
        },
        {
          role: 'user',
          content: `Risiko-Typ: ${riskType}\nDaten: ${JSON.stringify(data)}\n\nBewerte die Risiken und erstelle ein detailliertes Risiko-Assessment mit Empfehlungen.`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    };

    const response = await this.chatCompletion(request);
    return this.parseJsonResponse(response.choices[0]?.message?.content || '{}');
  }

  private parseJsonResponse(content: string): any {
    try {
      // Remove any markdown code blocks
      const cleanContent = content.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanContent);
    } catch (error) {
      console.error('JSON parsing error:', error);
      return { error: 'Failed to parse AI response', raw: content };
    }
  }
}
