
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
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
        subtasks: {
          include: {
            assignee: {
              select: { name: true, email: true },
            },
          },
        },
        timesheets: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      name,
      description,
      status,
      priority,
      assigneeId,
      startDate,
      dueDate,
      estimatedHours,
      actualHours,
    } = data;

    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task nicht gefunden' },
        { status: 404 }
      );
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        name,
        description,
        status,
        priority,
        assigneeId,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours,
        actualHours,
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

    return NextResponse.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task nicht gefunden' },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
