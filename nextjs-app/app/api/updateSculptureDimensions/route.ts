// app/api/updateSculptureDimensions/route.ts
import { NextResponse } from 'next/server';
import { sanityWrite } from '@/lib/sanity'; // use the write client

export async function POST(req: Request) {
  const { id, top, left, left_percentage, width, width_percentage, height } = await req.json();

  if (!id || [top, left, width, height].some((v) => typeof v !== 'number')) {
    return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
  }

  try {
    await sanityWrite.patch(id).set({ top, left, left_percentage, width, width_percentage, height }).commit();

    return NextResponse.json({ message: 'Dimensions updated' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
