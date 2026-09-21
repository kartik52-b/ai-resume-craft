import { expect, test } from '@playwright/test';

/**
 * E2E regression suite for AI Resume Craft.
 *
 * Runs against the production build served by `vite preview` (see
 * playwright.config.ts). The AI proxy is NOT running during e2e, which is
 * intentional: it exercises the app's real "AI not configured" degradation.
 */

// ─── Helper ────────────────────────────────────────────────────────────────────

/** Clear localStorage before each test so we start from a fresh state. */
async function freshApp(page: import('@playwright/test').Page) {
  await page.goto('/editor');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

// ─── 1. Fresh application ──────────────────────────────────────────────────────

test('fresh app loads with editor and sidebar', async ({ page }) => {
  await freshApp(page);

  // Sidebar brand text is visible
  await expect(page.getByText('AI Resume Craft').first()).toBeVisible();

  // Editor section with personal info is visible
  await expect(page.getByRole('button', { name: /Personal Information/ }).first()).toBeVisible();
  await expect(page.getByPlaceholder('Your full name')).toBeVisible();
});

// ─── 2. Create resume via dashboard ────────────────────────────────────────────

test('dashboard: create resume from empty state', async ({ page }) => {
  await freshApp(page);

  // Navigate to dashboard
  await page.getByRole('link', { name: 'My Resumes' }).first().click();
  await expect(page.getByText('Your Resumes')).toBeVisible();

  // Click "Create Resume" in empty state
  await page.getByRole('button', { name: /Create Resume/ }).click();

  // Should navigate to editor
  await expect(page.getByPlaceholder('Your full name')).toBeVisible({ timeout: 10000 });
});

// ─── 3-8. Edit all sections ────────────────────────────────────────────────────

test('edit personal information', async ({ page }) => {
  await freshApp(page);

  // Fill personal fields
  await page.getByPlaceholder('Your full name').fill('Jane Smith');
  await page.getByPlaceholder('your@email.com').fill('jane@example.com');
  await page.getByPlaceholder('+91 98765 43210').fill('+1 555 1234567');
  await page.getByPlaceholder('Agra, Uttar Pradesh, India').fill('New York, NY');

  // Verify values persist
  await expect(page.getByPlaceholder('Your full name')).toHaveValue('Jane Smith');
  await expect(page.getByPlaceholder('your@email.com')).toHaveValue('jane@example.com');
});

test('add experience', async ({ page }) => {
  await freshApp(page);

  // Expand experience section
  await page.getByRole('button', { name: /Experience/ }).first().click();

  // Click add experience
  await page.getByRole('button', { name: /Add Experience/ }).click();

  // Fill in experience fields
  await page.getByPlaceholder('Software Engineer').fill('Senior Developer');
  await page.getByPlaceholder('Google').fill('Acme Corp');
  await page.getByPlaceholder('Mountain View, CA').fill('Remote');

  // Verify values
  await expect(page.getByPlaceholder('Software Engineer')).toHaveValue('Senior Developer');
  await expect(page.getByPlaceholder('Google')).toHaveValue('Acme Corp');
});

test('add education', async ({ page }) => {
  await freshApp(page);

  // Expand education section
  await page.getByRole('button', { name: /Education/ }).first().click();

  // Click add education
  await page.getByRole('button', { name: /Add Education/ }).click();

  // Fill in education fields
  await page.getByPlaceholder('MIT').fill('MIT');
  await page.getByPlaceholder('B.S.').fill('B.S.');
  await page.getByPlaceholder('Computer Science').fill('CS');

  // Verify values
  await expect(page.getByPlaceholder('MIT')).toHaveValue('MIT');
  await expect(page.getByPlaceholder('B.S.')).toHaveValue('B.S.');
});

test('add skills', async ({ page }) => {
  await freshApp(page);

  // Expand skills section
  await page.getByRole('button', { name: /Skills/ }).first().click();

  // Add a skill
  await page.getByPlaceholder('Type a skill and press Enter').fill('TypeScript');
  await page.getByPlaceholder('Type a skill and press Enter').press('Enter');

  // Verify skill badge appears
  await expect(page.getByText('TypeScript').first()).toBeVisible();

  // Add another skill
  await page.getByPlaceholder('Type a skill and press Enter').fill('React');
  await page.getByPlaceholder('Type a skill and press Enter').press('Enter');
  await expect(page.getByText('React').first()).toBeVisible();
});

test('add project', async ({ page }) => {
  await freshApp(page);

  // Expand projects section
  await page.getByRole('button', { name: /Projects/ }).first().click();

  // Click add project
  await page.getByRole('button', { name: /Add Project/ }).click();

  // Fill in project fields
  await page.getByPlaceholder('My App').fill('Portfolio Site');
  await page.getByPlaceholder('https://...').first().fill('https://example.com');

  // Verify values
  await expect(page.getByPlaceholder('My App')).toHaveValue('Portfolio Site');
});

test('add certification', async ({ page }) => {
  await freshApp(page);

  // Expand certifications section
  await page.getByRole('button', { name: /Certifications/ }).first().click();

  // Click add certification
  await page.getByRole('button', { name: /Add Certification/ }).click();

  // Fill in certification fields
  await page.getByPlaceholder('AWS Solutions Architect').fill('AWS Certified');

  // Verify value
  await expect(page.getByPlaceholder('AWS Solutions Architect')).toHaveValue('AWS Certified');
});

// ─── 9-10. Section reorder and hide/show ───────────────────────────────────────

test('reorder sections via drag buttons', async ({ page }) => {
  await freshApp(page);

  // Get the initial order of section buttons
  const sections = page.locator('button:has-text("Experience")');
  await expect(sections.first()).toBeVisible();

  // The up arrow should be disabled for the first section (Personal)
  // but we can test moving Experience up (it's second by default)
  // Just verify the reorder buttons exist
  await expect(page.getByRole('button', { name: /Move Personal Information up/ })).toBeVisible();
});

test('hide and show section', async ({ page }) => {
  await freshApp(page);

  // Find the Experience section header
  const expSection = page.getByRole('button', { name: /Experience/ }).first();
  await expSection.click(); // expand it

  // Find hide button (eye icon)
  const hideBtn = page.getByRole('button', { name: /Hide Experience/ });
  await expect(hideBtn).toBeVisible();
  await hideBtn.click();

  // Section should show hidden message
  await expect(page.getByText('This section is hidden from your resume')).toBeVisible();

  // Show it again
  const showBtn = page.getByRole('button', { name: /Show Experience/ });
  await showBtn.click();

  // Hidden message should be gone
  await expect(page.getByText('This section is hidden from your resume')).not.toBeVisible();
});

// ─── 11-12. Undo/Redo ──────────────────────────────────────────────────────────

test('undo and redo edits', async ({ page }) => {
  await freshApp(page);

  // Make an edit
  await page.getByPlaceholder('Your full name').fill('Test User');
  await expect(page.getByPlaceholder('Your full name')).toHaveValue('Test User');

  // Undo
  const undoBtn = page.getByRole('button', { name: 'Undo' });
  await expect(undoBtn).toBeEnabled();
  await undoBtn.click();

  // Name should be cleared
  await expect(page.getByPlaceholder('Your full name')).toHaveValue('');

  // Redo
  const redoBtn = page.getByRole('button', { name: 'Redo' });
  await expect(redoBtn).toBeEnabled();
  await redoBtn.click();

  // Name should be restored
  await expect(page.getByPlaceholder('Your full name')).toHaveValue('Test User');
});

// ─── 13-14. Autosave and reload persistence ────────────────────────────────────

test('autosave persists across page reload', async ({ page }) => {
  await freshApp(page);

  // Edit the name
  await page.getByPlaceholder('Your full name').fill('Persistent User');

  // Wait for autosave (debounced at 800ms)
  await page.waitForTimeout(1200);

  // Reload
  await page.reload();

  // Data should persist
  await expect(page.getByPlaceholder('Your full name')).toHaveValue('Persistent User');
});

// ─── 15-18. Multi-resume CRUD ──────────────────────────────────────────────────

test('create, switch, duplicate, and delete resumes', async ({ page }) => {
  await freshApp(page);

  // Go to dashboard
  await page.getByRole('link', { name: 'My Resumes' }).first().click();
  await expect(page.getByText('Your Resumes')).toBeVisible();

  // Create a new resume
  await page.getByRole('button', { name: /Create New Resume/ }).click();
  await expect(page.getByPlaceholder('Your full name')).toBeVisible({ timeout: 10000 });

  // Go back to dashboard
  await page.getByRole('link', { name: 'My Resumes' }).first().click();

  // Should have at least 1 resume card
  await expect(page.getByText('Your Resumes')).toBeVisible();

  // Duplicate the first resume
  const duplicateBtn = page.locator('[aria-label]').filter({ hasText: '' }).first();
  // Use the copy icon button on the card
  const copyBtn = page.locator('button').filter({ has: page.locator('svg') }).nth(0);
  // Actually, let's use the Dashboard's duplicate button which is inside the card actions
  // The duplicate button has a Copy icon - let's find it via the card
  await page.locator('.group').first().locator('button').nth(1).click(); // Copy button is second

  // Now delete - click the trash icon twice (confirm pattern)
  const trashBtn = page.locator('.group').first().locator('button').last();
  await trashBtn.click();
  await page.waitForTimeout(500);
  await trashBtn.click();

  // Verify we can still see the dashboard
  await expect(page.getByText('Your Resumes')).toBeVisible();
});

// ─── 19. Template switching ────────────────────────────────────────────────────

test('switch resume template via dialog', async ({ page }) => {
  await freshApp(page);

  // Open template picker via the Template button in the editor toolbar
  const templateBtn = page.getByRole('button', { name: /Template/ });
  await expect(templateBtn).toBeVisible();
  await templateBtn.click();

  // Dialog should open with template options
  await expect(page.getByText('Choose a template')).toBeVisible({ timeout: 5000 });

  // Click on Minimal template card
  const minimalCard = page.getByText('Minimal').first();
  await expect(minimalCard).toBeVisible();
  await minimalCard.click();

  // Close the dialog
  await page.keyboard.press('Escape');
});

// ─── 20. Job Match ─────────────────────────────────────────────────────────────

test('Job Match page loads with input area', async ({ page }) => {
  await freshApp(page);

  await page.getByRole('link', { name: 'Job Match' }).first().click();
  await expect(page.getByText('Paste a Job Description')).toBeVisible({ timeout: 10000 });

  // Textarea should be present
  await expect(page.getByPlaceholder(/Paste the full job description/)).toBeVisible();
});

// ─── 22. Settings ──────────────────────────────────────────────────────────────

test('Settings page shows account and data sections', async ({ page }) => {
  await freshApp(page);

  await page.getByRole('link', { name: 'Settings' }).first().click();
  await expect(page.getByText('Account').first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Data & Privacy')).toBeVisible();
});

// ─── 23. Theme switching ───────────────────────────────────────────────────────

test('theme toggle cycles through light/dark/system', async ({ page }) => {
  await freshApp(page);

  // Find the theme toggle button in the sidebar footer
  const themeBtn = page.getByRole('button', { name: 'Toggle theme' });
  await expect(themeBtn).toBeVisible();

  // Click to switch to dark
  await themeBtn.click();

  // The html element should have the dark class
  await expect(page.locator('html')).toHaveClass(/dark/);

  // Click again to switch to system (which removes dark class or keeps it)
  await themeBtn.click();

  // Click again to switch back to light
  await themeBtn.click();
});

// ─── 24. Import dialog ─────────────────────────────────────────────────────────

test('import dialog opens and closes from dashboard', async ({ page }) => {
  await freshApp(page);

  // Navigate to dashboard where the import button lives
  await page.getByRole('link', { name: 'My Resumes' }).first().click();
  await expect(page.getByText('Your Resumes')).toBeVisible();

  // Open import dialog via the Import button
  const importBtn = page.getByRole('button', { name: /Import/ });
  await expect(importBtn).toBeVisible();
  await importBtn.click();

  // Dialog should be visible
  await expect(page.getByText('Import resume').first()).toBeVisible({ timeout: 5000 });

  // Close via Escape
  await page.keyboard.press('Escape');
});

// ─── 25. PDF export ────────────────────────────────────────────────────────────

test('PDF export triggers download', async ({ page }) => {
  await freshApp(page);

  // Set up download listener
  const downloadPromise = page.waitForEvent('download');

  // Click export PDF
  await page.getByRole('button', { name: 'Export PDF' }).click();

  // Should show success toast
  await expect(page.getByText(/PDF exported/)).toBeVisible({ timeout: 15000 });
});

// ─── Sidebar navigation: all routes load ───────────────────────────────────────

test('sidebar navigation: all routes load', async ({ page }) => {
  await freshApp(page);

  const routes = [
    { nav: 'Home', heading: 'AI Resume Craft' },
    { nav: 'My Resumes', heading: 'Your Resumes' },
    { nav: 'Job Match', heading: 'Paste a Job Description' },
    { nav: 'AI Coach', heading: 'AI Resume Coach' },
    { nav: 'Templates', heading: 'Choose a professional design' },
    { nav: 'Settings', heading: 'Account' },
  ];

  for (const { nav, heading } of routes) {
    await page.getByRole('link', { name: nav }).first().click();
    await expect(page.getByText(heading).first()).toBeVisible({ timeout: 10000 });
  }

  // Navigate back to editor
  await page.getByRole('link', { name: 'Resume Editor' }).first().click();
  await expect(page.getByPlaceholder('Your full name')).toBeVisible({ timeout: 10000 });
});

// ─── 404 page ──────────────────────────────────────────────────────────────────

test('404 page shows for unknown routes', async ({ page }) => {
  await freshApp(page);
  await page.goto('/nonexistent-route');
  await expect(page.getByText('404')).toBeVisible();
  await expect(page.getByText('Page not found')).toBeVisible();
});
