'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BreathingCircle,
  ExerciseSelector,
  BREATHING_PATTERNS,
  DURATION_OPTIONS,
  type BreathingPattern,
} from '@/components/breathing'

// Hook to subscribe to reduced motion preference
function useReducedMotion() {
  return useSyncExternalStore(
    (callback) => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      mediaQuery.addEventListener('change', callback)
      return () => mediaQuery.removeEventListener('change', callback)
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false // Server snapshot
  )
}

export default function BreathingPage() {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(BREATHING_PATTERNS[0])
  const [selectedDuration, setSelectedDuration] = useState(180) // 3 minutes default
  const [isActive, setIsActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(selectedDuration)
  const [cyclesCompleted, setCyclesCompleted] = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)
  const reducedMotion = useReducedMotion()

  // Timer countdown
  useEffect(() => {
    if (!isActive) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsActive(false)
          setShowCompletion(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive])

  const handleStart = () => {
    setTimeRemaining(selectedDuration)
    setCyclesCompleted(0)
    setShowCompletion(false)
    setIsActive(true)
  }

  const handleStop = () => {
    setIsActive(false)
  }

  const handleReset = () => {
    setIsActive(false)
    setTimeRemaining(selectedDuration)
    setCyclesCompleted(0)
    setShowCompletion(false)
  }

  const handleCycleComplete = useCallback(() => {
    setCyclesCompleted((prev) => prev + 1)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
          <h1 className="text-3xl font-bold tracking-tight">Breathing Exercises</h1>
          <p className="text-muted-foreground mt-2">
            Find calm and focus with guided breathing
          </p>
        </motion.div>

        {/* Main Exercise Area */}
        <AnimatePresence mode="wait">
          {showCompletion ? (
            <motion.div
              key="completion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-6 py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                className="text-6xl"
              >
                ✨
              </motion.div>
              <h2 className="text-2xl font-bold text-center">Well Done!</h2>
              <p className="text-muted-foreground text-center">
                You completed {cyclesCompleted} breathing cycles
              </p>
              <Button onClick={handleReset} size="lg">
                Start Another Session
              </Button>
            </motion.div>
          ) : isActive ? (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              {/* Timer */}
              <div className="text-center">
                <span className="text-4xl font-mono font-bold">
                  {formatTime(timeRemaining)}
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  {cyclesCompleted} cycles completed
                </p>
              </div>

              {/* Breathing Circle */}
              <BreathingCircle
                pattern={selectedPattern}
                isActive={isActive}
                onCycleComplete={handleCycleComplete}
                reducedMotion={reducedMotion}
              />

              {/* Stop Button */}
              <Button variant="outline" onClick={handleStop} size="lg">
                End Session
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Pattern Selection */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Choose a technique</h2>
                <ExerciseSelector
                  patterns={BREATHING_PATTERNS}
                  selectedPattern={selectedPattern}
                  onSelect={setSelectedPattern}
                />
              </div>

              {/* Duration Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {DURATION_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        variant={selectedDuration === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSelectedDuration(option.value)
                          setTimeRemaining(option.value)
                        }}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="opacity-50">
                  <BreathingCircle
                    pattern={selectedPattern}
                    isActive={false}
                    reducedMotion={reducedMotion}
                  />
                </div>
              </div>

              {/* Start Button */}
              <div className="flex justify-center">
                <Button onClick={handleStart} size="lg" className="px-12">
                  Start Breathing
                </Button>
              </div>

              {/* Accessibility Note */}
              {reducedMotion && (
                <p className="text-center text-sm text-muted-foreground">
                  Animations are reduced based on your system preferences
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
