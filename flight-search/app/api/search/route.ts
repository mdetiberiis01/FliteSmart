import { NextRequest, NextResponse } from 'next/server';
import { orchestrateSearch } from '@/lib/search/orchestrator';
import { SearchParams } from '@/types/search';

export async function POST(request: NextRequest) {
  try {
    const body: SearchParams = await request.json();

    if (!body.origin || !body.destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    const results = await orchestrateSearch(body);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
