
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

    const members = await prisma.projectMember.findMany({
      where: {
        projectId: params.id,
        tenantId: session.user.tenantId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Get project members error:', error);
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
    const { userId, role = 'Member' } = data;

    if (!userId) {
      return NextResponse.json(
        { error: 'Benutzer-ID ist erforderlich' },
        { status: 400 }
      );
    }

    // Verify user exists and belongs to tenant
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: session.user.tenantId,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId: params.id,
        userId,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'Benutzer ist bereits Projektmitglied' },
        { status: 409 }
      );
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: params.id,
        userId,
        role,
        tenantId: session.user.tenantId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Add project member error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
