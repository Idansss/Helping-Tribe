import { expect, test } from '@playwright/test'

test.describe('public experience', () => {
  test('home has stable navigation, FAQ and no page overflow', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Learn to help with skill')
    await expect(page.locator('#faq')).toHaveCount(1)
    await expect(page.getByRole('link', { name: 'Start your application' }).first()).toHaveAttribute('href', '/apply')

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)
    expect(pageErrors).toEqual([])
  })

  test('theme preference toggles and persists', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const root = page.locator('html')
    const darkButton = page.getByRole('button', { name: 'Use dark appearance' })
    const lightButton = page.getByRole('button', { name: 'Use light appearance' })

    if (await darkButton.count()) await darkButton.click()
    else await lightButton.click()

    const expectedTheme = await root.evaluate((element) => element.classList.contains('dark') ? 'dark' : 'light')
    await page.reload()
    await expect(root).toHaveClass(new RegExp(expectedTheme))
  })

  test('mobile menu is a keyboard-managed dialog', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.startsWith('desktop'), 'Mobile navigation check')
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const trigger = page.getByRole('button', { name: 'Open navigation menu' })
    await trigger.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Explore Helping Tribe' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('application entry reflows without overflow', async ({ page }) => {
    await page.goto('/apply', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('main')).toBeVisible()
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)
  })
})
