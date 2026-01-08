// Local Opportunities service for marketplace arbitrage
import type {
  Opportunity,
  Listing,
  EbayComparable,
  ProfitAnalysis,
  SearchParams,
  OpportunityFilters,
  OpportunityStats,
  Marketplace,
} from './types'

// Calculate opportunity score based on profit potential, urgency, and confidence
export function calculateOpportunityScore(
  listing: Listing,
  profitAnalysis: ProfitAnalysis,
  ebayComparables: EbayComparable[]
): number {
  let score = 0

  // Profit margin contribution (0-40 points)
  if (profitAnalysis.profitMargin >= 100) score += 40
  else if (profitAnalysis.profitMargin >= 75) score += 35
  else if (profitAnalysis.profitMargin >= 50) score += 30
  else if (profitAnalysis.profitMargin >= 30) score += 20
  else if (profitAnalysis.profitMargin >= 15) score += 10

  // Absolute profit contribution (0-25 points)
  if (profitAnalysis.estimatedProfit >= 200) score += 25
  else if (profitAnalysis.estimatedProfit >= 100) score += 20
  else if (profitAnalysis.estimatedProfit >= 50) score += 15
  else if (profitAnalysis.estimatedProfit >= 25) score += 10
  else if (profitAnalysis.estimatedProfit >= 10) score += 5

  // Confidence contribution (0-20 points)
  if (profitAnalysis.confidence === 'high') score += 20
  else if (profitAnalysis.confidence === 'medium') score += 12
  else score += 5

  // Number of comparables (0-15 points)
  if (ebayComparables.length >= 5) score += 15
  else if (ebayComparables.length >= 3) score += 10
  else if (ebayComparables.length >= 1) score += 5

  return Math.min(score, 100)
}

// Determine urgency based on price, category, and market demand
export function determineUrgency(
  listing: Listing,
  profitAnalysis: ProfitAnalysis,
  score: number
): 'high' | 'medium' | 'low' {
  // High urgency: great deal that won't last
  if (score >= 80 && profitAnalysis.profitMargin >= 75) return 'high'
  if (listing.price < 50 && profitAnalysis.estimatedProfit >= 50) return 'high'

  // Medium urgency: good opportunity
  if (score >= 60 || profitAnalysis.profitMargin >= 40) return 'medium'

  return 'low'
}

// Calculate profit analysis including fees
export function calculateProfitAnalysis(
  listing: Listing,
  ebayComparables: EbayComparable[]
): ProfitAnalysis {
  if (ebayComparables.length === 0) {
    return {
      estimatedSalePrice: listing.price * 1.5,
      estimatedProfit: 0,
      profitMargin: 0,
      fees: { ebay: 0, shipping: 0, other: 0 },
      confidence: 'low',
      reasoning: 'No comparable sales found on eBay',
    }
  }

  // Calculate average sold price from comparables
  const avgSoldPrice =
    ebayComparables.reduce((sum, c) => sum + c.soldPrice, 0) /
    ebayComparables.length

  // Estimate fees (eBay ~13%, shipping ~$10-15, other ~$5)
  const ebayFees = avgSoldPrice * 0.13
  const shippingFees = Math.min(avgSoldPrice * 0.1, 25)
  const otherFees = 5

  const totalFees = ebayFees + shippingFees + otherFees
  const estimatedProfit = avgSoldPrice - listing.price - totalFees
  const profitMargin =
    listing.price > 0 ? (estimatedProfit / listing.price) * 100 : 0

  // Determine confidence based on number and recency of comparables
  let confidence: 'high' | 'medium' | 'low' = 'low'
  if (ebayComparables.length >= 5) confidence = 'high'
  else if (ebayComparables.length >= 3) confidence = 'medium'

  // Check price variance
  const prices = ebayComparables.map((c) => c.soldPrice)
  const priceVariance =
    (Math.max(...prices) - Math.min(...prices)) / avgSoldPrice
  if (priceVariance > 0.3) {
    confidence = confidence === 'high' ? 'medium' : 'low'
  }

  const reasoning = `Based on ${ebayComparables.length} recent eBay sales averaging $${avgSoldPrice.toFixed(2)}. ${
    confidence === 'high'
      ? 'Strong market data with consistent pricing.'
      : confidence === 'medium'
        ? 'Moderate market data, prices may vary.'
        : 'Limited market data, proceed with caution.'
  }`

  return {
    estimatedSalePrice: avgSoldPrice,
    estimatedProfit: Math.max(0, estimatedProfit),
    profitMargin: Math.max(0, profitMargin),
    fees: {
      ebay: ebayFees,
      shipping: shippingFees,
      other: otherFees,
    },
    confidence,
    reasoning,
  }
}

