import { NextRequest, NextResponse } from 'next/server'
import {
  searchOpportunities,
  filterOpportunities,
  calculateOpportunityStats,
  exportOpportunities,
  importOpportunities,
  type SearchParams,
  type OpportunityFilters,
  type Marketplace,
} from '@/lib/opportunities'

// GET - Search for opportunities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const query = searchParams.get('query') || ''
    const city = searchParams.get('city') || 'san francisco'
    const marketplacesParam = searchParams.get('marketplaces')
    const marketplaces: Marketplace[] = marketplacesParam
      ? (marketplacesParam.split(',') as Marketplace[])
      : ['craigslist', 'offerup', 'facebook']

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const params: SearchParams = {
      query,
      city,
      marketplaces,
    }

    const opportunities = await searchOpportunities(params)
    const stats = calculateOpportunityStats(opportunities)

    return NextResponse.json({
      success: true,
      data: {
        opportunities,
        stats,
        searchParams: params,
      },
    })
  } catch (error) {
    console.error('Error searching opportunities:', error)
    return NextResponse.json(
      { error: 'Failed to search opportunities' },
      { status: 500 }
    )
  }
}

// POST - Filter existing opportunities or import data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'filter') {
      const { opportunities, filters } = body as {
        opportunities: ReturnType<typeof searchOpportunities> extends Promise<infer T> ? T : never
        filters: OpportunityFilters
      }

      const filtered = filterOpportunities(await opportunities, filters)
      const stats = calculateOpportunityStats(filtered)

      return NextResponse.json({
        success: true,
        data: {
          opportunities: filtered,
          stats,
        },
      })
    }

    if (action === 'export') {
      const { opportunities } = body
      const exported = exportOpportunities(opportunities)

      return new NextResponse(exported, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="opportunities-${new Date().toISOString().split('T')[0]}.json"`,
        },
      })
    }

    if (action === 'import') {
      const { data } = body
      const imported = importOpportunities(data)

      return NextResponse.json({
        success: true,
        data: {
          opportunities: imported,
          count: imported.length,
        },
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing opportunities:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
