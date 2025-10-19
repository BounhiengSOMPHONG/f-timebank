import { NextResponse } from 'next/server'
import { withdrawals } from '@/data/withdrawals'

export async function GET() {
  return NextResponse.json(withdrawals)
}
