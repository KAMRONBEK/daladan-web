import { expect, test } from '@playwright/test'

test.describe('item', () => {
  test('unknown listing id shows not found message', async ({ page }) => {
    await page.goto('/item/e2e-nonexistent-listing-id')
    await expect(page.getByText('Mahsulot topilmadi.')).toBeVisible({ timeout: 30_000 })
  })
})
