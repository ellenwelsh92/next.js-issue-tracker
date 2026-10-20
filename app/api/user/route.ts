import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// GET for api/user
export const GET = () => {
  return NextResponse.json({ data: { message: 'hello' } })
}

// https://httpie.io/
export const POST = async (req: NextRequest) => {
  const data = await req.json()
  const header = (await headers()).get('Authorization')
  console.log('header', header)
  return NextResponse.json(data)
}
