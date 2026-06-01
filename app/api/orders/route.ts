export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import { Order } from '../../lib/models';

export async function GET() {
  await dbConnect;
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  await dbConnect;
  const body = await req.json();
  const order = await Order.create({ ...body, id: `ORD-${Date.now()}`, createdAt: new Date().toISOString(), status: 'pending' });
  return NextResponse.json(order.toObject(), { status: 201 });
}
