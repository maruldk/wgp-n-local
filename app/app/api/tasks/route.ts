
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const assigneeId = searchParams.get('assigneeId');
    const projectId = searchParams.get('projectId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId: session.user.tenantId,
    };

    if (status !== 'all') {
      where.status = status;
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
        include: {
          project: {
            select: { id: true, name: true },
          },
          assignee: {
            select: { name: true, email: true },
          },
          parentTask: {
            select: { id: true, name: true },
          },
          subtasks: {
            select: { id: true, name: true, status: true },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({
      tasks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      projectId,
      name,
      description,
      status = 'TODO',
      priority = 'MEDIUM',
      assigneeId,
      startDate,
      dueDate,
      estimatedHours,
      parentTaskId,
    } = data;

    if (!projectId || !name) {
      return NextResponse.json(
        { error: 'Projekt-ID und Task-Name sind erforderlich' },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to tenant
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId: session.user.tenantId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        name,
        description,
        status,
        priority,
        assigneeId,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours,
        parentTaskId,
        tenantId: session.user.tenantId,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
        assignee: {
          select: { name: true, email: true },
        },
        parentTask: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
