import { NextRequest } from 'next/server';
import { orchestrateSearch } from '@/lib/search/orchestrator';
import type { SearchParams } from '@/types/search';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const params: SearchParams = await req.json();

  if (!params.origin || !params.destination) {
    return new Response(JSON.stringify({ error: 'Missing origin or destination' }), { status: 400 });
  }

  const userIp = req.headers.get('x-forwarded-for') ?? undefined;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch {
          // client disconnected
        }
      };

      try {
        await orchestrateSearch(params, userIp, (batch) => send({ results: batch }));
        send({ done: true });
      } catch (err) {
        send({ error: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
