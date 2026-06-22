export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import { Schema, model, models } from 'mongoose';

const AdminSchema = new Schema({
  username:       { type: String, required: true, unique: true },
  password:       { type: String, required: true },
  role:           { type: String, default: 'admin' },
  sessionVersion: { type: Number, default: 0 },
});
const Admin = models.Admin || model('Admin', AdminSchema);

// POST /api/auth/force-logout — bump sessionVersion for every admin except the caller
export async function POST(req: Request) {
  await dbConnect;
  const { username } = await req.json();
  if (!username?.trim())
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });

  const result = await Admin.updateMany(
    { username: { $ne: username.trim() } },
    { $inc: { sessionVersion: 1 } }
  );

  return NextResponse.json({ ok: true, affected: result.modifiedCount });
}
