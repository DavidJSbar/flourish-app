# CLAUDE.md - AI Assistant Guide for Flourish App

## Project Overview

**Flourish** is a mobile-first AI life coaching application designed to help users achieve holistic wellbeing across 5 pillars: Health, Mental, Wealth, Relationships, and Purpose.

**Goal**: Create an engaging, personalized coaching experience powered by Claude AI that helps users flourish in all areas of life.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 14 (App Router), React 19, TypeScript 5.x (strict mode) |
| **Styling** | Tailwind CSS v4 with @theme design tokens, Shadcn/ui + Radix primitives |
| **Backend** | Next.js API Routes, Vercel AI SDK |
| **Database** | Supabase PostgreSQL with pgvector for embeddings |
| **Auth** | Supabase Auth (email/password + Google OAuth) |
| **AI** | Claude Sonnet 4 via @ai-sdk/anthropic |
| **Deployment** | Railway with GitHub Actions CI/CD |

## Project Structure

```
flourish-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Home page
│   │   ├── (auth)/             # Auth routes group
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── callback/
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   │   ├── layout.tsx      # Dashboard shell with nav
│   │   │   ├── page.tsx        # Main hub
│   │   │   ├── wellness/       # Health + Mental pillars
│   │   │   ├── growth/         # Career + Purpose pillars
│   │   │   ├── connect/        # Relationships + Finance
│   │   │   └── profile/
│   │   ├── chat/               # AI coach chat interface
│   │   ├── onboarding/         # 7-step onboarding flow
│   │   └── api/                # API routes
│   │       └── chat/           # AI streaming endpoint
│   ├── components/             # Shared UI components
│   │   ├── ui/                 # Shadcn/ui base components
│   │   ├── chat/               # Chat-specific components
│   │   └── dashboard/          # Dashboard widgets
│   ├── lib/                    # Utilities and clients
│   │   ├── supabase/           # Supabase client config
│   │   ├── ai/                 # AI SDK config
│   │   └── utils.ts            # General utilities
│   └── services/               # Business logic services
│       ├── auth.ts             # Authentication service
│       ├── goals.ts            # Goal tracking service
│       └── coaching.ts         # AI coaching service
├── public/                     # Static assets
├── supabase/                   # Supabase migrations
├── CLAUDE.md                   # This file
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
└── tsconfig.json               # TypeScript configuration
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start

# Run linting
pnpm lint

# Type checking
pnpm type-check
```

## Key Conventions

### Naming
- **Files**: kebab-case for routes, PascalCase for components
- **Database columns**: snake_case
- **TypeScript**: PascalCase for types/interfaces, camelCase for variables

### Component Pattern
Components use Shadcn/ui with Tailwind CSS:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

### Path Aliases
```typescript
import { Button } from "@/components/ui/button";  // -> src/components/ui/button
import { cn } from "@/lib/utils";                  // -> src/lib/utils
```

## The 5 Flourishing Pillars

1. **Health** - Physical wellness, exercise, sleep, nutrition
2. **Mental** - Emotional wellbeing, stress management, mindfulness
3. **Wealth** - Financial health, career growth, money habits
4. **Relationships** - Social connections, family, community
5. **Purpose** - Meaning, goals, personal growth, contribution

## AI Coach (Florence)

The AI coach uses Claude Sonnet 4 with:
- Warm, curious, genuinely interested personality
- Evidence-based coaching (CBT, positive psychology)
- Socratic questioning to promote reflection
- Memory of past conversations via pgvector embeddings
- Tool use for mood detection, goal tracking, and insights

## Environment Variables

Required environment variables (see `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

## Git Workflow

- Feature branches: `feature/DAV-XXX-description`
- Claude branches: `claude/**` (auto-merge enabled)
- Always push to feature branches, not directly to `main`
