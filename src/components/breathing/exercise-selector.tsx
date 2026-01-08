'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { BreathingPattern } from './types'

interface ExerciseSelectorProps {
  patterns: BreathingPattern[]
  selectedPattern: BreathingPattern
  onSelect: (pattern: BreathingPattern) => void
  disabled?: boolean
}

export function ExerciseSelector({
  patterns,
  selectedPattern,
  onSelect,
  disabled = false,
}: ExerciseSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {patterns.map((pattern) => (
        <Card
          key={pattern.id}
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md',
            selectedPattern.id === pattern.id && 'ring-2 ring-offset-2',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            '--tw-ring-color': selectedPattern.id === pattern.id ? pattern.color : 'transparent',
          } as React.CSSProperties}
          onClick={() => !disabled && onSelect(pattern)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: pattern.color }}
              />
              <CardTitle className="text-lg">{pattern.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm">
              {pattern.description}
            </CardDescription>
            <div className="mt-2 text-xs text-muted-foreground">
              {pattern.phases.inhale}s in
              {pattern.phases.holdAfterInhale > 0 && ` - ${pattern.phases.holdAfterInhale}s hold`}
              {` - ${pattern.phases.exhale}s out`}
              {pattern.phases.holdAfterExhale > 0 && ` - ${pattern.phases.holdAfterExhale}s hold`}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
