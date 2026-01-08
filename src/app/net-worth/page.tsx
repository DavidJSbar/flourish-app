'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  CreditCard,
  Home,
  Car,
  Briefcase,
  Plus,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Edit2,
  Check,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type {
  Account,
  AccountType,
  NetWorthSummary,
} from '@/lib/net-worth'
import {
  ACCOUNT_TYPE_LABELS,
  ASSET_TYPES,
  LIABILITY_TYPES,
  formatCurrency,
  formatPercentage,
} from '@/lib/net-worth'

const ACCOUNT_ICONS: Record<AccountType, React.ElementType> = {
  checking: DollarSign,
  savings: PiggyBank,
  credit_card: CreditCard,
  investment: Briefcase,
  loan: CreditCard,
  mortgage: Home,
  real_estate: Home,
  vehicle: Car,
  other_asset: DollarSign,
  other_debt: CreditCard,
}

export default function NetWorthPage() {
  const [summary, setSummary] = useState<NetWorthSummary | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add account form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAccountName, setNewAccountName] = useState('')
  const [newAccountType, setNewAccountType] = useState<AccountType>('checking')
  const [newAccountBalance, setNewAccountBalance] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  // Edit state
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null)
  const [editBalance, setEditBalance] = useState('')

  // Expanded sections
  const [expandedAssets, setExpandedAssets] = useState(true)
  const [expandedLiabilities, setExpandedLiabilities] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/net-worth')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data')
      }

      setSummary(result.data.summary)
      setAccounts(result.data.accounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAddAccount = async () => {
    if (!newAccountName || !newAccountBalance) {
      setError('Please fill in all fields')
      return
    }

    setIsAdding(true)
    setError(null)

    try {
      const response = await fetch('/api/net-worth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAccountName,
          type: newAccountType,
          balance: parseFloat(newAccountBalance),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add account')
      }

      setSummary(result.data.summary)
      setAccounts((prev) => [...prev, result.data.account])
      setShowAddForm(false)
      setNewAccountName('')
      setNewAccountBalance('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add account')
    } finally {
      setIsAdding(false)
    }
  }

  const handleUpdateBalance = async (accountId: string) => {
    if (!editBalance) return

    try {
      const response = await fetch('/api/net-worth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          balance: parseFloat(editBalance),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update balance')
      }

      setSummary(result.data.summary)
      setAccounts((prev) =>
        prev.map((a) => (a.id === accountId ? result.data.account : a))
      )
      setEditingAccountId(null)
      setEditBalance('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update balance')
    }
  }

  const handleDeleteAccount = async (accountId: string) => {
    try {
      const response = await fetch(`/api/net-worth?accountId=${accountId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete account')
      }

      setSummary(result.data.summary)
      setAccounts((prev) => prev.filter((a) => a.id !== accountId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account')
    }
  }

  const assetAccounts = accounts.filter((a) => a.category === 'asset')
  const liabilityAccounts = accounts.filter((a) => a.category === 'liability')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <RefreshCw className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight">Net Worth</h1>
          <p className="text-muted-foreground mt-2">
            Track your financial health over time
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Net Worth Summary Card */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Net Worth
                  </p>
                  <p className="text-5xl font-bold tracking-tight">
                    {formatCurrency(summary.currentNetWorth)}
                  </p>
                  <div
                    className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                      summary.change.amount >= 0
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}
                  >
                    {summary.change.amount >= 0 ? (
                      <TrendingUp className="size-4" />
                    ) : (
                      <TrendingDown className="size-4" />
                    )}
                    {formatCurrency(Math.abs(summary.change.amount))} (
                    {formatPercentage(summary.change.percentage)}) this{' '}
                    {summary.change.period}
                  </div>
                </div>

                {/* Assets vs Liabilities */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="text-center p-4 rounded-lg bg-green-500/10">
                    <p className="text-sm text-muted-foreground">Total Assets</p>
                    <p className="text-2xl font-bold text-green-500">
                      {formatCurrency(summary.totalAssets)}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-500/10">
                    <p className="text-sm text-muted-foreground">
                      Total Liabilities
                    </p>
                    <p className="text-2xl font-bold text-red-500">
                      {formatCurrency(summary.totalLiabilities)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Historical Chart Placeholder */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Net Worth Over Time</CardTitle>
                <CardDescription>
                  Your financial progress over the past 12 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Simple bar chart visualization */}
                <div className="h-48 flex items-end gap-1">
                  {summary.history.map((point, index) => {
                    const maxNetWorth = Math.max(
                      ...summary.history.map((p) => p.netWorth)
                    )
                    const height = (point.netWorth / maxNetWorth) * 100

                    return (
                      <div
                        key={point.date}
                        className="flex-1 flex flex-col items-center"
                      >
                        <div
                          className="w-full bg-primary/80 rounded-t hover:bg-primary transition-colors"
                          style={{ height: `${height}%` }}
                          title={`${point.date}: ${formatCurrency(point.netWorth)}`}
                        />
                        {index % 3 === 0 && (
                          <span className="text-xs text-muted-foreground mt-2">
                            {new Date(point.date).toLocaleDateString('en-US', {
                              month: 'short',
                            })}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Assets Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setExpandedAssets(!expandedAssets)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-green-500">Assets</CardTitle>
                  <CardDescription>
                    {assetAccounts.length} account
                    {assetAccounts.length !== 1 ? 's' : ''} |{' '}
                    {summary ? formatCurrency(summary.totalAssets) : '$0'}
                  </CardDescription>
                </div>
                {expandedAssets ? (
                  <ChevronUp className="size-5" />
                ) : (
                  <ChevronDown className="size-5" />
                )}
              </div>
            </CardHeader>
            <AnimatePresence>
              {expandedAssets && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <CardContent className="space-y-2">
                    {assetAccounts.map((account) => {
                      const Icon = ACCOUNT_ICONS[account.type]
                      const isEditing = editingAccountId === account.id

                      return (
                        <div
                          key={account.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                              <Icon className="size-5 text-green-500" />
                            </div>
                            <div>
                              <p className="font-medium">{account.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {ACCOUNT_TYPE_LABELS[account.type]}
                                {account.institution && ` | ${account.institution}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <Input
                                  type="number"
                                  value={editBalance}
                                  onChange={(e) => setEditBalance(e.target.value)}
                                  className="w-32"
                                  autoFocus
                                />
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  onClick={() => handleUpdateBalance(account.id)}
                                >
                                  <Check className="size-4" />
                                </Button>
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingAccountId(null)
                                    setEditBalance('')
                                  }}
                                >
                                  <X className="size-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <span className="font-semibold text-green-500">
                                  {formatCurrency(account.balance)}
                                </span>
                                {account.isManual && (
                                  <>
                                    <Button
                                      size="icon-sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingAccountId(account.id)
                                        setEditBalance(account.balance.toString())
                                      }}
                                    >
                                      <Edit2 className="size-4" />
                                    </Button>
                                    <Button
                                      size="icon-sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteAccount(account.id)}
                                    >
                                      <Trash2 className="size-4 text-destructive" />
                                    </Button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Liabilities Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setExpandedLiabilities(!expandedLiabilities)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-red-500">
                    Liabilities
                  </CardTitle>
                  <CardDescription>
                    {liabilityAccounts.length} account
                    {liabilityAccounts.length !== 1 ? 's' : ''} |{' '}
                    {summary ? formatCurrency(summary.totalLiabilities) : '$0'}
                  </CardDescription>
                </div>
                {expandedLiabilities ? (
                  <ChevronUp className="size-5" />
                ) : (
                  <ChevronDown className="size-5" />
                )}
              </div>
            </CardHeader>
            <AnimatePresence>
              {expandedLiabilities && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <CardContent className="space-y-2">
                    {liabilityAccounts.map((account) => {
                      const Icon = ACCOUNT_ICONS[account.type]
                      const isEditing = editingAccountId === account.id

                      return (
                        <div
                          key={account.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-500/10">
                              <Icon className="size-5 text-red-500" />
                            </div>
                            <div>
                              <p className="font-medium">{account.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {ACCOUNT_TYPE_LABELS[account.type]}
                                {account.institution && ` | ${account.institution}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <Input
                                  type="number"
                                  value={editBalance}
                                  onChange={(e) => setEditBalance(e.target.value)}
                                  className="w-32"
                                  autoFocus
                                />
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  onClick={() => handleUpdateBalance(account.id)}
                                >
                                  <Check className="size-4" />
                                </Button>
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingAccountId(null)
                                    setEditBalance('')
                                  }}
                                >
                                  <X className="size-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <span className="font-semibold text-red-500">
                                  -{formatCurrency(account.balance)}
                                </span>
                                {account.isManual && (
                                  <>
                                    <Button
                                      size="icon-sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingAccountId(account.id)
                                        setEditBalance(account.balance.toString())
                                      }}
                                    >
                                      <Edit2 className="size-4" />
                                    </Button>
                                    <Button
                                      size="icon-sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteAccount(account.id)}
                                    >
                                      <Trash2 className="size-4 text-destructive" />
                                    </Button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Add Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Add Manual Account</CardTitle>
                  <CardDescription>
                    Track assets and debts not connected to Plaid
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  {showAddForm ? (
                    <X className="size-4" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  {showAddForm ? 'Cancel' : 'Add Account'}
                </Button>
              </div>
            </CardHeader>
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Account Name
                        </label>
                        <Input
                          placeholder="e.g., Home Value"
                          value={newAccountName}
                          onChange={(e) => setNewAccountName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <select
                          value={newAccountType}
                          onChange={(e) =>
                            setNewAccountType(e.target.value as AccountType)
                          }
                          className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                        >
                          <optgroup label="Assets">
                            {ASSET_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {ACCOUNT_TYPE_LABELS[type]}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Liabilities">
                            {LIABILITY_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {ACCOUNT_TYPE_LABELS[type]}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Balance ($)</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={newAccountBalance}
                          onChange={(e) => setNewAccountBalance(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleAddAccount}
                      disabled={isAdding}
                      className="w-full md:w-auto"
                    >
                      {isAdding ? (
                        <RefreshCw className="size-4 animate-spin" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                      Add Account
                    </Button>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
