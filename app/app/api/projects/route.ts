
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId: session.user.tenantId,
    };

    if (status !== 'all') {
      where.status = status;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
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
            select: {
              id: true,
              status: true,
              priority: true,
            },
          },
          milestones: {
            select: {
              id: true,
              isCompleted: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              members: true,
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      projects,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get projects error:', error);
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
      name,
      description,
      status = 'PLANNING',
      startDate,
      endDate,
      budget,
      managerId,
      memberIds = [],
    } = data;

    if (!name || !managerId) {
      return NextResponse.json(
        { error: 'Projektname und Manager sind erforderlich' },
        { status: 400 }
      );
    }

    // Verify manager exists and belongs to tenant
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

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget,
        managerId,
        tenantId: session.user.tenantId,
      },
    });

    // Add project members (including manager)
    const allMemberIds = Array.from(new Set([managerId, ...memberIds]));
    
    if (allMemberIds.length > 0 && session.user.tenantId) {
      await prisma.projectMember.createMany({
        data: allMemberIds.map((userId) => ({
          projectId: project.id,
          userId,
          role: userId === managerId ? 'Project Manager' : 'Member',
          tenantId: session.user.tenantId!,
        })),
        skipDuplicates: true,
      });
    }

    // Get complete project with relations
    const completeProject = await prisma.project.findUnique({
      where: { id: project.id },
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
        action: 'PROJECT_CREATED',
        resource: 'PROJECT',
        resourceId: project.id,
        details: { name: project.name },
        tenantId: session.user.tenantId,
      },
    });

    return NextResponse.json(completeProject, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
