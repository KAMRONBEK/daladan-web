import { expect, test } from '@playwright/test'

test.describe('smoke', () => {
  test('home loads with title and main sections', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Daladan/)
    await expect(page.getByRole('heading', { name: 'Mashhur kategoriyalar' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Yaxshi topilanmalar' })).toBeVisible()
  })
})
