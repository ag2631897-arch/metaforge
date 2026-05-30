import { NextRequest, NextResponse } from 'next/server';

const API_BACKEND_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:3001/api/v1';

/**
 * Next.js API proxy route that forwards all requests from the frontend
 * to the Render backend. This solves the cross-origin cookie problem:
 * the browser sends cookies to Vercel (same domain), and this proxy
 * forwards them server-side to the backend where @auth/core/jwt can
 * decode them.
 */
export async function GET(request: NextRequest) {
  return proxyRequest(request);
}

export async function POST(request: NextRequest) {
  return proxyRequest(request);
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request);
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request);
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request);
}

async function proxyRequest(request: NextRequest) {
  // Extract the path after /api/proxy/
  const url = new URL(request.url);
  const proxyPath = url.pathname.replace(/^\/api\/proxy/, '');
  const targetUrl = `${API_BACKEND_URL}${proxyPath}${url.search}`;

  // Forward headers including cookies
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    // Skip host-related headers
    if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  // Forward the cookie header explicitly
  const cookie = request.headers.get('cookie');
  if (cookie) {
    headers.set('cookie', cookie);
  }

  try {
    const body = request.method !== 'GET' && request.method !== 'HEAD'
      ? await request.arrayBuffer()
      : undefined;

    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });

    // Build the response with the backend's data
    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      // Don't forward transfer-encoding as Next.js handles this
      if (key.toLowerCase() !== 'transfer-encoding') {
        responseHeaders.set(key, value);
      }
    });

    const responseBody = await backendResponse.arrayBuffer();

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[API Proxy] Failed to reach backend:', error);
    return NextResponse.json(
      { success: false, error: { code: 'PROXY_ERROR', message: 'Failed to reach API backend' } },
      { status: 502 }
    );
  }
}
