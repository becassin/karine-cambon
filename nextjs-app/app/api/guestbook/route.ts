// app/api/guestbook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: 'sculptures',
  apiVersion: '2024-06-01',
  useCdn: false,
  token: process.env.SANITY_API_IMAGE_PUBLICATOR_TOKEN!,
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, message } = body;

  if (!name || !message) {
    return NextResponse.json({ error: 'Missing name or message' }, { status: 400 });
  }

  if (body.email_confirm) {
    return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
  }

  try {
    const entry = await client.create({
      _type: 'guestEntry',
      name,
      message,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(entry, { status: 200 });
  } catch (err: any) {
    console.error('❌ Sanity create error:', err); // 👈 log the actual error
    return NextResponse.json({ error: 'Failed to create entry', details: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const entries = await client.fetch(
      `*[_type == "guestEntry"] | order(createdAt desc)[0...50]{
        _id,
        name,
        message,
        createdAt
      }`
    );
    return NextResponse.json(entries, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch entries', details: err.message }, { status: 500 });
  }
}
