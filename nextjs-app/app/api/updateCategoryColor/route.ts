import { NextRequest, NextResponse } from 'next/server';
import { sanityWrite } from '@/lib/sanity'; // Ensure client has write access
import chroma from 'chroma-js';

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
    // Log the incoming color data for debugging
    console.log("Received color data:", background_color);


    // Use chroma.js to get full color models
    const color = chroma(background_color.hex);
    const hsl = color.hsl();
    const hsv = color.hsv();
    const rgb = color.rgb();

    // Prepare the full color object with all properties
    const fullColor = {
      _type: 'color',
      hex: background_color.hex,
      alpha: background_color.alpha,
      hsl: {
        _type: 'hslaColor',
        a: background_color.alpha,
        h: hsl[0],
        s: hsl[1],
        l: hsl[2],
      },
      hsv: {
        _type: 'hsvaColor',
        a: background_color.alpha,
        h: hsv[0],
        s: hsv[1],
        v: hsv[2],
      },
      rgb: {
        _type: 'rgbaColor',
        a: background_color.alpha,
        r: rgb[0],
        g: rgb[1],
        b: rgb[2],
      },
    };

    // Log the full color object to be saved
    console.log("Full color object to save:", fullColor);

    // Save to Sanity
    const result = await sanityWrite.patch(id).set({ background_color: fullColor }).commit();

    // Log result from Sanity
    console.log("Sanity result:", result);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[updateCategoryColor] Error:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to update category background color' },
      { status: 500 }
    );
  }
}
