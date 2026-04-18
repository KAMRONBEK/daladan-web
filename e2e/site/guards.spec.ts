import { test } from '@playwright/test'
import { expectSiteLoginPage } from '../helpers/loginPages'

test.describe('auth guards', () => {
  test('profile redirects to login', async ({ page }) => {
    await page.goto('/profile')
    await expectSiteLoginPage(page)
  })

  test('favorites redirects to login', async ({ page }) => {
    await page.goto('/favorites')
    await expectSiteLoginPage(page)
  })

  test('new ad route redirects to login', async ({ page }) => {
    await page.goto('/profile/ads/new')
    await expectSiteLoginPage(page)
  })

  test('ad boost route redirects to login', async ({ page }) => {
    await page.goto('/ad-boost/1')
    await expectSiteLoginPage(page)
  })
})
