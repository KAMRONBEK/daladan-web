import { expect, test } from '@playwright/test'

test.describe('site', () => {
  test('home loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Daladan/)
  })
})
