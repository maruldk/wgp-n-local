
import { PrismaClient } from '@prisma/client';
import { LLMService } from './llm-service';
import { WeAnalyticsAI } from './modules/analytics-ai';
import { WeFinanceAI } from './modules/finance-ai';
import { WeProjectAI } from './modules/project-ai';

export interface AIWorkflowResult {
  success: boolean;
  data?: any;
  insights?: any[];
  decisions?: any[];
  predictions?: any[];
  errors?: string[];
}

export interface AIContext {
  userId?: string;
  tenantId: string;
  resourceType?: string;
  resourceId?: string;
  timestamp: Date;
}

export class AIOrchestrator {
  private prisma: PrismaClient;
  private llmService: LLMService;
  private analyticsAI: WeAnalyticsAI;
  private financeAI: WeFinanceAI;
  private projectAI: WeProjectAI;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.llmService = new LLMService(prisma);
    this.analyticsAI = new WeAnalyticsAI(prisma, this.llmService);
    this.financeAI = new WeFinanceAI(prisma, this.llmService);
    this.projectAI = new WeProjectAI(prisma, this.llmService);
  }

  // Main orchestration method - processes events and triggers appropriate AI workflows
  async processAIEvent(eventType: string, data: any, context: AIContext): Promise<AIWorkflowResult> {
    const startTime = Date.now();
    
    try {
      // Log the workflow execution
      const workflowExecution = await this.prisma.aIWorkflowExecution.create({
        data: {
          workflowName: eventType,
          status: 'RUNNING',
          inputData: data,
          tenantId: context.tenantId,
          userId: context.userId,
        }
      });

      let result: AIWorkflowResult = { success: false };

      // Route to appropriate AI module based on event type
      switch (eventType) {
        case 'ANALYTICS_GENERATION':
          result = await this.analyticsAI.generateAnalytics(data, context);
          break;
        case 'FINANCE_PROCESSING':
          result = await this.financeAI.processFinancialData(data, context);
          break;
        case 'PROJECT_OPTIMIZATION':
          result = await this.projectAI.optimizeProject(data, context);
          break;
        case 'PREDICTIVE_ANALYSIS':
          result = await this.runPredictiveAnalysis(data, context);
          break;
        case 'RISK_ASSESSMENT':
          result = await this.runRiskAssessment(data, context);
          break;
        case 'ANOMALY_DETECTION':
          result = await this.detectAnomalies(data, context);
          break;
        default:
          throw new Error(`Unknown workflow type: ${eventType}`);
      }

      // Update workflow execution
      const endTime = Date.now();
      await this.prisma.aIWorkflowExecution.update({
        where: { id: workflowExecution.id },
        data: {
          status: result.success ? 'COMPLETED' : 'FAILED',
          endTime: new Date(),
          duration: endTime - startTime,
          outputData: result.data,
          errorMessage: result.errors?.join(', '),
        }
      });

      // Create audit trail
      await this.createAuditTrail(eventType, data, result.data, context);

      return result;
    } catch (error) {
      console.error('AI Orchestrator Error:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Cross-module predictive analysis
  async runPredictiveAnalysis(data: any, context: AIContext): Promise<AIWorkflowResult> {
    try {
      const analysisResult = await this.llmService.analyzePredictiveData(data, 'Cross-module predictive analysis');
      
      // Store predictions in database
      if (analysisResult.predictions) {
        for (const prediction of analysisResult.predictions) {
          await this.prisma.aIPrediction.create({
            data: {
              predictionType: prediction.type,
              targetDate: new Date(prediction.targetDate),
              predictedValue: prediction.value,
              confidence: prediction.confidence,
              modelData: prediction.modelData || {},
              tenantId: context.tenantId,
              resourceType: context.resourceType,
              resourceId: context.resourceId,
            }
          });
        }
      }

      return {
        success: true,
        data: analysisResult,
        predictions: analysisResult.predictions || []
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Prediction analysis failed']
      };
    }
  }

  // Cross-module risk assessment
  async runRiskAssessment(data: any, context: AIContext): Promise<AIWorkflowResult> {
    try {
      const riskAssessment = await this.llmService.assessRisk(data, 'BUSINESS_PROCESS');
      
      // Create risk insights
      if (riskAssessment.risks) {
        for (const risk of riskAssessment.risks) {
          await this.prisma.aIInsight.create({
            data: {
              category: 'RISK',
              type: 'RISK',
              title: risk.title,
              description: risk.description,
              severity: risk.severity,
              data: risk.data || {},
              confidence: risk.confidence || 0.8,
              isActionable: true,
              tenantId: context.tenantId,
              userId: context.userId,
              resourceType: context.resourceType,
              resourceId: context.resourceId,
            }
          });
        }
      }

      return {
        success: true,
        data: riskAssessment,
        insights: riskAssessment.risks || []
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Risk assessment failed']
      };
    }
  }

  // Anomaly detection across all modules
  async detectAnomalies(data: any, context: AIContext): Promise<AIWorkflowResult> {
    try {
      const anomalies = await this.llmService.generateInsights(data, 'ANOMALY_DETECTION');
      
      // Create anomaly insights
      if (anomalies.anomalies) {
        for (const anomaly of anomalies.anomalies) {
          await this.prisma.aIInsight.create({
            data: {
              category: anomaly.category || 'GENERAL',
              type: 'ANOMALY',
              title: anomaly.title,
              description: anomaly.description,
              severity: anomaly.severity,
              data: anomaly.data || {},
              confidence: anomaly.confidence || 0.7,
              isActionable: true,
              tenantId: context.tenantId,
              userId: context.userId,
              resourceType: context.resourceType,
              resourceId: context.resourceId,
            }
          });
        }
      }

      return {
        success: true,
        data: anomalies,
        insights: anomalies.anomalies || []
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Anomaly detection failed']
      };
    }
  }

  // AI Decision Engine
  async makeAIDecision(decisionType: string, context: any, aiContext: AIContext): Promise<any> {
    try {
      const decision = await this.llmService.optimizeWorkflow(context, {
        decisionType,
        constraints: aiContext
      });

      const aiDecision = await this.prisma.aIDecision.create({
        data: {
          decisionType,
          context: context,
          decision: decision,
          confidence: decision.confidence || 0.8,
          reasoning: decision.reasoning || '',
          tenantId: aiContext.tenantId,
          userId: aiContext.userId || null,
          resourceType: aiContext.resourceType || null,
          resourceId: aiContext.resourceId || null,
        }
      });

      return aiDecision;
    } catch (error) {
      console.error('AI Decision Error:', error);
      throw error;
    }
  }

  // Get AI insights for dashboard
  async getAIInsights(tenantId: string, category?: string, limit: number = 10): Promise<any[]> {
    const where: any = { tenantId, isRead: false };
    if (category) where.category = category;

    return await this.prisma.aIInsight.findMany({
      where,
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
  }

  // Mark insights as read
  async markInsightAsRead(insightId: string, actionTaken?: string): Promise<void> {
    await this.prisma.aIInsight.update({
      where: { id: insightId },
      data: {
        isRead: true,
        actionTaken: actionTaken
      }
    });
  }

  // Get model performance metrics
  async getModelMetrics(tenantId: string): Promise<any[]> {
    return await this.prisma.aIModelMetrics.findMany({
      where: { tenantId },
      orderBy: { lastTrained: 'desc' }
    });
  }

  // Create audit trail for AI actions
  private async createAuditTrail(action: string, inputData: any, outputData: any, context: AIContext): Promise<void> {
    await this.prisma.aIAuditTrail.create({
      data: {
        aiAction: action,
        module: 'ORCHESTRATOR',
        inputData: inputData || {},
        outputData: outputData || {},
        confidence: 0.8,
        processingTime: 0,
        tenantId: context.tenantId,
        userId: context.userId,
        resourceType: context.resourceType,
        resourceId: context.resourceId,
      }
    });
  }
}
