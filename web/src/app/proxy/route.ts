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
      signal: AbortSignal.timeout(120000),
    });

    if (!upstreamResp.ok) {
      const errText = await upstreamResp.text();
      let formattedMsg = `上游模型服务返回错误 [HTTP ${upstreamResp.status}]`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed?.error?.message) {
          formattedMsg = `${formattedMsg}: ${parsed.error.message}`;
        } else if (parsed?.error) {
          formattedMsg = `${formattedMsg}: ${typeof parsed.error === 'string' ? parsed.error : JSON.stringify(parsed.error)}`;
        } else if (parsed?.message) {
          formattedMsg = `${formattedMsg}: ${parsed.message}`;
        }
      } catch {
        if (errText) {
          formattedMsg = `${formattedMsg}: ${errText.slice(0, 300)}`;
        }
      }
      return NextResponse.json({ error: formattedMsg }, { status: upstreamResp.status });
    }

    if (!upstreamResp.body) {
      return NextResponse.json({ error: '模型服务未返回响应数据体' }, { status: 502 });
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
    const isTimeout = err?.name === 'TimeoutError' || err?.name === 'AbortError' || err?.message?.includes('timeout');
    return NextResponse.json(
      {
        error: isTimeout
          ? '上游模型响应超时 (120s)。模型处理长上下文或思考耗时较长，请检查服务状态并稍后重试。'
          : (err?.message || '无法连接到模型服务，请检查网络连接或本地代理状态')
      },
      { status: isTimeout ? 504 : 502 }
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
