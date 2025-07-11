import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { client } from "@/sanity/lib/client";
import { v4 as uuid } from 'uuid';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { name, email, message } = await req.json();

  const resendEmail = process.env.RESEND_EMAIL;
  if (!resendEmail) {
    return NextResponse.json({ error: 'Missing RESEND_EMAIL environment variable' }, { status: 500 });
  }

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    // Send email
    await resend.emails.send({
      from: `Website Contact <${resendEmail}>`,
      to: resendEmail,
      subject: `New message from ${name}`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
    });

    // Save to Sanity
    await client.create({
      _type: 'contactMessage',
      _id: uuid(), // Optional: unique ID
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 });
  }
}
