import { NextRequest, NextResponse } from 'next/server';
import { sanityWrite } from '@/lib/sanity'; // Ensure client has write access

export async function POST(req: NextRequest) {
  try {
    const { id, background_color } = await req.json();

    if (
      !id ||
      !background_color ||
      typeof background_color.hex !== 'string' ||
      !/^#[0-9A-Fa-f]{6}$/.test(background_color.hex)
    ) {
      return NextResponse.json(
        { error: 'Invalid ID or background_color format. Ensure it includes a valid .hex value.' },
        { status: 400 }
      );
    }

    // Patch the category document in Sanity
    await sanityWrite.patch(id).set({ background_color }).commit();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[updateCategoryColor] Error:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to update category background color' },
      { status: 500 }
    );
  }
}
