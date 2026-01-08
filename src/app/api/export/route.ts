import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  fetchExportData,
  generateJSON,
  generateCSV,
  getExportFilename,
  getExportMimeType,
  getAllDataTypes,
} from '@/lib/export'
import type { ExportFormat, ExportDataType } from '@/lib/export'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to export your data.' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      format = 'json',
      dataTypes = getAllDataTypes(),
      dateRange,
    } = body as {
      format?: ExportFormat
      dataTypes?: ExportDataType[]
      dateRange?: { start: string; end: string }
    }

    // Validate format
    if (!['json', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Supported formats: json, csv' },
        { status: 400 }
      )
    }

    // Validate data types
    const validDataTypes = getAllDataTypes()
    const invalidTypes = dataTypes.filter((t) => !validDataTypes.includes(t))
    if (invalidTypes.length > 0) {
      return NextResponse.json(
        { error: `Invalid data types: ${invalidTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate date range if provided
    if (dateRange) {
      const { start, end } = dateRange
      if (!start || !end) {
        return NextResponse.json(
          { error: 'Date range must include both start and end dates' },
          { status: 400 }
        )
      }
      const startDate = new Date(start)
      const endDate = new Date(end)
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format in date range' },
          { status: 400 }
        )
      }
      if (startDate > endDate) {
        return NextResponse.json(
          { error: 'Start date must be before end date' },
          { status: 400 }
        )
      }
    }

    // Fetch export data
    const exportData = await fetchExportData(supabase, user.id, {
      format,
      dataTypes,
      dateRange,
    })

    // Generate export content
    const content = format === 'json'
      ? generateJSON(exportData)
      : generateCSV(exportData)

    // Return as downloadable file
    const filename = getExportFilename(format)
    const mimeType = getExportMimeType(format)

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'An error occurred while exporting data' },
      { status: 500 }
    )
  }
}

// GET endpoint for GDPR compliance - full data export
export async function GET() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to export your data.' },
        { status: 401 }
      )
    }

    // Fetch all data for GDPR compliance
    const exportData = await fetchExportData(supabase, user.id, {
      format: 'json',
      dataTypes: getAllDataTypes(),
    })

    // Generate JSON export
    const content = generateJSON(exportData)
    const filename = getExportFilename('json')

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'An error occurred while exporting data' },
      { status: 500 }
    )
  }
}
