'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  EmotionSelector,
  DistortionSelector,
  COGNITIVE_DISTORTIONS,
  type CognitiveDistortion,
  type DiaryStep,
  type Emotion,
  type ThoughtEntry,
} from '@/components/thought-diary'

const STEPS: { key: DiaryStep; title: string; description: string }[] = [
  {
    key: 'situation',
    title: 'What happened?',
    description: 'Briefly describe the situation that triggered your thoughts.',
  },
  {
    key: 'automatic-thought',
    title: 'What went through your mind?',
    description: 'Write down the automatic thought that came up.',
  },
  {
    key: 'initial-emotion',
    title: 'How did you feel?',
    description: 'Identify the emotion and its intensity.',
  },
  {
    key: 'distortions',
    title: 'Identify thinking patterns',
    description: 'Select any cognitive distortions you notice in your thought.',
  },
  {
    key: 'alternative',
    title: 'Find a balanced perspective',
    description: 'What would be a more balanced or realistic way to think about this?',
  },
  {
    key: 'new-emotion',
    title: 'How do you feel now?',
    description: "After considering the alternative thought, how has your emotion changed?",
  },
]

function detectDistortions(thought: string): CognitiveDistortion[] {
  const detected: CognitiveDistortion[] = []
  const lowerThought = thought.toLowerCase()

  if (
    lowerThought.includes('always') ||
    lowerThought.includes('never') ||
    lowerThought.includes('completely') ||
    lowerThought.includes('totally')
  ) {
    detected.push('all-or-nothing')
  }

  if (
    lowerThought.includes('worst') ||
    lowerThought.includes('disaster') ||
    lowerThought.includes('terrible') ||
    lowerThought.includes('ruin')
  ) {
    detected.push('catastrophizing')
  }

  if (
    lowerThought.includes('they think') ||
    lowerThought.includes('everyone thinks') ||
    lowerThought.includes('people think')
  ) {
    detected.push('mind-reading')
  }

  if (
    lowerThought.includes('will fail') ||
    lowerThought.includes("won't work") ||
    lowerThought.includes('going to be bad')
  ) {
    detected.push('fortune-telling')
  }

  if (lowerThought.includes('feel like') || lowerThought.includes('feels like')) {
    detected.push('emotional-reasoning')
  }

  if (
    lowerThought.includes('should') ||
    lowerThought.includes('must') ||
    lowerThought.includes('ought to')
  ) {
    detected.push('should-statements')
  }

  if (lowerThought.includes('my fault') || lowerThought.includes('because of me')) {
    detected.push('personalization')
  }

  if (lowerThought.includes("i'm a") || lowerThought.includes("i am a")) {
    detected.push('labeling')
  }

  return detected
}

function generateAlternativeThought(
  thought: string,
  distortions: CognitiveDistortion[]
): string {
  const suggestions: string[] = []

  if (distortions.includes('all-or-nothing')) {
    suggestions.push(
      'Consider: What would be a more balanced view? Are there shades of gray here?'
    )
  }
  if (distortions.includes('catastrophizing')) {
    suggestions.push(
      "Ask yourself: What's the most likely outcome? How have similar situations turned out before?"
    )
  }
  if (distortions.includes('mind-reading')) {
    suggestions.push(
      "Remember: You can't know what others are thinking. What evidence do you actually have?"
    )
  }
  if (distortions.includes('fortune-telling')) {
    suggestions.push(
      "Notice: You're predicting the future. What are some other possible outcomes?"
    )
  }
  if (distortions.includes('should-statements')) {
    suggestions.push(
      'Try replacing "should" with "I would prefer" or "It would be nice if".'
    )
  }
  if (distortions.includes('labeling')) {
    suggestions.push(
      'Instead of labeling yourself, describe the specific behavior or situation.'
    )
  }

  if (suggestions.length === 0) {
    return 'What would you tell a friend who had this thought? Try to be kind to yourself.'
  }

  return suggestions.join(' ')
}

