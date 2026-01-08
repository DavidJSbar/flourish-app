'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  TrendingUp,
  DollarSign,
  Clock,
  ExternalLink,
  Filter,
  Download,
  Upload,
  RefreshCw,
  MapPin,
  Star,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type {
  Opportunity,
  Marketplace,
  OpportunityStats,
} from '@/lib/opportunities'
import { MARKETPLACE_LABELS } from '@/lib/opportunities'

const MARKETPLACES: Marketplace[] = ['craigslist', 'offerup', 'facebook']

const CITIES = [
  'san francisco',
  'los angeles',
  'new york',
  'chicago',
  'seattle',
  'austin',
  'denver',
  'miami',
  'boston',
  'portland',
]

export default function OpportunitiesPage() {
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('san francisco')
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<Marketplace[]>([
    ...MARKETPLACES,
  ])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [stats, setStats] = useState<OpportunityStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [minProfit, setMinProfit] = useState('')
  const [minScore, setMinScore] = useState('')

  const toggleMarketplace = (marketplace: Marketplace) => {
    setSelectedMarketplaces((prev) =>
      prev.includes(marketplace)
        ? prev.filter((m) => m !== marketplace)
        : [...prev, marketplace]
    )
  }

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setError('Please enter a search term')
      return
    }

    if (selectedMarketplaces.length === 0) {
      setError('Please select at least one marketplace')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        query: query.trim(),
        city,
        marketplaces: selectedMarketplaces.join(','),
      })

      const response = await fetch(`/api/opportunities?${params}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Search failed')
      }

      let filteredOpportunities = result.data.opportunities

      // Apply client-side filters
      if (minProfit) {
        filteredOpportunities = filteredOpportunities.filter(
          (opp: Opportunity) =>
            opp.profitAnalysis.estimatedProfit >= parseFloat(minProfit)
        )
      }

      if (minScore) {
        filteredOpportunities = filteredOpportunities.filter(
          (opp: Opportunity) => opp.score >= parseInt(minScore, 10)
        )
      }

      setOpportunities(filteredOpportunities)
      setStats(result.data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsLoading(false)
    }
  }, [query, city, selectedMarketplaces, minProfit, minScore])

  const handleExport = () => {
    if (opportunities.length === 0) return

    const exportData = {
      exportedAt: new Date().toISOString(),
      count: opportunities.length,
      opportunities,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `opportunities-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        const imported = data.opportunities || data
        if (Array.isArray(imported)) {
          setOpportunities(imported)
          setError(null)
        } else {
          setError('Invalid file format')
        }
      } catch {
        setError('Failed to parse file')
      }
    }
    reader.readAsText(file)
  }

  const getUrgencyColor = (urgency: 'high' | 'medium' | 'low') => {
    switch (urgency) {
      case 'high':
        return 'text-red-500 bg-red-500/10'
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10'
      case 'low':
        return 'text-green-500 bg-green-500/10'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight">
            Local Opportunities
          </h1>
          <p className="text-muted-foreground mt-2">
            Find arbitrage opportunities across local marketplaces
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="size-5" />
                Search Marketplaces
              </CardTitle>
              <CardDescription>
                Search for items across Craigslist, OfferUp, and Facebook
                Marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Search for items (e.g., Nintendo Switch, iPhone, furniture)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isLoading}>
                  {isLoading ? (
                    <RefreshCw className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}
                  Search
                </Button>
              </div>

              {/* City Selection */}
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-background border rounded-md px-3 py-1.5 text-sm"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Marketplace Selection */}
              <div className="flex flex-wrap gap-2">
                {MARKETPLACES.map((marketplace) => (
                  <button
                    key={marketplace}
                    onClick={() => toggleMarketplace(marketplace)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedMarketplaces.includes(marketplace)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {MARKETPLACE_LABELS[marketplace]}
                  </button>
                ))}
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Filter className="size-4" />
                Advanced Filters
                <ChevronDown
                  className={`size-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="grid grid-cols-2 gap-4 pt-2"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Min Profit ($)
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={minProfit}
                        onChange={(e) => setMinProfit(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Min Score (0-100)
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        max="100"
                        value={minScore}
                        onChange={(e) => setMinScore(e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2"
          >
            <AlertCircle className="size-4" />
            {error}
          </motion.div>
        )}

        {/* Stats Section */}
        {stats && opportunities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Search className="size-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.totalOpportunities}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Opportunities
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="size-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      ${stats.totalPotentialProfit.toFixed(0)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Potential Profit
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Star className="size-5 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.avgScore.toFixed(0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={opportunities.length === 0}
                  >
                    <Download className="size-4" />
                    Export
                  </Button>
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="size-4" />
                        Import
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results Section */}
        {opportunities.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold">
              Found {opportunities.length} Opportunities
            </h2>

            <div className="grid gap-4">
              {opportunities.map((opp, index) => (
                <motion.div
                  key={opp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Listing Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {opp.listing.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {opp.listing.description.slice(0, 100)}...
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(opp.urgency)}`}
                            >
                              {opp.urgency.toUpperCase()}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <MapPin className="size-4" />
                              {opp.listing.location}
                            </span>
                            <span className="text-muted-foreground">
                              {MARKETPLACE_LABELS[opp.listing.source]}
                            </span>
                            <span className="text-muted-foreground">
                              <Clock className="size-3 inline mr-1" />
                              {new Date(opp.listing.postedAt).toLocaleDateString()}
                            </span>
                          </div>

                          <a
                            href={opp.listing.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            View Listing
                            <ExternalLink className="size-3" />
                          </a>
                        </div>

                        {/* Profit Analysis */}
                        <div className="md:w-64 space-y-3 md:border-l md:pl-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Score
                            </span>
                            <span
                              className={`text-lg font-bold ${getScoreColor(opp.score)}`}
                            >
                              {opp.score}/100
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Buy Price
                            </span>
                            <span className="font-semibold">
                              ${opp.listing.price}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Est. Sale
                            </span>
                            <span className="font-semibold">
                              ${opp.profitAnalysis.estimatedSalePrice.toFixed(0)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-t pt-2">
                            <span className="text-sm font-medium">
                              Est. Profit
                            </span>
                            <span className="text-lg font-bold text-green-500">
                              ${opp.profitAnalysis.estimatedProfit.toFixed(0)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {opp.profitAnalysis.confidence === 'high' ? (
                              <CheckCircle2 className="size-3 text-green-500" />
                            ) : (
                              <AlertCircle className="size-3 text-yellow-500" />
                            )}
                            {opp.profitAnalysis.confidence} confidence
                            <span className="mx-1">|</span>
                            {opp.ebayComparables.length} eBay sales
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && opportunities.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <TrendingUp className="size-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No opportunities yet</h3>
            <p className="text-muted-foreground mt-1">
              Search for items to find arbitrage opportunities
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
