// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
import { ProjectStatus, TaskStatus, TaskPriority } from '@prisma/client';

export interface ProjectPortfolioAnalytics {
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    onHoldProjects: number;
    cancelledProjects: number;
    totalBudget: number;
    spentBudget: number;
    totalTasks: number;
    completedTasks: number;
  };
  statusBreakdown: Record<ProjectStatus, number>;
  budgetUtilization: {
    allocated: number;
    spent: number;
    remaining: number;
    utilizationPercentage: number;
  };
  taskMetrics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    overdueTasks: number;
    completionRate: number;
  };
  teamMetrics: {
    totalMembers: number;
    activeMembers: number;
    averageProjectsPerMember: number;
    averageTasksPerMember: number;
  };
  performanceMetrics: {
    averageProjectDuration: number;
    onTimeDeliveryRate: number;
    budgetAccuracyRate: number;
    resourceUtilizationRate: number;
  };
  trends: {
    projectsCreatedThisMonth: number;
    projectsCompletedThisMonth: number;
    tasksCompletedThisWeek: number;
    budgetTrendPercentage: number;
  };
}

export interface ProjectProgressData {
  projectId: string;
  projectName: string;
  progress: number;
  tasksCompleted: number;
  totalTasks: number;
  daysUntilDeadline: number | null;
  budgetUsed: number;
  totalBudget: number;
  teamSize: number;
  riskScore: number;
  status: ProjectStatus;
}

