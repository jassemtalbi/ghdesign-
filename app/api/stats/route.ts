import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import mongoose, { Schema, model, models } from 'mongoose';

const StatSchema = new Schema({
  key:   { type: String, unique: true },
  value: { type: Number, default: 0 },
});
const Stat = models.Stat || model('Stat', StatSchema);

export async function GET() {
  await dbConnect;
  const stat = await Stat.findOne({ key: 'visits' }).lean() as any;
  return NextResponse.json({ visits: stat?.value ?? 0 });
}

export async function POST() {
  await dbConnect;
  const stat = await Stat.findOneAndUpdate(
    { key: 'visits' },
    { $inc: { value: 1 } },
    { upsert: true, new: true }
  ).lean() as any;
  return NextResponse.json({ visits: stat?.value ?? 1 });
}
