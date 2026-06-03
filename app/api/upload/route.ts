export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import mongoose, { Schema, model, models } from 'mongoose';

const ImageSchema = new Schema({
  data:      { type: String, required: true }, // base64 data URL
  articleId: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

if (process.env.NODE_ENV === 'development') {
  delete (models as any).GHImage;
}
const GHImage = models.GHImage || model('GHImage', ImageSchema);

// POST — upload one image, returns its URL (/api/upload/[id])
export async function POST(req: Request) {
  await dbConnect;
  const { data, articleId } = await req.json();
  if (!data) return NextResponse.json({ error: 'No data' }, { status: 400 });
  const img = await GHImage.create({ data, articleId: articleId || '' });
  const url = `/api/upload/${img._id.toString()}`;
  return NextResponse.json({ url, id: img._id.toString() }, { status: 201 });
}
