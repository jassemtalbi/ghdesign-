import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import { Article } from '../../../lib/models';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect;
  const { id } = await params;
  const body = await req.json();
  const article = await Article.findByIdAndUpdate(id, body, { new: true }).lean();
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ...(article as any), id: (article as any)._id.toString() });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect;
  const { id } = await params;
  await Article.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