// Generate mock listings for demo purposes
// In production, this would call actual marketplace APIs/scrapers
export function generateMockListings(params: SearchParams): Listing[] {
  const mockData: Listing[] = [
    {
      id: '1',
      title: `${params.query} - Great Condition`,
      description: `Used ${params.query} in excellent working condition. Selling because upgrading.`,
      price: Math.floor(Math.random() * 200) + 50,
      source: 'craigslist',
      sourceUrl: `https://craigslist.org/${params.city}/item/1`,
      imageUrl: 'https://placehold.co/400x300?text=Item+Photo',
      location: params.city,
      postedAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
      category: 'electronics',
    },
    {
      id: '2',
      title: `${params.query} - Must Go Today!`,
      description: `Moving sale! ${params.query} barely used. Pick up only.`,
      price: Math.floor(Math.random() * 150) + 30,
      source: 'offerup',
      sourceUrl: `https://offerup.com/item/2`,
      imageUrl: 'https://placehold.co/400x300?text=Item+Photo',
      location: params.city,
      postedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      category: 'electronics',
    },
    {
      id: '3',
      title: `Vintage ${params.query}`,
      description: `Rare vintage ${params.query}. Collectors item in working condition.`,
      price: Math.floor(Math.random() * 300) + 100,
      source: 'facebook',
      sourceUrl: `https://facebook.com/marketplace/item/3`,
      imageUrl: 'https://placehold.co/400x300?text=Item+Photo',
      location: params.city,
      postedAt: new Date(Date.now() - Math.random() * 86400000 * 5).toISOString(),
      category: 'collectibles',
    },
    {
      id: '4',
      title: `${params.query} Bundle Deal`,
      description: `Includes ${params.query} plus accessories. Great starter kit.`,
      price: Math.floor(Math.random() * 100) + 25,
      source: 'craigslist',
      sourceUrl: `https://craigslist.org/${params.city}/item/4`,
      imageUrl: 'https://placehold.co/400x300?text=Item+Photo',
      location: params.city,
      postedAt: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
      category: 'electronics',
    },
    {
      id: '5',
      title: `Like New ${params.query}`,
      description: `Barely used ${params.query}. Comes with original box and manual.`,
      price: Math.floor(Math.random() * 175) + 75,
      source: 'offerup',
      sourceUrl: `https://offerup.com/item/5`,
      imageUrl: 'https://placehold.co/400x300?text=Item+Photo',
      location: params.city,
      postedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      category: 'electronics',
    },
  ]

  // Filter by selected marketplaces
  return mockData.filter((listing) =>
    params.marketplaces.includes(listing.source)
  )
}

// Generate mock eBay comparables for demo purposes
// In production, this would call eBay's Browse API or scrape sold listings
export function generateMockEbayComparables(listing: Listing): EbayComparable[] {
  const basePrice = listing.price * (1.5 + Math.random() * 0.5)
  const numComparables = Math.floor(Math.random() * 5) + 2

  return Array.from({ length: numComparables }, (_, i) => ({
    title: `${listing.title} - Similar`,
    soldPrice: basePrice * (0.9 + Math.random() * 0.2),
    soldDate: new Date(
      Date.now() - Math.random() * 86400000 * 30
    ).toISOString(),
    condition: Math.random() > 0.5 ? 'Used' : 'Pre-owned',
    url: `https://ebay.com/itm/${listing.id}${i}`,
  }))
}

