import { expect, test } from '@playwright/test'

test.describe('auth shell', () => {
  test('login page renders without submitting', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Kirish' })).toBeVisible()
    await expect(page.locator('form input[type="password"]')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Parolni unutdingizmi?' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Google orqali kirish' })).toBeVisible()
  })

  test('auth callback page shows error without token', async ({ page }) => {
    await page.goto('/auth/callback')
    await expect(page.getByText('Autentifikatsiya tokeni topilmadi')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Kirish sahifasiga qaytish' })).toBeVisible()
  })

  test('register page renders without submitting', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: "Ro'yxatdan o'tish" })).toBeVisible({ timeout: 30_000 })
  })
})
