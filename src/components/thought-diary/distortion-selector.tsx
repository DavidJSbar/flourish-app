'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { COGNITIVE_DISTORTIONS, type CognitiveDistortion } from './types'

interface DistortionSelectorProps {
  selected: CognitiveDistortion[]
  onChange: (distortions: CognitiveDistortion[]) => void
  suggestedDistortions?: CognitiveDistortion[]
}

export function DistortionSelector({
  selected,
  onChange,
  suggestedDistortions = [],
}: DistortionSelectorProps) {
  const toggleDistortion = (distortion: CognitiveDistortion) => {
    if (selected.includes(distortion)) {
      onChange(selected.filter((d) => d !== distortion))
    } else {
      onChange([...selected, distortion])
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Identify Thinking Patterns</h3>
        <p className="text-sm text-muted-foreground">
          Select any cognitive distortions you notice in your thought. These are common thinking
          patterns that can make us feel worse than necessary.
        </p>
      </div>

      {suggestedDistortions.length > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-medium">AI Suggestion:</span> Your thought might contain{' '}
            {suggestedDistortions.map((d, i) => (
              <span key={d}>
                <span className="font-medium">
                  {COGNITIVE_DISTORTIONS.find((cd) => cd.id === d)?.name}
                </span>
                {i < suggestedDistortions.length - 1 && ', '}
              </span>
            ))}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {COGNITIVE_DISTORTIONS.map((distortion) => {
          const isSelected = selected.includes(distortion.id)
          const isSuggested = suggestedDistortions.includes(distortion.id)

          return (
            <Card
              key={distortion.id}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md',
                isSelected && 'ring-2 ring-primary ring-offset-2',
                isSuggested && !isSelected && 'border-blue-300 dark:border-blue-700'
              )}
              onClick={() => toggleDistortion(distortion.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                      isSelected
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-muted-foreground'
                    )}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <CardTitle className="text-sm">{distortion.name}</CardTitle>
                  {isSuggested && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      Suggested
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-xs">{distortion.description}</CardDescription>
                <p className="text-xs text-muted-foreground mt-2 italic">{distortion.example}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selected.length > 0 && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm">
            <span className="font-medium">Selected patterns:</span>{' '}
            {selected.map((d, i) => (
              <span key={d}>
                {COGNITIVE_DISTORTIONS.find((cd) => cd.id === d)?.name}
                {i < selected.length - 1 && ', '}
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  )
}
