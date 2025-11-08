import { NextResponse } from 'next/server'

export async function GET() {
  // Temporary: return empty list. Replace with DB or real data source as needed.
  return NextResponse.json([])
}
