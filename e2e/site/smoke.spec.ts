import { expect, test } from '@playwright/test'

test.describe('smoke', () => {
  test('home loads with title and main sections', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Eldan/)
    await expect(page.getByRole('navigation', { name: "Sahifa yo'li" })).toBeVisible()
    await expect(page.getByText("Barcha e'lonlar")).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText('Kategoriyalar')).toBeVisible({ timeout: 30_000 })
  })
})
