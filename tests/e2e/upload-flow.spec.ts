/**
 * E2E tests for upload workflow
 * TDD: These tests should FAIL before implementation
 */

import { test, expect } from '@playwright/test';

test.describe('Lab Result Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/upload');
  });

  test('should display upload page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Laboratory Information Management System/);
    await expect(page.locator('h1')).toContainText('Upload');
  });

  test('should upload a PDF file successfully', async ({ page }) => {
    // Create a test file
    const fileContent = Buffer.from('Mock PDF content for testing');

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-lab-result.pdf',
      mimeType: 'application/pdf',
      buffer: fileContent,
    });

    // Submit the upload
    await page.click('button:has-text("Upload")');

    // Wait for success message
    await expect(page.locator('text=Success')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should upload an image file successfully', async ({ page }) => {
    const fileContent = Buffer.from('Mock image content');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-lab-result.jpg',
      mimeType: 'image/jpeg',
      buffer: fileContent,
    });

    await page.click('button:has-text("Upload")');

    await expect(page.locator('text=Success')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should show error for unsupported file types', async ({ page }) => {
    const fileContent = Buffer.from('Mock document content');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.docx',
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: fileContent,
    });

    await page.click('button:has-text("Upload")');

    await expect(page.locator('text=/error|invalid/i')).toBeVisible();
  });

  test('should show upload progress', async ({ page }) => {
    const fileContent = Buffer.from('Mock PDF content');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: fileContent,
    });

    await page.click('button:has-text("Upload")');

    // Should show some kind of loading state
    await expect(
      page.locator('text=/uploading|processing/i')
    ).toBeVisible();
  });

  test('should trigger extraction after upload', async ({ page }) => {
    const fileContent = Buffer.from('Mock PDF content');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: fileContent,
    });

    await page.click('button:has-text("Upload")');

    // Wait for upload to complete
    await expect(page.locator('text=Success')).toBeVisible({
      timeout: 10000,
    });

    // Should show extraction status
    await expect(
      page.locator('text=/extracting|analyzing/i')
    ).toBeVisible({ timeout: 5000 });
  });

  test('should display extraction results', async ({ page }) => {
    const fileContent = Buffer.from('Mock PDF content');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: fileContent,
    });

    await page.click('button:has-text("Upload")');

    // Wait for complete workflow
    await expect(page.locator('text=/completed|done/i')).toBeVisible({
      timeout: 30000,
    });

    // Should show extracted data
    await expect(page.locator('text=/patient|test/i')).toBeVisible();
  });

  test('should allow uploading another file after success', async ({
    page,
  }) => {
    const fileContent = Buffer.from('Mock PDF content');

    // First upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test1.pdf',
      mimeType: 'application/pdf',
      buffer: fileContent,
    });

    await page.click('button:has-text("Upload")');
    await expect(page.locator('text=Success')).toBeVisible({
      timeout: 10000,
    });

    // Second upload
    await fileInput.setInputFiles({
      name: 'test2.pdf',
      mimeType: 'application/pdf',
      buffer: fileContent,
    });

    await page.click('button:has-text("Upload")');
    await expect(page.locator('text=Success')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should navigate to results page after upload', async ({ page }) => {
    const fileContent = Buffer.from('Mock PDF content');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: fileContent,
    });

    await page.click('button:has-text("Upload")');

    await expect(page.locator('text=Success')).toBeVisible({
      timeout: 10000,
    });

    // Should have a link to view results
    await page.click('a:has-text("View Results")');

    await expect(page).toHaveURL(/\/results/);
  });
});
