import { test, expect } from '@playwright/test'

test.describe('Thought Diary', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/thought-diary')
  })

  test('should load the thought diary page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /thought diary/i })).toBeVisible()
  })

  test('should display non-clinical disclaimer', async ({ page }) => {
    await expect(page.getByText(/not a substitute for professional/i)).toBeVisible()
  })

  test('should show situation input as first step', async ({ page }) => {
    await expect(page.getByText(/what happened/i)).toBeVisible()
    await expect(page.getByPlaceholder(/describe the situation/i)).toBeVisible()
  })

  test('should progress through diary steps', async ({ page }) => {
    // Step 1: Situation
    await page.getByPlaceholder(/describe the situation/i).fill('Had a stressful meeting at work')
    await page.getByRole('button', { name: /next/i }).click()

    // Step 2: Automatic thought
    await expect(page.getByText(/what went through your mind/i)).toBeVisible()
    await page.getByPlaceholder(/what thought automatically/i).fill('Everyone thinks I am incompetent')
    await page.getByRole('button', { name: /next/i }).click()

    // Step 3: Initial emotion
    await expect(page.getByText(/how did you feel/i)).toBeVisible()
    await page.getByRole('button', { name: 'Anxious' }).click()
    await page.getByRole('button', { name: /next/i }).click()

    // Step 4: Distortions
    await expect(page.getByText(/identify thinking patterns/i)).toBeVisible()
  })

  test('should display cognitive distortions', async ({ page }) => {
    // Navigate to distortions step
    await page.getByPlaceholder(/describe the situation/i).fill('Test situation')
    await page.getByRole('button', { name: /next/i }).click()
    await page.getByPlaceholder(/what thought automatically/i).fill('They think I am bad')
    await page.getByRole('button', { name: /next/i }).click()
    await page.getByRole('button', { name: 'Anxious' }).click()
    await page.getByRole('button', { name: /next/i }).click()

    // Check cognitive distortions are shown
    await expect(page.getByText('All-or-Nothing Thinking')).toBeVisible()
    await expect(page.getByText('Catastrophizing')).toBeVisible()
    await expect(page.getByText('Mind Reading')).toBeVisible()
  })

  test('should allow selecting cognitive distortions', async ({ page }) => {
    // Navigate to distortions step
    await page.getByPlaceholder(/describe the situation/i).fill('Test situation')
    await page.getByRole('button', { name: /next/i }).click()
    await page.getByPlaceholder(/what thought automatically/i).fill('They think I am bad')
    await page.getByRole('button', { name: /next/i }).click()
    await page.getByRole('button', { name: 'Anxious' }).click()
    await page.getByRole('button', { name: /next/i }).click()

    // Click on a distortion to select it
    await page.getByText('Mind Reading').click()

    // Should show selected patterns
    await expect(page.getByText(/selected patterns/i)).toBeVisible()
  })

  test('should detect distortions from thought text', async ({ page }) => {
    // Navigate to distortions step with thought containing distortion patterns
    await page.getByPlaceholder(/describe the situation/i).fill('Meeting at work')
    await page.getByRole('button', { name: /next/i }).click()
    await page.getByPlaceholder(/what thought automatically/i).fill('Everyone thinks I am terrible')
    await page.getByRole('button', { name: /next/i }).click()
    await page.getByRole('button', { name: 'Anxious' }).click()
    await page.getByRole('button', { name: /next/i }).click()

    // Should show AI suggestion for mind reading
    await expect(page.getByText(/ai suggestion/i)).toBeVisible()
  })

  test('should complete full diary flow', async ({ page }) => {
    // Step 1: Situation
    await page.getByPlaceholder(/describe the situation/i).fill('Had a presentation')
    await page.getByRole('button', { name: /next/i }).click()

    // Step 2: Automatic thought
    await page.getByPlaceholder(/what thought automatically/i).fill('I always mess things up')
    await page.getByRole('button', { name: /next/i }).click()

    // Step 3: Initial emotion
    await page.getByRole('button', { name: 'Anxious' }).click()
    await page.getByRole('button', { name: /next/i }).click()

    // Step 4: Distortions
    await page.getByText('All-or-Nothing Thinking').click()
    await page.getByRole('button', { name: /next/i }).click()

    // Step 5: Alternative thought
    await page.getByPlaceholder(/write a more balanced/i).fill('Sometimes I do well, sometimes I struggle. This is normal.')
    await page.getByRole('button', { name: /next/i }).click()

    // Step 6: New emotion
    await page.getByRole('button', { name: 'Anxious' }).click()
    await page.getByRole('button', { name: /complete/i }).click()

    // Should show completion
    await expect(page.getByText(/great work/i)).toBeVisible()
  })

  test('should allow navigating back through steps', async ({ page }) => {
    // Go to step 2
    await page.getByPlaceholder(/describe the situation/i).fill('Test')
    await page.getByRole('button', { name: /next/i }).click()

    // Go back
    await page.getByRole('button', { name: /back/i }).click()

    // Should be back at step 1
    await expect(page.getByPlaceholder(/describe the situation/i)).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/thought-diary')

    await expect(page.getByRole('heading', { name: /thought diary/i })).toBeVisible()
  })
})
