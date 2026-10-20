import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const middleware = async (request: NextRequest) => {
  if (request.nextUrl.pathname.startsWith('/api')) {
    const authHeader = (await headers()).get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization header is required',
        },
        { status: 401 },
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
