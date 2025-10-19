import { NextResponse } from 'next/server'
import { help_requests } from '@/data/help-requests'

export async function GET() {
  return NextResponse.json(help_requests)
}
