export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import mongoose, { Schema, model, models } from 'mongoose';
import crypto from 'crypto';

const AdminSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, default: 'admin' },
});
const Admin = models.Admin || model('Admin', AdminSchema);

const hash = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

// POST /api/auth — login
export async function POST(req: Request) {
  await dbConnect;
  const { username, password } = await req.json();

  if (!username?.trim() || !password?.trim())
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });

  const admin = await Admin.findOne({ username: username.trim() }).lean();
  if (!admin || (admin as any).password !== hash(password))
    return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });

  return NextResponse.json({ ok: true, role: (admin as any).role || 'admin' });
}

// DELETE /api/auth — remove an admin account
export async function DELETE(req: Request) {
  await dbConnect;
  const { username, secret } = await req.json();
  if (secret !== process.env.SETUP_SECRET)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  await Admin.deleteOne({ username: username.trim() });
  return NextResponse.json({ ok: true });
}

// PUT /api/auth — create or update admin (called once from setup)
export async function PUT(req: Request) {
  await dbConnect;
  const { username, password, secret, role } = await req.json();

  // Require a setup secret to prevent unauthorized access
  if (secret !== process.env.SETUP_SECRET)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

  if (!username?.trim() || !password?.trim())
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });

  const hashed = hash(password);
  await Admin.findOneAndUpdate(
    { username: username.trim() },
    { username: username.trim(), password: hashed, role: role || 'admin' },
    { upsert: true, new: true }
  );

  return NextResponse.json({ ok: true, message: 'Admin créé / mis à jour' });
}