export class ProjectAnalyticsService {
  /**
   * Get comprehensive portfolio analytics
   */
  static async getPortfolioAnalytics(tenantId: string, timeframe?: {
    startDate: Date;
    endDate: Date;
  }): Promise<ProjectPortfolioAnalytics> {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get all projects for the tenant
      const projects = await db.project.findMany({
        where: {
          tenantId,
          ...(timeframe && {
            createdAt: {
              gte: timeframe.startDate,
              lte: timeframe.endDate,
            },
          }),
        },
        include: {
          tasks: true,
          members: true,
          expenses: true,
          _count: {
            select: {
              tasks: true,
              members: true,
            },
          },
        },
      });

      // Calculate overview metrics
      const totalProjects = projects.length;
      const activeProjects = projects.filter((p: any) => p.status === ProjectStatus.ACTIVE).length;
      const completedProjects = projects.filter((p: any) => p.status === ProjectStatus.COMPLETED).length;
      const onHoldProjects = projects.filter((p: any) => p.status === ProjectStatus.ON_HOLD).length;
      const cancelledProjects = projects.filter((p: any) => p.status === ProjectStatus.CANCELLED).length;

      const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
      const spentBudget = projects.reduce((sum, p) => {
        const expenses = p.expenses?.reduce((expSum, exp) => expSum + exp.amount, 0) || 0;
        return sum + expenses;
      }, 0);

      const allTasks = projects.flatMap(p => p.tasks || []);
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(t => t.status === TaskStatus.DONE).length;
      const inProgressTasks = allTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
      const todoTasks = allTasks.filter(t => t.status === TaskStatus.TODO).length;

      // Calculate overdue tasks
      const overdueTasks = allTasks.filter(t => 
        t.dueDate && 
        t.dueDate < now && 
        t.status !== TaskStatus.DONE
      ).length;

      // Status breakdown
      const statusBreakdown = {
        [ProjectStatus.PLANNING]: projects.filter(p => p.status === ProjectStatus.PLANNING).length,
        [ProjectStatus.ACTIVE]: activeProjects,
        [ProjectStatus.ON_HOLD]: onHoldProjects,
        [ProjectStatus.COMPLETED]: completedProjects,
        [ProjectStatus.CANCELLED]: cancelledProjects,
      };

      // Team metrics
      const allMembers = new Set(projects.flatMap(p => p.members?.map(m => m.userId) || []));
      const totalMembers = allMembers.size;
      const averageProjectsPerMember = totalMembers > 0 ? totalProjects / totalMembers : 0;
      const averageTasksPerMember = totalMembers > 0 ? totalTasks / totalMembers : 0;

      // Performance metrics
      const completedProjectsWithDates = projects.filter(p => 
        p.status === ProjectStatus.COMPLETED && 
        p.startDate && 
        p.endDate
      );

      const averageProjectDuration = completedProjectsWithDates.length > 0
        ? completedProjectsWithDates.reduce((sum, p) => {
            const duration = new Date(p.endDate!).getTime() - new Date(p.startDate!).getTime();
            return sum + (duration / (1000 * 60 * 60 * 24)); // Convert to days
          }, 0) / completedProjectsWithDates.length
        : 0;

      const onTimeProjects = completedProjectsWithDates.filter(p => 
        p.endDate && p.updatedAt <= new Date(p.endDate)
      ).length;
      const onTimeDeliveryRate = completedProjectsWithDates.length > 0 
        ? (onTimeProjects / completedProjectsWithDates.length) * 100 
        : 0;

      const projectsWithBudget = projects.filter(p => p.budget && p.budget > 0);
      const budgetAccurateProjects = projectsWithBudget.filter(p => {
        const spent = p.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
        const variance = Math.abs(spent - (p.budget || 0)) / (p.budget || 1);
        return variance <= 0.1; // Within 10% of budget
      }).length;
      const budgetAccuracyRate = projectsWithBudget.length > 0 
        ? (budgetAccurateProjects / projectsWithBudget.length) * 100 
        : 0;

      // Trends
      const projectsCreatedThisMonth = projects.filter(p => 
        p.createdAt >= thirtyDaysAgo
      ).length;

      const projectsCompletedThisMonth = projects.filter(p => 
        p.status === ProjectStatus.COMPLETED && 
        p.updatedAt >= thirtyDaysAgo
      ).length;

      const tasksCompletedThisWeek = allTasks.filter(t => 
        t.status === TaskStatus.DONE && 
        t.updatedAt >= sevenDaysAgo
      ).length;

      return {
        overview: {
          totalProjects,
          activeProjects,
          completedProjects,
          onHoldProjects,
          cancelledProjects,
          totalBudget,
          spentBudget,
          totalTasks,
          completedTasks,
        },
        statusBreakdown,
        budgetUtilization: {
          allocated: totalBudget,
          spent: spentBudget,
          remaining: totalBudget - spentBudget,
          utilizationPercentage: totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0,
        },
        taskMetrics: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          overdueTasks,
          completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        },
        teamMetrics: {
          totalMembers,
          activeMembers: totalMembers, // Simplified for now
          averageProjectsPerMember,
          averageTasksPerMember,
        },
        performanceMetrics: {
          averageProjectDuration,
          onTimeDeliveryRate,
          budgetAccuracyRate,
          resourceUtilizationRate: 75, // Mock value - would calculate based on time tracking
        },
        trends: {
          projectsCreatedThisMonth,
          projectsCompletedThisMonth,
          tasksCompletedThisWeek,
          budgetTrendPercentage: 5, // Mock value - would calculate trend
        },
      };
    } catch (error) {
      throw new Error(`Failed to get portfolio analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get progress data for all projects
   */
  static async getProjectsProgressData(tenantId: string): Promise<ProjectProgressData[]> {
    try {
      const projects = await db.project.findMany({
        where: { tenantId },
        include: {
          tasks: true,
          members: true,
          expenses: true,
          projectRisks: true,
        },
      });

      return projects.map(project => {
        const tasks = project.tasks || [];
        const totalTasks = tasks.length;
        const tasksCompleted = tasks.filter(t => t.status === TaskStatus.DONE).length;
        const progress = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;

        const daysUntilDeadline = project.endDate 
          ? Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : null;

        const budgetUsed = project.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
        const totalBudget = project.budget || 0;

        const teamSize = project.members?.length || 0;

        // Calculate risk score based on various factors
        let riskScore = 0;
        if (daysUntilDeadline !== null && daysUntilDeadline < 0) riskScore += 3; // Overdue
        if (totalBudget > 0 && budgetUsed > totalBudget * 0.9) riskScore += 2; // Over budget
        if (progress < 50 && daysUntilDeadline !== null && daysUntilDeadline < 30) riskScore += 2; // Behind schedule
        if (project.projectRisks?.some(r => r.status === 'IDENTIFIED')) riskScore += 1; // Active risks

        return {
          projectId: project.id,
          projectName: project.name,
          progress,
          tasksCompleted,
          totalTasks,
          daysUntilDeadline,
          budgetUsed,
          totalBudget,
          teamSize,
          riskScore: Math.min(riskScore, 5), // Cap at 5
          status: project.status,
        };
      });
    } catch (error) {
      throw new Error(`Failed to get projects progress data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get performance comparison data
   */
  static async getPerformanceComparison(tenantId: string, compareWith: 'previous_period' | 'industry_average' = 'previous_period') {
    try {
      const now = new Date();
      const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const currentPeriodData = await this.getPortfolioAnalytics(tenantId, {
        startDate: currentPeriodStart,
        endDate: now,
      });

      const previousPeriodData = await this.getPortfolioAnalytics(tenantId, {
        startDate: previousPeriodStart,
        endDate: previousPeriodEnd,
      });

      // Calculate percentage changes
      const calculateChange = (current: number, previous: number) => 
        previous > 0 ? ((current - previous) / previous) * 100 : 0;

      return {
        projectsCompleted: {
          current: currentPeriodData.overview.completedProjects,
          previous: previousPeriodData.overview.completedProjects,
          change: calculateChange(
            currentPeriodData.overview.completedProjects,
            previousPeriodData.overview.completedProjects
          ),
        },
        taskCompletionRate: {
          current: currentPeriodData.taskMetrics.completionRate,
          previous: previousPeriodData.taskMetrics.completionRate,
          change: calculateChange(
            currentPeriodData.taskMetrics.completionRate,
            previousPeriodData.taskMetrics.completionRate
          ),
        },
        budgetUtilization: {
          current: currentPeriodData.budgetUtilization.utilizationPercentage,
          previous: previousPeriodData.budgetUtilization.utilizationPercentage,
          change: calculateChange(
            currentPeriodData.budgetUtilization.utilizationPercentage,
            previousPeriodData.budgetUtilization.utilizationPercentage
          ),
        },
        onTimeDelivery: {
          current: currentPeriodData.performanceMetrics.onTimeDeliveryRate,
          previous: previousPeriodData.performanceMetrics.onTimeDeliveryRate,
          change: calculateChange(
            currentPeriodData.performanceMetrics.onTimeDeliveryRate,
            previousPeriodData.performanceMetrics.onTimeDeliveryRate
          ),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get performance comparison: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate executive summary report
   */
  static async generateExecutiveSummary(tenantId: string) {
    try {
      const analytics = await this.getPortfolioAnalytics(tenantId);
      const progressData = await this.getProjectsProgressData(tenantId);
      const comparison = await this.getPerformanceComparison(tenantId);

      // Identify key insights
      const insights = [];
      
      if (analytics.taskMetrics.overdueTasks > 0) {
        insights.push({
          type: 'warning',
          title: 'Overdue Tasks',
          description: `${analytics.taskMetrics.overdueTasks} tasks are overdue and need attention`,
        });
      }

      if (analytics.budgetUtilization.utilizationPercentage > 90) {
        insights.push({
          type: 'warning',
          title: 'Budget Alert',
          description: `Budget utilization is at ${Math.round(analytics.budgetUtilization.utilizationPercentage)}%`,
        });
      }

      if (comparison.taskCompletionRate.change > 10) {
        insights.push({
          type: 'success',
          title: 'Improved Performance',
          description: `Task completion rate increased by ${Math.round(comparison.taskCompletionRate.change)}%`,
        });
      }

      const atRiskProjects = progressData.filter(p => p.riskScore >= 3);
      if (atRiskProjects.length > 0) {
        insights.push({
          type: 'warning',
          title: 'High-Risk Projects',
          description: `${atRiskProjects.length} projects are at high risk and need immediate attention`,
        });
      }

      return {
        generated: new Date(),
        period: 'Current Month',
        keyMetrics: {
          totalProjects: analytics.overview.totalProjects,
          activeProjects: analytics.overview.activeProjects,
          completionRate: Math.round(analytics.taskMetrics.completionRate),
          budgetUtilization: Math.round(analytics.budgetUtilization.utilizationPercentage),
          onTimeDelivery: Math.round(analytics.performanceMetrics.onTimeDeliveryRate),
        },
        insights,
        recommendations: this.generateRecommendations(analytics, progressData),
        trends: {
          projectsThisMonth: analytics.trends.projectsCreatedThisMonth,
          completedThisMonth: analytics.trends.projectsCompletedThisMonth,
          tasksThisWeek: analytics.trends.tasksCompletedThisWeek,
        },
        atRiskProjects: atRiskProjects.slice(0, 5), // Top 5 at-risk projects
      };
    } catch (error) {
      throw new Error(`Failed to generate executive summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate recommendations based on analytics
   */
  private static generateRecommendations(analytics: ProjectPortfolioAnalytics, progressData: ProjectProgressData[]) {
    const recommendations = [];

    // Budget recommendations
    if (analytics.budgetUtilization.utilizationPercentage > 85) {
      recommendations.push({
        category: 'Budget',
        priority: 'high',
        title: 'Review Budget Allocation',
        description: 'Budget utilization is high. Consider reviewing project scopes or requesting additional funding.',
      });
    }

    // Task management recommendations
    if (analytics.taskMetrics.overdueTasks > analytics.taskMetrics.totalTasks * 0.1) {
      recommendations.push({
        category: 'Tasks',
        priority: 'high',
        title: 'Address Overdue Tasks',
        description: 'High number of overdue tasks. Review task assignments and deadlines.',
      });
    }

    // Team recommendations
    if (analytics.teamMetrics.averageTasksPerMember > 10) {
      recommendations.push({
        category: 'Team',
        priority: 'medium',
        title: 'Consider Team Expansion',
        description: 'High task load per team member. Consider adding more resources.',
      });
    }

    // Performance recommendations
    if (analytics.performanceMetrics.onTimeDeliveryRate < 70) {
      recommendations.push({
        category: 'Performance',
        priority: 'high',
        title: 'Improve Project Planning',
        description: 'Low on-time delivery rate. Review project planning and estimation processes.',
      });
    }

    return recommendations;
  }
}
