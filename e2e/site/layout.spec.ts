import { expect, test } from '@playwright/test'
import { expectSiteLoginPage } from '../helpers/loginPages'

test.describe('layout', () => {
  test('header logo navigates home', async ({ page }) => {
    await page.goto('/search')
    await page.locator('header').getByRole('link', { name: 'Daladan' }).first().click()
    await expect(page).toHaveURL(/\/?$/)
  })

  test('footer links are present', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: '+998 93 656 78 90' })).toHaveAttribute('href', 'tel:+998936567890')
    await expect(page.getByRole('link', { name: '+998 33 249 91 11' })).toHaveAttribute('href', 'tel:+998332499111')
    const external = page.getByRole('link', { name: 'softwhere.uz' })
    await expect(external).toHaveAttribute('href', 'https://softwhere.uz')
    await expect(external).toHaveAttribute('target', '_blank')
  })

  test('theme toggle flips data-theme on html', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    const before = await html.getAttribute('data-theme')
    await page.getByRole('button', { name: /rejimga o'tish/ }).first().click()
    await expect.poll(async () => html.getAttribute('data-theme')).not.toBe(before)
  })

  test('favorites button sends guests to login', async ({ page }) => {
    await page.goto('/')
    await page.locator('header').getByRole('button').nth(2).click()
    await expectSiteLoginPage(page)
  })
})
