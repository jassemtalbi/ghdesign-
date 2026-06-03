export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import mongoose, { Schema, model, models } from 'mongoose';

const ImageSchema = new Schema({
  data:      { type: String, required: true },
  articleId: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
});
const GHImage = models.GHImage || model('GHImage', ImageSchema);

// GET — serve image by id
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect;
  const { id } = await params;
  const img = await GHImage.findById(id).lean() as any;
  if (!img) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Parse data URL: "data:image/jpeg;base64,/9j/..."
  const [header, base64] = img.data.split(',');
  const mimeMatch = header.match(/data:([^;]+);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const buffer = Buffer.from(base64, 'base64');

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
