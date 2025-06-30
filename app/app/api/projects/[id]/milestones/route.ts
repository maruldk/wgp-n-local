
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

    // Verify project exists and belongs to tenant
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }

    const milestones = await prisma.milestone.findMany({
      where: {
        projectId: params.id,
        tenantId: session.user.tenantId,
      },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json({ milestones });
  } catch (error) {
    console.error('Get project milestones error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify project exists and belongs to tenant
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }

    const data = await request.json();
    const { name, description, dueDate, isCompleted = false } = data;

    if (!name || !dueDate) {
      return NextResponse.json(
        { error: 'Name und Fälligkeitsdatum sind erforderlich' },
        { status: 400 }
      );
    }

    const milestone = await prisma.milestone.create({
      data: {
        projectId: params.id,
        name,
        description,
        dueDate: new Date(dueDate),
        isCompleted,
        tenantId: session.user.tenantId,
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error('Create project milestone error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
