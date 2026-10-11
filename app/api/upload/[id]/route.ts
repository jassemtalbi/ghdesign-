export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import mongoose, { Schema, model, models } from 'mongoose';
import sharp from 'sharp';

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

// In-memory LRU of already-resized variants: skips the MongoDB read + base64 decode + sharp
// work on repeat requests (dev server, and warm serverless instances).
const MAX_BYTES = 64 * 1024 * 1024;
const g = globalThis as unknown as { __imgCache?: { map: Map<string, Buffer>; bytes: number } };
const cache = (g.__imgCache ??= { map: new Map(), bytes: 0 });
const remember = (key: string, buf: Buffer) => {
  cache.map.set(key, buf);
  cache.bytes += buf.length;
  for (const [k, v] of cache.map) {
    if (cache.bytes <= MAX_BYTES) break;
    cache.map.delete(k);
    cache.bytes -= v.length;
  }
};
const webp = (buf: Buffer) => new NextResponse(new Uint8Array(buf), { headers: { 'Content-Type': 'image/webp', ...CACHE } });

// GET — serve image by id; ?w=<width> returns a resized WebP
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect;
  const { id } = await params;
  const w = Number(new URL(req.url).searchParams.get('w'));
  const width = w > 0 ? (WIDTHS.find(x => x >= w) ?? WIDTHS[WIDTHS.length - 1]) : 0;
  const key = `${id}:${width}`;
  const hit = width ? cache.map.get(key) : undefined;
  if (hit) {
    cache.map.delete(key); cache.map.set(key, hit); // refresh LRU position
    return webp(hit);
  }
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const img = await GHImage.findById(id).lean() as any;
  if (!img) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Parse data URL: "data:image/jpeg;base64,/9j/..."
  const [header, base64] = img.data.split(',');
  const mimeMatch = header.match(/data:([^;]+);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const buffer = Buffer.from(base64, 'base64');

  if (width) {
    try {
      const out = await sharp(buffer).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 68, effort: 3 }).toBuffer();
      remember(key, out);
      return webp(out);
    } catch {
      // fall through to the original
    }
  }

  return new NextResponse(buffer, { headers: { 'Content-Type': mime, ...CACHE } });
}
