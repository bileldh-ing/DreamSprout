import { NextResponse, type NextRequest } from 'next/server';

/**
 * Optional HTTP Basic auth for the studio (STUDIO_BASIC_AUTH="user:password").
 * Production deployments should put the studio behind SSO or Supabase Auth with the studio role.
 */
export function proxy(req: NextRequest) {
  const creds = process.env.STUDIO_BASIC_AUTH;
  if (!creds) return NextResponse.next();
  const [scheme, encoded] = (req.headers.get('authorization') ?? '').split(' ');
  if (scheme === 'Basic' && encoded && atob(encoded) === creds) return NextResponse.next();
  return new NextResponse('Authentication required', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="DreamSprout Studio"' } });
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
