import { expect, test } from '@playwright/test'

test.describe('search', () => {
  test('search query in URL shows search page', async ({ page }) => {
    await page.goto('/search?q=e2e-smoke')
    await expect(page).toHaveURL(/\/search\?q=e2e-smoke/)
    await expect(page.getByText("Barcha e'lonlar")).toBeVisible({
      timeout: 30_000,
    })
  })

  test('header search form navigates with query', async ({ page }) => {
    await page.goto('/')
    const q = 'test-query-from-header'
    await page.locator('#site-search').fill(q)
    await page.locator('header').getByRole('button', { name: 'Qidiruv' }).click()
    await expect(page).toHaveURL(new RegExp(`[/?]q=${encodeURIComponent(q)}($|&)`))
  })

  test('mobile bottom nav opens search route', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.getByRole('navigation', { name: 'Asosiy navigatsiya' }).getByRole('link', { name: 'Qidiruv' }).click()
    await expect(page).toHaveURL(/\/search$/)
    await expect(page.getByText("Barcha e'lonlar")).toBeVisible({
      timeout: 30_000,
    })
  })

  test('category sidebar shows filter heading and a root category', async ({ page }) => {
    await page.goto('/search')
    await expect(page.getByText('Kategoriyalar')).toBeVisible({ timeout: 30_000 })
    await expect(page.getByRole('button', { name: "Qishloq xo'jaligi" })).toBeVisible()
  })
})
