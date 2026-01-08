import { NextRequest, NextResponse } from 'next/server'
import {
  generateMockAccounts,
  getNetWorthSummary,
  createManualAccount,
  updateAccountBalance,
  type AccountType,
} from '@/lib/net-worth'

// In-memory storage for demo (would be Supabase in production)
let accounts = generateMockAccounts()

// GET - Get net worth summary and accounts
export async function GET() {
  try {
    const summary = getNetWorthSummary(accounts)

    return NextResponse.json({
      success: true,
      data: {
        summary,
        accounts,
      },
    })
  } catch (error) {
    console.error('Error fetching net worth:', error)
    return NextResponse.json(
      { error: 'Failed to fetch net worth data' },
      { status: 500 }
    )
  }
}

// POST - Add a new manual account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, balance } = body as {
      name: string
      type: AccountType
      balance: number
    }

    if (!name || !type || balance === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, balance' },
        { status: 400 }
      )
    }

    const newAccount = createManualAccount(name, type, balance)
    accounts = [...accounts, newAccount]

    const summary = getNetWorthSummary(accounts)

    return NextResponse.json({
      success: true,
      data: {
        account: newAccount,
        summary,
      },
    })
  } catch (error) {
    console.error('Error adding account:', error)
    return NextResponse.json(
      { error: 'Failed to add account' },
      { status: 500 }
    )
  }
}

// PUT - Update an account balance
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { accountId, balance } = body as {
      accountId: string
      balance: number
    }

    if (!accountId || balance === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: accountId, balance' },
        { status: 400 }
      )
    }

    const accountIndex = accounts.findIndex((a) => a.id === accountId)
    if (accountIndex === -1) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    accounts[accountIndex] = updateAccountBalance(accounts[accountIndex], balance)
    const summary = getNetWorthSummary(accounts)

    return NextResponse.json({
      success: true,
      data: {
        account: accounts[accountIndex],
        summary,
      },
    })
  } catch (error) {
    console.error('Error updating account:', error)
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    )
  }
}

// DELETE - Remove an account
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.json(
        { error: 'Missing accountId parameter' },
        { status: 400 }
      )
    }

    const accountIndex = accounts.findIndex((a) => a.id === accountId)
    if (accountIndex === -1) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    accounts = accounts.filter((a) => a.id !== accountId)
    const summary = getNetWorthSummary(accounts)

    return NextResponse.json({
      success: true,
      data: {
        summary,
      },
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
