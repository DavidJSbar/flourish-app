// Types for Net Worth Tracking

export type AccountType = 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan' | 'mortgage' | 'real_estate' | 'vehicle' | 'other_asset' | 'other_debt'

export type AccountCategory = 'asset' | 'liability'

export interface Account {
  id: string
  userId: string
  name: string
  type: AccountType
  category: AccountCategory
  balance: number
  isManual: boolean
  plaidAccountId?: string
  institution?: string
  lastUpdated: string
  createdAt: string
}

export interface NetWorthSnapshot {
  id: string
  userId: string
  date: string
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  breakdown: {
    accountId: string
    accountName: string
    accountType: AccountType
    balance: number
  }[]
}

export interface NetWorthGoal {
  id: string
  userId: string
  targetAmount: number
  targetDate: string
  name: string
  createdAt: string
}

export interface NetWorthSummary {
  currentNetWorth: number
  totalAssets: number
  totalLiabilities: number
  change: {
    amount: number
    percentage: number
    period: 'day' | 'week' | 'month' | 'year'
  }
  assetBreakdown: {
    type: AccountType
    total: number
    percentage: number
  }[]
  liabilityBreakdown: {
    type: AccountType
    total: number
    percentage: number
  }[]
  history: {
    date: string
    netWorth: number
    assets: number
    liabilities: number
  }[]
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Checking Account',
  savings: 'Savings Account',
  credit_card: 'Credit Card',
  investment: 'Investment Account',
  loan: 'Loan',
  mortgage: 'Mortgage',
  real_estate: 'Real Estate',
  vehicle: 'Vehicle',
  other_asset: 'Other Asset',
  other_debt: 'Other Debt',
}

export const ACCOUNT_TYPE_CATEGORY: Record<AccountType, AccountCategory> = {
  checking: 'asset',
  savings: 'asset',
  credit_card: 'liability',
  investment: 'asset',
  loan: 'liability',
  mortgage: 'liability',
  real_estate: 'asset',
  vehicle: 'asset',
  other_asset: 'asset',
  other_debt: 'liability',
}

export const ASSET_TYPES: AccountType[] = ['checking', 'savings', 'investment', 'real_estate', 'vehicle', 'other_asset']
export const LIABILITY_TYPES: AccountType[] = ['credit_card', 'loan', 'mortgage', 'other_debt']
