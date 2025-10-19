import { NextResponse } from 'next/server'
import { members } from '@/data/members'

export async function GET() {
  return NextResponse.json(members)
}
