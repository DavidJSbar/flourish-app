export type CognitiveDistortion =
  | 'all-or-nothing'
  | 'catastrophizing'
  | 'mind-reading'
  | 'fortune-telling'
  | 'emotional-reasoning'
  | 'should-statements'
  | 'personalization'
  | 'filtering'
  | 'overgeneralization'
  | 'labeling'

export interface CognitiveDistortionInfo {
  id: CognitiveDistortion
  name: string
  description: string
  example: string
}

export const COGNITIVE_DISTORTIONS: CognitiveDistortionInfo[] = [
  {
    id: 'all-or-nothing',
    name: 'All-or-Nothing Thinking',
    description: 'Seeing things in black-and-white categories, with no middle ground.',
    example: '"If I\'m not perfect, I\'m a total failure."',
  },
  {
    id: 'catastrophizing',
    name: 'Catastrophizing',
    description: 'Expecting the worst possible outcome, magnifying problems.',
    example: '"This mistake will ruin everything."',
  },
  {
    id: 'mind-reading',
    name: 'Mind Reading',
    description: 'Assuming you know what others are thinking without evidence.',
    example: '"They think I\'m stupid."',
  },
  {
    id: 'fortune-telling',
    name: 'Fortune Telling',
    description: 'Predicting negative outcomes as if they\'re certain.',
    example: '"I know I\'m going to fail the interview."',
  },
  {
    id: 'emotional-reasoning',
    name: 'Emotional Reasoning',
    description: 'Believing something is true because it feels true.',
    example: '"I feel anxious, so something bad must be happening."',
  },
  {
    id: 'should-statements',
    name: 'Should Statements',
    description: 'Using "should", "must", "ought to" rules that create guilt and frustration.',
    example: '"I should always be productive."',
  },
  {
    id: 'personalization',
    name: 'Personalization',
    description: 'Taking responsibility for events outside your control.',
    example: '"It\'s my fault the team didn\'t succeed."',
  },
  {
    id: 'filtering',
    name: 'Mental Filtering',
    description: 'Focusing only on the negative aspects, ignoring the positive.',
    example: 'Dwelling on one critical comment despite many compliments.',
  },
  {
    id: 'overgeneralization',
    name: 'Overgeneralization',
    description: 'Drawing broad conclusions from a single event.',
    example: '"I failed once, so I always fail."',
  },
  {
    id: 'labeling',
    name: 'Labeling',
    description: 'Attaching a negative label to yourself or others.',
    example: '"I\'m such an idiot." instead of "I made a mistake."',
  },
]

export interface Emotion {
  name: string
  intensity: number // 0-100
}

export interface ThoughtEntry {
  id: string
  createdAt: string
  situation: string
  automaticThought: string
  initialEmotion: Emotion
  identifiedDistortions: CognitiveDistortion[]
  alternativeThought: string
  newEmotion: Emotion
  aiSuggestion?: string
}

export type DiaryStep =
  | 'situation'
  | 'automatic-thought'
  | 'initial-emotion'
  | 'distortions'
  | 'alternative'
  | 'new-emotion'
  | 'complete'

export const COMMON_EMOTIONS = [
  'Anxious',
  'Sad',
  'Angry',
  'Frustrated',
  'Overwhelmed',
  'Guilty',
  'Ashamed',
  'Worried',
  'Disappointed',
  'Hopeless',
  'Lonely',
  'Stressed',
]
