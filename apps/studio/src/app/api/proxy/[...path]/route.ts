import { NextRequest, NextResponse } from 'next/server';

/**
 * Resolve the backend API base URL from any of the env var names
 * the user might have set. Tries all common variations.
 */
function getBackendUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_API_BASE_URL,
    process.env.API_BASE_URL,
    process.env.API_URL,
  ];

  for (const url of candidates) {
    if (url) {
      // Ensure URL ends with /api/v1
      if (url.endsWith('/api/v1')) return url;
      if (url.endsWith('/api/v1/')) return url.slice(0, -1);
      // If it's just the origin (e.g. https://metaforge-nou0.onrender.com)
      const cleaned = url.endsWith('/') ? url.slice(0, -1) : url;
      if (!cleaned.includes('/api/')) return `${cleaned}/api/v1`;
      return cleaned;
    }
  }

  return 'http://localhost:3001/api/v1';
}

const API_BACKEND_URL = getBackendUrl();

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
    // Skip hop-by-hop headers
    if (!['host', 'connection', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
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
    console.error('[API Proxy] Failed to reach backend at:', targetUrl, error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: `Failed to reach API backend at ${API_BACKEND_URL}`,
        },
      },
      { status: 502 }
    );
  }
}
