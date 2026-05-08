import { expect, test } from '@playwright/test'

test.describe('categories', () => {
  test('selecting a root category in sidebar updates breadcrumb', async ({ page }) => {
    await page.goto('/search')
    await expect(page.getByText('Kategoriyalar')).toBeVisible({ timeout: 30_000 })
    const label = "Qishloq xo'jaligi"
    await page.getByRole('button', { name: label }).click()
    await expect(page.getByRole('navigation', { name: "Sahifa yo'li" })).toContainText(label)
  })
})
