import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { id, newTitle } = await req.json();
  console.log('Im here 5');

  if (!id || !newTitle) {
    return NextResponse.json({ message: 'Missing id or newTitle' }, { status: 400 });
  }



  try {
    console.log('Updating document:', { id, newTitle });
    console.log(`Using Sanity API URL: https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/${process.env.NEXT_PUBLIC_SANITY_DATASET}`);

    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/${process.env.NEXT_PUBLIC_SANITY_DATASET}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SANITY_API_IMAGE_PUBLICATOR_TOKEN}`,
        },
        body: JSON.stringify({
          mutations: [
            {
              patch: {
                id,
                set: { title: newTitle },
              },
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log('Sanity response:', data);

    if (!response.ok) {
      return NextResponse.json({ message: data.message || 'Sanity update failed' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Document updated', result: data }, { status: 200 });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
  }

}
