import { NextResponse } from 'next/server'
import { transfers } from '@/data/transfers'

export async function GET() {
  return NextResponse.json(transfers)
}
