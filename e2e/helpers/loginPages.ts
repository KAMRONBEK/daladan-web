import { expect, type Page } from '@playwright/test'

export async function expectSiteLoginPage(page: Page) {
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Kirish' })).toBeVisible()
}

export async function expectAdminLoginPage(page: Page) {
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Admin paneliga kirish' })).toBeVisible()
}
