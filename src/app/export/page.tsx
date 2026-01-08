'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileJson, FileText, Shield, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  type ExportFormat,
  type ExportDataType,
  DATA_TYPE_LABELS,
  FORMAT_LABELS,
} from '@/lib/export'

const ALL_DATA_TYPES: ExportDataType[] = [
  'profile',
  'goals',
  'daily_logs',
  'coaching_sessions',
  'streaks',
]

export default function ExportPage() {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json')
  const [selectedDataTypes, setSelectedDataTypes] = useState<ExportDataType[]>([...ALL_DATA_TYPES])
  const [dateRangeEnabled, setDateRangeEnabled] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleDataType = (type: ExportDataType) => {
    setSelectedDataTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    )
  }

  const selectAllDataTypes = () => {
    setSelectedDataTypes([...ALL_DATA_TYPES])
  }

  const handleExport = async () => {
    if (selectedDataTypes.length === 0) {
      setError('Please select at least one data type to export')
      return
    }

    if (dateRangeEnabled && (!startDate || !endDate)) {
      setError('Please specify both start and end dates')
      return
    }

    setIsExporting(true)
    setError(null)
    setExportComplete(false)

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: selectedFormat,
          dataTypes: selectedDataTypes,
          dateRange: dateRangeEnabled ? { start: startDate, end: endDate } : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Export failed')
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch ? filenameMatch[1] : `flourish-export.${selectedFormat}`

      // Create blob and download
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportComplete(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const handleGDPRExport = async () => {
    setIsExporting(true)
    setError(null)
    setExportComplete(false)

    try {
      const response = await fetch('/api/export', {
        method: 'GET',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Export failed')
      }

      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch ? filenameMatch[1] : 'flourish-export.json'

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportComplete(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight">Export Your Data</h1>
          <p className="text-muted-foreground mt-2">
            Download your personal data in your preferred format
          </p>
        </motion.div>

        {/* Premium Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center gap-3 py-4">
              <Shield className="size-5 text-primary" />
              <div>
                <p className="font-medium">Premium Feature</p>
                <p className="text-sm text-muted-foreground">
                  Data export is available for Premium subscribers
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Format Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Format</CardTitle>
              <CardDescription>
                Choose how you want your data formatted
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setSelectedFormat('json')}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors text-left ${
                  selectedFormat === 'json'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <FileJson className="size-6 text-primary" />
                <div>
                  <p className="font-medium">{FORMAT_LABELS.json}</p>
                  <p className="text-sm text-muted-foreground">Best for backups</p>
                </div>
              </button>
              <button
                onClick={() => setSelectedFormat('csv')}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors text-left ${
                  selectedFormat === 'csv'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <FileText className="size-6 text-primary" />
                <div>
                  <p className="font-medium">{FORMAT_LABELS.csv}</p>
                  <p className="text-sm text-muted-foreground">Opens in Excel</p>
                </div>
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Types Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Data to Export</CardTitle>
                  <CardDescription>
                    Select which data you want to include
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={selectAllDataTypes}>
                  Select All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {ALL_DATA_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleDataType(type)}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg border transition-colors text-left ${
                    selectedDataTypes.includes(type)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div
                    className={`size-5 rounded flex items-center justify-center ${
                      selectedDataTypes.includes(type)
                        ? 'bg-primary text-primary-foreground'
                        : 'border'
                    }`}
                  >
                    {selectedDataTypes.includes(type) && (
                      <CheckCircle2 className="size-4" />
                    )}
                  </div>
                  <span>{DATA_TYPE_LABELS[type]}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Date Range */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDateRangeEnabled(!dateRangeEnabled)}
                  className={`size-5 rounded flex items-center justify-center ${
                    dateRangeEnabled
                      ? 'bg-primary text-primary-foreground'
                      : 'border'
                  }`}
                >
                  {dateRangeEnabled && <CheckCircle2 className="size-4" />}
                </button>
                <div>
                  <CardTitle className="text-lg">Date Range (Optional)</CardTitle>
                  <CardDescription>
                    Filter data by date range
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            {dateRangeEnabled && (
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </CardContent>
            )}
          </Card>
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

        {/* Success Message */}
        {exportComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm flex items-center gap-2"
          >
            <CheckCircle2 className="size-4" />
            Export complete! Your download should start automatically.
          </motion.div>
        )}

        {/* Export Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-4"
        >
          <Button
            onClick={handleExport}
            size="lg"
            className="w-full"
            disabled={isExporting || selectedDataTypes.length === 0}
          >
            {isExporting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="size-4 border-2 border-current border-t-transparent rounded-full"
                />
                Exporting...
              </>
            ) : (
              <>
                <Download className="size-4" />
                Export Selected Data
              </>
            )}
          </Button>
        </motion.div>

        {/* GDPR Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="size-5" />
                GDPR Data Request
              </CardTitle>
              <CardDescription>
                Download a complete copy of all your personal data as required by GDPR/CCPA regulations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={handleGDPRExport}
                disabled={isExporting}
              >
                Download Complete Data Export
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
