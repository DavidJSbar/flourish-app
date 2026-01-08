// Types for Local Opportunities arbitrage system

export type Marketplace = 'craigslist' | 'offerup' | 'facebook' | 'ebay'

export type OpportunityStatus = 'available' | 'contacted' | 'purchased' | 'listed' | 'sold' | 'passed'

export type OpportunityCategory =
  | 'electronics'
  | 'furniture'
  | 'vehicles'
  | 'appliances'
  | 'collectibles'
  | 'clothing'
  | 'tools'
  | 'sports'
  | 'other'

export interface Listing {
  id: string
  title: string
  description: string
  price: number
  source: Marketplace
  sourceUrl: string
  imageUrl?: string
  location: string
  postedAt: string
  category: OpportunityCategory
}

export interface EbayComparable {
  title: string
  soldPrice: number
  soldDate: string
  condition: string
  url: string
}

export interface ProfitAnalysis {
  estimatedSalePrice: number
  estimatedProfit: number
  profitMargin: number
  fees: {
    ebay: number
    shipping: number
    other: number
  }
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
}

export interface Opportunity {
  id: string
  listing: Listing
  ebayComparables: EbayComparable[]
  profitAnalysis: ProfitAnalysis
  score: number // 0-100 opportunity score
  urgency: 'high' | 'medium' | 'low'
  status: OpportunityStatus
  notes: string
  createdAt: string
  updatedAt: string
  purchasePrice?: number
  salePrice?: number
  actualProfit?: number
}

export interface OpportunityFilters {
  query?: string
  city?: string
  marketplaces?: Marketplace[]
  categories?: OpportunityCategory[]
  minProfit?: number
  maxPrice?: number
  minScore?: number
  status?: OpportunityStatus[]
}

export interface SearchParams {
  query: string
  city: string
  marketplaces: Marketplace[]
  categories?: OpportunityCategory[]
  maxResults?: number
}

export interface OpportunityStats {
  totalOpportunities: number
  totalPotentialProfit: number
  avgScore: number
  byStatus: Record<OpportunityStatus, number>
  byMarketplace: Record<Marketplace, number>
}

export const MARKETPLACE_LABELS: Record<Marketplace, string> = {
  craigslist: 'Craigslist',
  offerup: 'OfferUp',
  facebook: 'Facebook Marketplace',
  ebay: 'eBay',
}

export const CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  electronics: 'Electronics',
  furniture: 'Furniture',
  vehicles: 'Vehicles',
  appliances: 'Appliances',
  collectibles: 'Collectibles',
  clothing: 'Clothing',
  tools: 'Tools',
  sports: 'Sports & Outdoors',
  other: 'Other',
}

export const STATUS_LABELS: Record<OpportunityStatus, string> = {
  available: 'Available',
  contacted: 'Contacted',
  purchased: 'Purchased',
  listed: 'Listed for Sale',
  sold: 'Sold',
  passed: 'Passed',
}
