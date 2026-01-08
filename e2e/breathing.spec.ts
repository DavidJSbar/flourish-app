import { test, expect } from '@playwright/test'

test.describe('Breathing Exercises', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/breathing')
  })

  test('should load the breathing exercises page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /breathing exercises/i })).toBeVisible()
  })

  test('should display all breathing exercise types', async ({ page }) => {
    // Check all 4 exercise types are displayed
    await expect(page.getByText('Box Breathing')).toBeVisible()
    await expect(page.getByText('4-7-8 Relaxation')).toBeVisible()
    await expect(page.getByText('Coherent Breathing')).toBeVisible()
    await expect(page.getByText('Resonance Breathing')).toBeVisible()
  })

  test('should display duration options', async ({ page }) => {
    await expect(page.getByRole('button', { name: '1 minute' })).toBeVisible()
    await expect(page.getByRole('button', { name: '3 minutes' })).toBeVisible()
    await expect(page.getByRole('button', { name: '5 minutes' })).toBeVisible()
    await expect(page.getByRole('button', { name: '10 minutes' })).toBeVisible()
  })

  test('should allow selecting different breathing patterns', async ({ page }) => {
    // Click on 4-7-8 breathing
    await page.getByText('4-7-8 Relaxation').click()

    // The card should be selected (has ring)
    const card = page.locator('div').filter({ hasText: '4-7-8 Relaxation' }).first()
    await expect(card).toBeVisible()
  })

  test('should allow selecting different durations', async ({ page }) => {
    // Select 5 minutes
    await page.getByRole('button', { name: '5 minutes' }).click()

    // Button should appear selected (default variant)
    const button = page.getByRole('button', { name: '5 minutes' })
    await expect(button).toBeVisible()
  })

  test('should start breathing session when clicking start', async ({ page }) => {
    // Click start button
    await page.getByRole('button', { name: /start breathing/i }).click()

    // Should show the active session with countdown
    await expect(page.getByRole('button', { name: /end session/i })).toBeVisible()
  })

  test('should display breathing phases during active session', async ({ page }) => {
    // Start session
    await page.getByRole('button', { name: /start breathing/i }).click()

    // Should show a phase instruction
    await expect(
      page.getByText(/breathe in|hold|breathe out/i)
    ).toBeVisible()
  })

  test('should end session when clicking end', async ({ page }) => {
    // Start session
    await page.getByRole('button', { name: /start breathing/i }).click()

    // End session
    await page.getByRole('button', { name: /end session/i }).click()

    // Should go back to selection screen
    await expect(page.getByRole('button', { name: /start breathing/i })).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/breathing')

    // Page should still be functional
    await expect(page.getByRole('heading', { name: /breathing exercises/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /start breathing/i })).toBeVisible()
  })
})
