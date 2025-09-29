import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should redirect to sign in page when not authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/auth/signin')
  })

  test('should sign in with valid credentials', async ({ page }) => {
    await page.goto('/auth/signin')
    
    await page.fill('input[type="email"]', 'anderson@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/')
    await expect(page.getByText('SCC Task Manager')).toBeVisible()
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin')
    
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    await expect(page.getByText('Invalid credentials')).toBeVisible()
  })
})
