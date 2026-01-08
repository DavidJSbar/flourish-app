'use client'

import { motion, useAnimation } from 'framer-motion'
import { useEffect, useState, useCallback, useRef } from 'react'
import type { BreathingPattern, BreathingPhase } from './types'

interface BreathingCircleProps {
  pattern: BreathingPattern
  isActive: boolean
  onCycleComplete?: () => void
  reducedMotion?: boolean
}

const PHASE_LABELS: Record<BreathingPhase, string> = {
  inhale: 'Breathe In',
  hold: 'Hold',
  exhale: 'Breathe Out',
  holdEmpty: 'Hold',
}

export function BreathingCircle({
  pattern,
  isActive,
  onCycleComplete,
  reducedMotion = false,
}: BreathingCircleProps) {
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale')
  const [countdown, setCountdown] = useState(pattern.phases.inhale)
  const controls = useAnimation()
  const phaseIndexRef = useRef(0)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const getPhaseSequence = useCallback(() => {
    const sequence: { phase: BreathingPhase; duration: number }[] = []

    if (pattern.phases.inhale > 0) {
      sequence.push({ phase: 'inhale', duration: pattern.phases.inhale })
    }
    if (pattern.phases.holdAfterInhale > 0) {
      sequence.push({ phase: 'hold', duration: pattern.phases.holdAfterInhale })
    }
    if (pattern.phases.exhale > 0) {
      sequence.push({ phase: 'exhale', duration: pattern.phases.exhale })
    }
    if (pattern.phases.holdAfterExhale > 0) {
      sequence.push({ phase: 'holdEmpty', duration: pattern.phases.holdAfterExhale })
    }

    return sequence
  }, [pattern])

  const animatePhase = useCallback(async (phase: BreathingPhase, duration: number) => {
    if (reducedMotion) {
      return
    }

    if (phase === 'inhale') {
      await controls.start({
        scale: 1.5,
        transition: { duration: duration, ease: 'easeInOut' },
      })
    } else if (phase === 'exhale') {
      await controls.start({
        scale: 1,
        transition: { duration: duration, ease: 'easeInOut' },
      })
    }
    // For hold phases, no animation needed
  }, [controls, reducedMotion])

  useEffect(() => {
    if (!isActive) {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
      controls.stop()
      controls.set({ scale: 1 })
      phaseIndexRef.current = 0
      setCurrentPhase('inhale')
      setCountdown(pattern.phases.inhale)
      return
    }

    const sequence = getPhaseSequence()
    if (sequence.length === 0) return

    let phaseIndex = 0
    let secondsRemaining = sequence[0].duration

    const runPhase = () => {
      const { phase, duration } = sequence[phaseIndex]
      setCurrentPhase(phase)
      setCountdown(duration)
      secondsRemaining = duration
      animatePhase(phase, duration)
    }

    runPhase()

    countdownRef.current = setInterval(() => {
      secondsRemaining--
      setCountdown(secondsRemaining)

      if (secondsRemaining <= 0) {
        phaseIndex = (phaseIndex + 1) % sequence.length

        if (phaseIndex === 0) {
          onCycleComplete?.()
        }

        runPhase()
      }
    }, 1000)

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [isActive, pattern, getPhaseSequence, animatePhase, controls, onCycleComplete])

  return (
    <div className="relative flex flex-col items-center justify-center gap-8">
      {/* Outer ring */}
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Background ring */}
        <div
          className="absolute w-full h-full rounded-full opacity-20"
          style={{ backgroundColor: pattern.color }}
        />

        {/* Animated circle */}
        <motion.div
          animate={controls}
          initial={{ scale: 1 }}
          className="relative flex items-center justify-center w-40 h-40 rounded-full shadow-lg"
          style={{
            backgroundColor: pattern.color,
            boxShadow: `0 0 30px ${pattern.color}40`,
          }}
        >
          {/* Inner content */}
          <div className="flex flex-col items-center text-white">
            <span className="text-4xl font-bold">{countdown}</span>
          </div>
        </motion.div>

        {/* Pulse rings (reduced motion respects prefers-reduced-motion) */}
        {isActive && !reducedMotion && (
          <>
            <motion.div
              className="absolute w-40 h-40 rounded-full border-2"
              style={{ borderColor: pattern.color }}
              animate={{
                scale: [1, 2],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
            <motion.div
              className="absolute w-40 h-40 rounded-full border-2"
              style={{ borderColor: pattern.color }}
              animate={{
                scale: [1, 2],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 1,
              }}
            />
          </>
        )}
      </div>

      {/* Phase label */}
      <motion.div
        key={currentPhase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-medium text-center"
        style={{ color: pattern.color }}
      >
        {PHASE_LABELS[currentPhase]}
      </motion.div>
    </div>
  )
}
