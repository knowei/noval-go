import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('target');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing target url parameter' }, { status: 400 });
  }

  try {
    const body = await req.text();
    const headers: Record<string, string> = {
      'Content-Type': req.headers.get('content-type') || 'application/json',
    };

    const auth = req.headers.get('authorization');
    if (auth) {
      headers['Authorization'] = auth;
    }

    const upstreamResp = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(25000),
    });

    if (!upstreamResp.ok) {
      const errText = await upstreamResp.text();
      return new Response(errText, {
        status: upstreamResp.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!upstreamResp.body) {
      return NextResponse.json({ error: 'Empty upstream body' }, { status: 502 });
    }

    return new Response(upstreamResp.body, {
      status: 200,
      headers: {
        'Content-Type': upstreamResp.headers.get('content-type') || 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err: any) {
    console.error('[Proxy Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to connect to upstream model provider' },
      { status: 502 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
