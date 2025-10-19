import { NextResponse } from 'next/server'
import { ai_logs as logs } from '@/data/ai-logs'

export async function GET() {
  return NextResponse.json(logs)
}