// Search for opportunities across marketplaces
export async function searchOpportunities(
  params: SearchParams
): Promise<Opportunity[]> {
  // In production, this would make parallel calls to marketplace APIs
  const listings = generateMockListings(params)

  const opportunities: Opportunity[] = listings.map((listing) => {
    const ebayComparables = generateMockEbayComparables(listing)
    const profitAnalysis = calculateProfitAnalysis(listing, ebayComparables)
    const score = calculateOpportunityScore(listing, profitAnalysis, ebayComparables)
    const urgency = determineUrgency(listing, profitAnalysis, score)

    return {
      id: listing.id,
      listing,
      ebayComparables,
      profitAnalysis,
      score,
      urgency,
      status: 'available',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })

  // Sort by score descending
  return opportunities.sort((a, b) => b.score - a.score)
}

// Filter opportunities based on criteria
export function filterOpportunities(
  opportunities: Opportunity[],
  filters: OpportunityFilters
): Opportunity[] {
  return opportunities.filter((opp) => {
    if (
      filters.query &&
      !opp.listing.title.toLowerCase().includes(filters.query.toLowerCase())
    ) {
      return false
    }

    if (
      filters.city &&
      !opp.listing.location.toLowerCase().includes(filters.city.toLowerCase())
    ) {
      return false
    }

    if (
      filters.marketplaces &&
      filters.marketplaces.length > 0 &&
      !filters.marketplaces.includes(opp.listing.source)
    ) {
      return false
    }

    if (
      filters.categories &&
      filters.categories.length > 0 &&
      !filters.categories.includes(opp.listing.category)
    ) {
      return false
    }

    if (
      filters.minProfit !== undefined &&
      opp.profitAnalysis.estimatedProfit < filters.minProfit
    ) {
      return false
    }

    if (
      filters.maxPrice !== undefined &&
      opp.listing.price > filters.maxPrice
    ) {
      return false
    }

    if (filters.minScore !== undefined && opp.score < filters.minScore) {
      return false
    }

    if (
      filters.status &&
      filters.status.length > 0 &&
      !filters.status.includes(opp.status)
    ) {
      return false
    }

    return true
  })
}

// Calculate stats for a set of opportunities
export function calculateOpportunityStats(
  opportunities: Opportunity[]
): OpportunityStats {
  const byStatus: Record<string, number> = {
    available: 0,
    contacted: 0,
    purchased: 0,
    listed: 0,
    sold: 0,
    passed: 0,
  }

  const byMarketplace: Record<string, number> = {
    craigslist: 0,
    offerup: 0,
    facebook: 0,
    ebay: 0,
  }

  let totalProfit = 0
  let totalScore = 0

  opportunities.forEach((opp) => {
    byStatus[opp.status]++
    byMarketplace[opp.listing.source]++
    totalProfit += opp.profitAnalysis.estimatedProfit
    totalScore += opp.score
  })

  return {
    totalOpportunities: opportunities.length,
    totalPotentialProfit: totalProfit,
    avgScore:
      opportunities.length > 0 ? totalScore / opportunities.length : 0,
    byStatus: byStatus as Record<string, number>,
    byMarketplace: byMarketplace as Record<Marketplace, number>,
  }
}

// Export opportunities to JSON format
export function exportOpportunities(opportunities: Opportunity[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      count: opportunities.length,
      opportunities,
    },
    null,
    2
  )
}

// Import opportunities from JSON format
export function importOpportunities(jsonData: string): Opportunity[] {
  try {
    const data = JSON.parse(jsonData)
    if (Array.isArray(data.opportunities)) {
      return data.opportunities
    }
    if (Array.isArray(data)) {
      return data
    }
    throw new Error('Invalid format')
  } catch {
    throw new Error('Failed to parse opportunities data')
  }
}
