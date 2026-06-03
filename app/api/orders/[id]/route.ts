export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import { Order } from '../../../lib/models';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect;
  const { id } = await params;
  const body = await req.json();
  const order = await Order.findOneAndUpdate({ id }, body, { new: true }).lean();
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(order);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect;
  const { id } = await params;
  await Order.findOneAndDelete({ id });
  return NextResponse.json({ ok: true });
}
