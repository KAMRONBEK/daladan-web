import { expect, test } from '@playwright/test'

test.describe('search', () => {
  test('search query in URL shows search page', async ({ page }) => {
    await page.goto('/search?q=e2e-smoke')
    await expect(page).toHaveURL(/\/search\?q=e2e-smoke/)
    await expect(page.getByRole('heading', { name: 'Siz uchun saralangan mahsulotlar' })).toBeVisible({
      timeout: 30_000,
    })
  })

  test('header search form navigates with query', async ({ page }) => {
    await page.goto('/')
    const q = 'test-query-from-header'
    await page.locator('#site-search').fill(q)
    await page.locator('form.site-header-search-form').getByRole('button', { name: 'Qidiruv' }).click()
    await expect(page).toHaveURL(new RegExp(`/search\\?q=${encodeURIComponent(q)}`))
  })

  test('home “Barchasini ko‘rish” goes to search', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Barchasini.*rish/ }).click()
    await expect(page).toHaveURL(/\/search$/)
    await expect(page.getByRole('heading', { name: 'Siz uchun saralangan mahsulotlar' })).toBeVisible({
      timeout: 30_000,
    })
  })

  test('category sidebar “Barchasi” is visible', async ({ page }) => {
    await page.goto('/search')
    await expect(page.getByRole('button', { name: 'Barchasi' })).toBeVisible()
  })
})
