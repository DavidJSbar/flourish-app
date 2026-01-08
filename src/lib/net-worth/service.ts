// Net Worth service for tracking assets and liabilities
import type {
  Account,
  AccountType,
  NetWorthSummary,
} from './types'
import { ACCOUNT_TYPE_CATEGORY, ASSET_TYPES, LIABILITY_TYPES } from './types'

// Calculate net worth from accounts
export function calculateNetWorth(accounts: Account[]): {
  totalAssets: number
  totalLiabilities: number
  netWorth: number
} {
  let totalAssets = 0
  let totalLiabilities = 0

  accounts.forEach((account) => {
    if (account.category === 'asset') {
      totalAssets += account.balance
    } else {
      totalLiabilities += Math.abs(account.balance)
    }
  })

  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
  }
}

// Calculate breakdown by account type
export function calculateBreakdown(
  accounts: Account[],
  category: 'asset' | 'liability'
): { type: AccountType; total: number; percentage: number }[] {
  const filteredAccounts = accounts.filter((a) => a.category === category)
  const total = filteredAccounts.reduce((sum, a) => sum + Math.abs(a.balance), 0)

  const types = category === 'asset' ? ASSET_TYPES : LIABILITY_TYPES
  const breakdown = types
    .map((type) => {
      const typeTotal = filteredAccounts
        .filter((a) => a.type === type)
        .reduce((sum, a) => sum + Math.abs(a.balance), 0)

      return {
        type,
        total: typeTotal,
        percentage: total > 0 ? (typeTotal / total) * 100 : 0,
      }
    })
    .filter((b) => b.total > 0)

  return breakdown.sort((a, b) => b.total - a.total)
}

// Calculate change from previous period
export function calculateChange(
  currentNetWorth: number,
  previousNetWorth: number
): { amount: number; percentage: number } {
  const amount = currentNetWorth - previousNetWorth
  const percentage =
    previousNetWorth !== 0 ? (amount / Math.abs(previousNetWorth)) * 100 : 0

  return { amount, percentage }
}

// Generate mock accounts for demo
export function generateMockAccounts(): Account[] {
  const now = new Date().toISOString()

  return [
    {
      id: '1',
      userId: 'demo',
      name: 'Chase Checking',
      type: 'checking',
      category: 'asset',
      balance: 5420.50,
      isManual: false,
      institution: 'Chase',
      lastUpdated: now,
      createdAt: now,
    },
    {
      id: '2',
      userId: 'demo',
      name: 'Ally Savings',
      type: 'savings',
      category: 'asset',
      balance: 15750.00,
      isManual: false,
      institution: 'Ally Bank',
      lastUpdated: now,
      createdAt: now,
    },
    {
      id: '3',
      userId: 'demo',
      name: 'Fidelity 401(k)',
      type: 'investment',
      category: 'asset',
      balance: 87500.00,
      isManual: false,
      institution: 'Fidelity',
      lastUpdated: now,
      createdAt: now,
    },
    {
      id: '4',
      userId: 'demo',
      name: 'Vanguard Brokerage',
      type: 'investment',
      category: 'asset',
      balance: 32100.00,
      isManual: false,
      institution: 'Vanguard',
      lastUpdated: now,
      createdAt: now,
    },
    {
      id: '5',
      userId: 'demo',
      name: 'Home Value',
      type: 'real_estate',
      category: 'asset',
      balance: 425000.00,
      isManual: true,
      lastUpdated: now,
      createdAt: now,
    },
    {
      id: '6',
      userId: 'demo',
      name: 'Honda Civic',
      type: 'vehicle',
      category: 'asset',
      balance: 18500.00,
      isManual: true,
      lastUpdated: now,
      createdAt: now,
    },
    {
      id: '7',
      userId: 'demo',
      name: 'Chase Sapphire',
      type: 'credit_card',
      category: 'liability',
      balance: 2340.00,
      isManual: false,
      institution: 'Chase',
      lastUpdated: now,
      createdAt: now,
    },
    {
      id: '8',
      userId: 'demo',
      name: 'Apple Card',
      type: 'credit_card',
      category: 'liability',
      balance: 890.00,
      isManual: false,
      institution: 'Goldman Sachs',
      lastUpdated: now,
      createdAt: now,
    },
    {
      id: '9',
      userId: 'demo',
      name: 'Home Mortgage',
      type: 'mortgage',
      category: 'liability',
      balance: 298000.00,
      isManual: true,
      institution: 'Bank of America',
      lastUpdated: now,
      createdAt: now,
    },
    {
      id: '10',
      userId: 'demo',
      name: 'Student Loan',
      type: 'loan',
      category: 'liability',
      balance: 24500.00,
      isManual: false,
      institution: 'Navient',
      lastUpdated: now,
      createdAt: now,
    },
  ]
}

// Generate historical net worth data for charting
export function generateHistoricalData(
  currentNetWorth: number,
  months: number = 12
): { date: string; netWorth: number; assets: number; liabilities: number }[] {
  const history: { date: string; netWorth: number; assets: number; liabilities: number }[] = []
  const now = new Date()

  // Generate data going back 'months' months
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)

    // Simulate some growth with slight variations
    const growthFactor = 1 - (i * 0.015) + (Math.random() * 0.02 - 0.01)
    const netWorth = currentNetWorth * growthFactor

    // Rough estimates for assets/liabilities based on typical ratios
    const assets = netWorth * 1.8
    const liabilities = assets - netWorth

    history.push({
      date: date.toISOString().split('T')[0],
      netWorth: Math.round(netWorth),
      assets: Math.round(assets),
      liabilities: Math.round(liabilities),
    })
  }

  return history
}

// Get full net worth summary
export function getNetWorthSummary(accounts: Account[]): NetWorthSummary {
  const { totalAssets, totalLiabilities, netWorth } = calculateNetWorth(accounts)

  // Calculate previous month's net worth (simulated as 2% less)
  const previousNetWorth = netWorth * 0.98
  const change = calculateChange(netWorth, previousNetWorth)

  const assetBreakdown = calculateBreakdown(accounts, 'asset')
  const liabilityBreakdown = calculateBreakdown(accounts, 'liability')
  const history = generateHistoricalData(netWorth, 12)

  return {
    currentNetWorth: netWorth,
    totalAssets,
    totalLiabilities,
    change: {
      ...change,
      period: 'month',
    },
    assetBreakdown,
    liabilityBreakdown,
    history,
  }
}

// Create a new manual account
export function createManualAccount(
  name: string,
  type: AccountType,
  balance: number
): Account {
  const category = ACCOUNT_TYPE_CATEGORY[type]
  const now = new Date().toISOString()

  return {
    id: `manual-${Date.now()}`,
    userId: 'demo',
    name,
    type,
    category,
    balance: category === 'liability' ? Math.abs(balance) : balance,
    isManual: true,
    lastUpdated: now,
    createdAt: now,
  }
}

// Update account balance
export function updateAccountBalance(
  account: Account,
  newBalance: number
): Account {
  return {
    ...account,
    balance: account.category === 'liability' ? Math.abs(newBalance) : newBalance,
    lastUpdated: new Date().toISOString(),
  }
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format percentage for display
export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}