export default function ThoughtDiaryPage() {
  const [currentStep, setCurrentStep] = useState<DiaryStep>('situation')
  const [situation, setSituation] = useState('')
  const [automaticThought, setAutomaticThought] = useState('')
  const [initialEmotion, setInitialEmotion] = useState<Emotion>({ name: '', intensity: 50 })
  const [identifiedDistortions, setIdentifiedDistortions] = useState<CognitiveDistortion[]>([])
  const [alternativeThought, setAlternativeThought] = useState('')
  const [newEmotion, setNewEmotion] = useState<Emotion>({ name: '', intensity: 50 })
  const [suggestedDistortions, setSuggestedDistortions] = useState<CognitiveDistortion[]>([])
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [entries, setEntries] = useState<ThoughtEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep)
  const currentStepInfo = STEPS[currentStepIndex]

  const handleNext = useCallback(() => {
    if (currentStep === 'automatic-thought') {
      const detected = detectDistortions(automaticThought)
      setSuggestedDistortions(detected)
    }

    if (currentStep === 'distortions') {
      const suggestion = generateAlternativeThought(automaticThought, identifiedDistortions)
      setAiSuggestion(suggestion)
    }

    if (currentStep === 'new-emotion') {
      const entry: ThoughtEntry = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        situation,
        automaticThought,
        initialEmotion,
        identifiedDistortions,
        alternativeThought,
        newEmotion,
        aiSuggestion,
      }
      setEntries((prev) => [entry, ...prev])
      setCurrentStep('complete')
      return
    }

    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].key)
    }
  }, [
    currentStep,
    currentStepIndex,
    automaticThought,
    identifiedDistortions,
    situation,
    initialEmotion,
    alternativeThought,
    newEmotion,
    aiSuggestion,
  ])

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].key)
    }
  }

  const handleReset = () => {
    setCurrentStep('situation')
    setSituation('')
    setAutomaticThought('')
    setInitialEmotion({ name: '', intensity: 50 })
    setIdentifiedDistortions([])
    setAlternativeThought('')
    setNewEmotion({ name: '', intensity: 50 })
    setSuggestedDistortions([])
    setAiSuggestion('')
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'situation':
        return situation.trim().length > 0
      case 'automatic-thought':
        return automaticThought.trim().length > 0
      case 'initial-emotion':
        return initialEmotion.name.length > 0
      case 'distortions':
        return true // Optional
      case 'alternative':
        return alternativeThought.trim().length > 0
      case 'new-emotion':
        return newEmotion.name.length > 0
      default:
        return true
    }
  }

  const getDistressReduction = () => {
    if (!initialEmotion.intensity || !newEmotion.intensity) return 0
    return Math.max(0, initialEmotion.intensity - newEmotion.intensity)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Thought Diary</h1>
            <p className="text-muted-foreground mt-2">
              Reframe negative thoughts with CBT techniques
            </p>
          </div>
          {entries.length > 0 && (
            <Button variant="outline" onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? 'New Entry' : `History (${entries.length})`}
            </Button>
          )}
        </motion.div>

        {/* Disclaimer */}
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <CardContent className="pt-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Note:</strong> This tool is for self-reflection and educational purposes
              only. It is not a substitute for professional mental health care. If you&apos;re
              experiencing significant distress, please consult a mental health professional.
            </p>
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {showHistory ? (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold">Your Entries</h2>
              {entries.length === 0 ? (
                <p className="text-muted-foreground">No entries yet.</p>
              ) : (
                entries.map((entry) => (
                  <Card key={entry.id}>
                    <CardHeader>
                      <CardDescription>
                        {new Date(entry.createdAt).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </CardDescription>
                      <CardTitle className="text-base">{entry.situation}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium">Thought:</span> {entry.automaticThought}
                      </div>
                      <div>
                        <span className="font-medium">Initial feeling:</span>{' '}
                        {entry.initialEmotion.name} ({entry.initialEmotion.intensity}%)
                      </div>
                      {entry.identifiedDistortions.length > 0 && (
                        <div>
                          <span className="font-medium">Patterns:</span>{' '}
                          {entry.identifiedDistortions
                            .map((d) => COGNITIVE_DISTORTIONS.find((cd) => cd.id === d)?.name)
                            .join(', ')}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Alternative:</span> {entry.alternativeThought}
                      </div>
                      <div>
                        <span className="font-medium">New feeling:</span> {entry.newEmotion.name} (
                        {entry.newEmotion.intensity}%)
                      </div>
                      <div className="pt-2 border-t">
                        <span className="font-medium text-green-600 dark:text-green-400">
                          Distress reduction:{' '}
                          {entry.initialEmotion.intensity - entry.newEmotion.intensity}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </motion.div>
          ) : currentStep === 'complete' ? (
            <motion.div
              key="complete"
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
              <h2 className="text-2xl font-bold text-center">Great work!</h2>
              <p className="text-muted-foreground text-center max-w-md">
                You&apos;ve successfully reframed your thought. Your distress level went from{' '}
                <span className="font-semibold">{initialEmotion.intensity}%</span> to{' '}
                <span className="font-semibold">{newEmotion.intensity}%</span>.
              </p>
              {getDistressReduction() > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-green-700 dark:text-green-300 font-medium">
                    {getDistressReduction()}% reduction in distress
                  </p>
                </div>
              )}
              <div className="flex gap-4">
                <Button onClick={handleReset}>Start New Entry</Button>
                <Button variant="outline" onClick={() => setShowHistory(true)}>
                  View History
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Progress */}
              <div className="flex gap-1">
                {STEPS.map((step, i) => (
                  <div
                    key={step.key}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= currentStepIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Step Content */}
              <Card>
                <CardHeader>
                  <CardTitle>{currentStepInfo.title}</CardTitle>
                  <CardDescription>{currentStepInfo.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentStep === 'situation' && (
                    <textarea
                      className="w-full min-h-[100px] p-3 border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Describe the situation briefly..."
                      value={situation}
                      onChange={(e) => setSituation(e.target.value)}
                    />
                  )}

                  {currentStep === 'automatic-thought' && (
                    <textarea
                      className="w-full min-h-[100px] p-3 border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="What thought automatically came to mind?"
                      value={automaticThought}
                      onChange={(e) => setAutomaticThought(e.target.value)}
                    />
                  )}

                  {currentStep === 'initial-emotion' && (
                    <EmotionSelector
                      value={initialEmotion}
                      onChange={setInitialEmotion}
                    />
                  )}

                  {currentStep === 'distortions' && (
                    <DistortionSelector
                      selected={identifiedDistortions}
                      onChange={setIdentifiedDistortions}
                      suggestedDistortions={suggestedDistortions}
                    />
                  )}

                  {currentStep === 'alternative' && (
                    <div className="space-y-4">
                      {aiSuggestion && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <span className="font-medium">Tip:</span> {aiSuggestion}
                          </p>
                        </div>
                      )}
                      <textarea
                        className="w-full min-h-[100px] p-3 border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Write a more balanced or realistic thought..."
                        value={alternativeThought}
                        onChange={(e) => setAlternativeThought(e.target.value)}
                      />
                    </div>
                  )}

                  {currentStep === 'new-emotion' && (
                    <EmotionSelector
                      value={newEmotion}
                      onChange={setNewEmotion}
                      label="After considering the alternative thought"
                    />
                  )}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStepIndex === 0}
                >
                  Back
                </Button>
                <Button onClick={handleNext} disabled={!canProceed()}>
                  {currentStep === 'new-emotion' ? 'Complete' : 'Next'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
