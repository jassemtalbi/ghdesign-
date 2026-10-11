export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import dbConnect from '../../../lib/mongodb';
import mongoose, { Schema, model, models } from 'mongoose';

const ImageSchema = new Schema({
  data:      { type: String, required: true },
  articleId: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
});
const GHImage = models.GHImage || model('GHImage', ImageSchema);

// Allowed thumbnail widths (keeps the number of cached variants small)
const WIDTHS = [128, 256, 384, 640, 828, 1080, 1600];

// Cached by browsers and by the Vercel CDN, so MongoDB + resize run once per variant
const CACHE = {
  'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
  'CDN-Cache-Control': 'public, max-age=31536000, immutable',
};

// GET — serve image by id; ?w=<width> returns a resized WebP
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect;
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const img = await GHImage.findById(id).lean() as any;
  if (!img) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Parse data URL: "data:image/jpeg;base64,/9j/..."
  const [header, base64] = img.data.split(',');
  const mimeMatch = header.match(/data:([^;]+);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const buffer = Buffer.from(base64, 'base64');

  const w = Number(new URL(req.url).searchParams.get('w'));
  if (w > 0) {
    const width = WIDTHS.find(x => x >= w) ?? WIDTHS[WIDTHS.length - 1];
    try {
      const out = await sharp(buffer).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 72 }).toBuffer();
      return new NextResponse(new Uint8Array(out), { headers: { 'Content-Type': 'image/webp', ...CACHE } });
    } catch {
      // fall through to the original
    }
  }

  return new NextResponse(buffer, { headers: { 'Content-Type': mime, ...CACHE } });
}
