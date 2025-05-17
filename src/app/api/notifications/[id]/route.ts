import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const updated = await prisma.notification.update({
    where: { id: params.id },
    data: { read: true },
  });
  return NextResponse.json(updated);
}
