export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import { Order } from '../../lib/models';
import { notifyAdmins } from '../notify/route';

export async function GET() {
  await dbConnect;
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  await dbConnect;
  const body = await req.json();
  const order = await Order.create({ ...body, id: `ORD-${Date.now()}`, createdAt: new Date().toISOString(), status: 'pending' });
  const obj = order.toObject();
  // Push real-time notification to all connected admins
  notifyAdmins({
    type: 'new_order',
    id: obj.id,
    customer: `${obj.customer.firstName} ${obj.customer.lastName}`,
    total: obj.total,
    city: obj.customer.city,
    wilaya: obj.customer.wilaya,
    createdAt: obj.createdAt,
  });
  return NextResponse.json(obj, { status: 201 });
}
