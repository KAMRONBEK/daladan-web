import { expect, test } from '@playwright/test'

test.describe('categories', () => {
  test('first category tile navigates to search with cat param', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Mashhur kategoriyalar' })).toBeVisible()
    const first = page.locator('main a[aria-label]').first()
    await expect(first).toBeVisible({ timeout: 30_000 })
    const label = await first.getAttribute('aria-label')
    expect(label).toBeTruthy()
    await first.click()
    await expect(page).toHaveURL(/\/search/)
    expect(new URL(page.url()).searchParams.get('cat')).toBe(label)
  })
})
