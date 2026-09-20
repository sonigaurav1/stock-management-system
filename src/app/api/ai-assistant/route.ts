/**
 * AI Assistant API Route
 * Streaming endpoint powered by Google Gemini (free tier)
 * Used by the AIAssistantPanel in the premium header
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const SYSTEM_PROMPT = `You are Invento AI, an intelligent business assistant embedded inside Invento — a premium stock and inventory management system.

Your role is to help business owners and managers:
- Understand their inventory health (stock levels, low stock, overstock)
- Analyze sales trends and revenue performance
- Identify products that need reordering
- Understand customer and supplier relationships
- Generate insights from their business data
- Navigate and use the Invento platform effectively

Guidelines:
- Be concise, data-focused, and professional
- Use bullet points and short paragraphs for readability
- When the user provides context about their current page or data, use it to give specific insights
- If you don't have specific data, give actionable advice based on general inventory management best practices
- Respond in the same language the user writes in
- Keep responses under 200 words unless a detailed explanation is specifically needed
- Use emojis sparingly and only when they add clarity (e.g., ⚠️ for warnings, ✅ for good status)
- Always end with 1 follow-up suggestion when relevant`;

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    const apiKey =
      process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      // Fallback response when GEMINI_API_KEY is not set in .env.local
      const googleMissingMsg = `⚠️ **API Key Missing**\n\nPlease add your free Gemini API key to your \`.env.local\` file:\n\`\`\`env\nGEMINI_API_KEY=your_key_here\n\`\`\`\nYou can get a free key instantly from [ai.google.dev](https://aistudio.google.com/app/apikey).`;

      return new Response(`0:${JSON.stringify(googleMissingMsg)}\n`, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Vercel-AI-Data-Stream': 'v1'
        }
      });
    }

    const google = createGoogleGenerativeAI({ apiKey });

    // Build context prefix for the system prompt
    const contextNote = context
      ? `\n\nCurrent user context:\n- Page: ${context.page}\n- Page title: ${context.pageTitle ?? context.page}${context.summary ? `\n- Data summary: ${context.summary}` : ''}`
      : '';

    // Use gemini-1.5-flash (standard stable fast model for Gemini free tier)
    const result = streamText({
      model: google('gemini-1.5-flash'),
      system: SYSTEM_PROMPT + contextNote,
      messages,
      onError: ({ error }) => {
        console.error('AI Assistant streaming error:', error);
      }
    });

    return (result as any).toDataStreamResponse({
      getErrorMessage: (err: any) => {
        return err instanceof Error ? err.message : String(err);
      }
    });
  } catch (err: any) {
    console.error('AI Assistant route error:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
