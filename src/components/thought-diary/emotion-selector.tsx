'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { COMMON_EMOTIONS, type Emotion } from './types'

interface EmotionSelectorProps {
  value: Emotion
  onChange: (emotion: Emotion) => void
  label?: string
}

export function EmotionSelector({ value, onChange, label }: EmotionSelectorProps) {
  const [customEmotion, setCustomEmotion] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const handleEmotionSelect = (emotionName: string) => {
    onChange({ name: emotionName, intensity: value.intensity })
  }

  const handleIntensityChange = (intensity: number) => {
    onChange({ name: value.name, intensity })
  }

  const handleCustomSubmit = () => {
    if (customEmotion.trim()) {
      onChange({ name: customEmotion.trim(), intensity: value.intensity })
      setShowCustom(false)
      setCustomEmotion('')
    }
  }

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 30) return 'bg-green-500'
    if (intensity <= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getIntensityLabel = (intensity: number) => {
    if (intensity <= 20) return 'Very Mild'
    if (intensity <= 40) return 'Mild'
    if (intensity <= 60) return 'Moderate'
    if (intensity <= 80) return 'Strong'
    return 'Intense'
  }

  return (
    <div className="space-y-6">
      {label && <h3 className="text-lg font-semibold">{label}</h3>}

      {/* Emotion Selection */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Select an emotion:</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_EMOTIONS.map((emotion) => (
            <Button
              key={emotion}
              variant={value.name === emotion ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleEmotionSelect(emotion)}
              className="transition-all"
            >
              {emotion}
            </Button>
          ))}
          <Button
            variant={showCustom ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowCustom(!showCustom)}
          >
            Other...
          </Button>
        </div>

        {showCustom && (
          <div className="flex gap-2">
            <Input
              placeholder="Enter your emotion"
              value={customEmotion}
              onChange={(e) => setCustomEmotion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
            />
            <Button onClick={handleCustomSubmit}>Add</Button>
          </div>
        )}
      </div>

      {/* Intensity Slider */}
      {value.name && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              How intense is this feeling?
            </p>
            <span className="text-sm font-medium">
              {getIntensityLabel(value.intensity)} ({value.intensity}%)
            </span>
          </div>

          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={value.intensity}
              onChange={(e) => handleIntensityChange(Number(e.target.value))}
              className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <div
              className={cn(
                'absolute left-0 top-0 h-3 rounded-l-lg pointer-events-none',
                getIntensityColor(value.intensity)
              )}
              style={{ width: `${value.intensity}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Current Selection Display */}
      {value.name && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm">
            You&apos;re feeling{' '}
            <span className="font-semibold">{value.name.toLowerCase()}</span> at{' '}
            <span className="font-semibold">{value.intensity}%</span> intensity.
          </p>
        </div>
      )}
    </div>
  )
}
