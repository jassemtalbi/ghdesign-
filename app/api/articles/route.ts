import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import { Article } from '../../lib/models';

export async function GET() {
  await dbConnect;
  const articles = await Article.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(articles.map(a => ({ ...a, id: (a as any)._id.toString() })));
}

export async function POST(req: Request) {
  await dbConnect;
  const body = await req.json();
  const article = await Article.create(body);
  return NextResponse.json({ ...article.toObject(), id: article._id.toString() }, { status: 201 });
}
