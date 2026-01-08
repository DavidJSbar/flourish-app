export type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'holdEmpty'

export interface BreathingPattern {
  id: string
  name: string
  description: string
  phases: {
    inhale: number
    holdAfterInhale: number
    exhale: number
    holdAfterExhale: number
  }
  color: string
}

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Equal counts for inhale, hold, exhale, hold. Great for focus and calm.',
    phases: {
      inhale: 4,
      holdAfterInhale: 4,
      exhale: 4,
      holdAfterExhale: 4,
    },
    color: 'var(--color-mental)',
  },
  {
    id: '478',
    name: '4-7-8 Relaxation',
    description: 'Deep relaxation technique. Perfect for sleep and anxiety relief.',
    phases: {
      inhale: 4,
      holdAfterInhale: 7,
      exhale: 8,
      holdAfterExhale: 0,
    },
    color: 'var(--color-health)',
  },
  {
    id: 'coherent',
    name: 'Coherent Breathing',
    description: 'Simple 5-5 pattern. Optimizes heart rate variability.',
    phases: {
      inhale: 5,
      holdAfterInhale: 0,
      exhale: 5,
      holdAfterExhale: 0,
    },
    color: 'var(--color-purpose)',
  },
  {
    id: 'resonance',
    name: 'Resonance Breathing',
    description: 'Slow 6-6 pattern. Deep relaxation and stress relief.',
    phases: {
      inhale: 6,
      holdAfterInhale: 0,
      exhale: 6,
      holdAfterExhale: 0,
    },
    color: 'var(--color-relationships)',
  },
]

export const DURATION_OPTIONS = [
  { value: 60, label: '1 minute' },
  { value: 180, label: '3 minutes' },
  { value: 300, label: '5 minutes' },
  { value: 600, label: '10 minutes' },
]
