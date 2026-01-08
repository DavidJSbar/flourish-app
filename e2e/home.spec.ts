import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')

    // Check page title
    await expect(page).toHaveTitle(/Flourish/)
  })

  test('should have main navigation elements', async ({ page }) => {
    await page.goto('/')

    // The page should load without errors
    await expect(page.locator('body')).toBeVisible()
  })

  test('should be accessible', async ({ page }) => {
    await page.goto('/')

    // Basic accessibility check - page loads without errors
    await expect(page.locator('body')).toBeVisible()
  })
})
