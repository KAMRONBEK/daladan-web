import { test } from '@playwright/test'
import { expectAdminLoginPage } from '../helpers/loginPages'

test.describe('admin shell (logged out)', () => {
  test('root redirects to login', async ({ page }) => {
    await page.goto('/')
    await expectAdminLoginPage(page)
  })

  test('login page shows admin title', async ({ page }) => {
    await page.goto('/login')
    await expectAdminLoginPage(page)
  })

  test('deep routes redirect to login', async ({ page }) => {
    await page.goto('/categories')
    await expectAdminLoginPage(page)

    await page.goto('/moderation')
    await expectAdminLoginPage(page)

    await page.goto('/users')
    await expectAdminLoginPage(page)
  })
})
