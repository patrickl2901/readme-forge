// app/api/test-gemini/route.ts
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge'; // ← optional, aber sehr empfohlen (schneller + günstiger)

export async function GET() {
  try {
    const { text } = await generateText({
      model: google('models/gemini-2.5-flash'),
      prompt: 'Schreibe einen kurzen, professionellen README-Abschnitt für ein Next.js Projekt namens "ReadmeForge".',
    });

    return NextResponse.json({ success: true, generatedText: text });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
