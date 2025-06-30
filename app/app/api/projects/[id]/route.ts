
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

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
      include: {
        manager: {
          select: { name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        tasks: {
          include: {
            assignee: {
              select: { name: true, email: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        milestones: {
          orderBy: { dueDate: 'asc' },
        },
        timesheets: {
          include: {
            user: {
              select: { name: true, email: true },
            },
            task: {
              select: { name: true },
            },
          },
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Get project error:', error);
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
      startDate,
      endDate,
      budget,
      managerId,
    } = data;

    const existingProject = await prisma.project.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }

    // Verify manager if changed
    if (managerId && managerId !== existingProject.managerId) {
      const manager = await prisma.user.findFirst({
        where: {
          id: managerId,
          tenantId: session.user.tenantId,
        },
      });

      if (!manager) {
        return NextResponse.json(
          { error: 'Manager nicht gefunden' },
          { status: 404 }
        );
      }
    }

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        name,
        description,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget,
        managerId,
      },
      include: {
        manager: {
          select: { name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PROJECT_UPDATED',
        resource: 'PROJECT',
        resourceId: params.id,
        details: { name: project.name },
        tenantId: session.user.tenantId,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Update project error:', error);
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

    const existingProject = await prisma.project.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }

    await prisma.project.delete({
      where: { id: params.id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PROJECT_DELETED',
        resource: 'PROJECT',
        resourceId: params.id,
        details: { name: existingProject.name },
        tenantId: session.user.tenantId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
