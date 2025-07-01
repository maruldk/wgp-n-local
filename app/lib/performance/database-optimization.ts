
import { Prisma } from '@prisma/client';

export class DatabaseOptimizer {
  
  // Common select fields to reduce payload size
  static readonly USER_SELECT = {
    id: true,
    name: true,
    email: true,
    role: true,
    image: true,
  } as const;

  static readonly DASHBOARD_SELECT = {
    id: true,
    name: true,
    description: true,
    isDefault: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  static readonly WIDGET_SELECT = {
    id: true,
    name: true,
    type: true,
    position: true,
    size: true,
    config: true,
  } as const;

  // Optimized queries for common operations
  static getDashboardsQuery(tenantId: string, userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    return {
      where: { tenantId, userId },
      select: {
        ...this.DASHBOARD_SELECT,
        user: { select: this.USER_SELECT },
        _count: { select: { widgets: true } },
      },
      orderBy: { updatedAt: 'desc' as const },
      skip,
      take: limit,
    };
  }

  static getDashboardDetailQuery(dashboardId: string, tenantId: string) {
    return {
      where: { id: dashboardId, tenantId },
      include: {
        user: { select: this.USER_SELECT },
        widgets: {
          select: this.WIDGET_SELECT,
          orderBy: { createdAt: 'asc' as const },
        },
      },
    };
  }

  static getAnalyticsMetricsQuery(tenantId: string) {
    return {
      where: { tenantId },
      select: {
        id: true,
        name: true,
        description: true,
        currentValue: true,
        target: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' as const },
    };
  }

  // Batch operations for better performance
  static async batchCreateWidgets(
    prisma: any,
    dashboardId: string,
    tenantId: string,
    widgets: Array<{
      name: string;
      type: string;
      config?: any;
      position?: any;
      size?: any;
    }>
  ) {
    const data = widgets.map(widget => ({
      ...widget,
      dashboardId,
      tenantId,
    }));

    return prisma.widget.createMany({
      data,
      skipDuplicates: true,
    });
  }

  // Optimized aggregation queries
  static getAnalyticsAggregation(tenantId: string, startDate?: Date, endDate?: Date) {
    const dateFilter = startDate && endDate ? {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    } : {};

    return {
      where: { tenantId, ...dateFilter },
      _count: { id: true },
      _avg: { currentValue: true },
      _sum: { currentValue: true },
      _max: { currentValue: true },
      _min: { currentValue: true },
    };
  }

  // Connection pooling optimization
  static getConnectionConfig() {
    return {
      maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '20'),
      connectionTimeout: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '20000'),
      maxIdleTime: parseInt(process.env.DATABASE_MAX_IDLE_TIME || '30000'),
    };
  }

  // Query performance monitoring
  static logSlowQuery(query: string, duration: number, threshold: number = 1000) {
    if (duration > threshold) {
      console.warn(`🐌 Slow query detected (${duration}ms):`, {
        query: query.substring(0, 200),
        duration,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Index suggestions for common query patterns
  static readonly RECOMMENDED_INDEXES = [
    // Dashboard queries
    'CREATE INDEX IF NOT EXISTS idx_dashboards_tenant_user ON "dashboards"("tenantId", "userId");',
    'CREATE INDEX IF NOT EXISTS idx_dashboards_updated_at ON "dashboards"("updatedAt");',
    
    // Widget queries
    'CREATE INDEX IF NOT EXISTS idx_widgets_dashboard ON "widgets"("dashboardId");',
    'CREATE INDEX IF NOT EXISTS idx_widgets_tenant ON "widgets"("tenantId");',
    
    // Analytics queries
    'CREATE INDEX IF NOT EXISTS idx_metrics_tenant ON "metrics"("tenantId");',
    'CREATE INDEX IF NOT EXISTS idx_reports_tenant_user ON "reports"("tenantId", "userId");',
    
    // Audit logs
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_action ON "audit_logs"("tenantId", "action");',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON "audit_logs"("createdAt");',
    
    // AI/ML queries
    'CREATE INDEX IF NOT EXISTS idx_ai_insights_tenant_category ON "ai_insights"("tenantId", "category");',
    'CREATE INDEX IF NOT EXISTS idx_ml_models_tenant ON "ml_models"("tenantId");',
  ] as const;
}

// Query builder helpers
export class QueryBuilder {
  
  static buildWhereClause(filters: Record<string, any>): Prisma.InputJsonValue {
    const where: any = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && value.includes('*')) {
          // Wildcard search
          where[key] = { contains: value.replace('*', ''), mode: 'insensitive' };
        } else if (Array.isArray(value)) {
          // In clause
          where[key] = { in: value };
        } else {
          // Exact match
          where[key] = value;
        }
      }
    });
    
    return where;
  }

  static buildOrderClause(
    sortBy?: string, 
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Prisma.InputJsonValue {
    if (!sortBy) return { createdAt: sortOrder };
    
    return { [sortBy]: sortOrder };
  }

  static buildPaginationClause(page: number = 1, limit: number = 10) {
    const skip = Math.max(0, (page - 1) * limit);
    const take = Math.min(100, Math.max(1, limit)); // Max 100 items per page
    
    return { skip, take };
  }
}
