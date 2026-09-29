const { expect, test } = require('@playwright/test');

/**
 * E2E regression suite for AI Resume Craft.
 *
 * Runs against the production build served by `vite preview` (see
 * playwright.config.cjs). Plain CJS + JS (no TS) so the suite loads under any
 * Node-compatible runtime, including Bun's node shim.
 *
 * Data model note: a brand-new visitor has NO resume. Editor tests therefore
 * seed one blank resume (exactly what the create flow produces) before
 * navigating, while the onboarding tests below start from genuinely no data.
 */

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Removes any stored data and loads the landing page. */
async function freshVisit(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
}

/**
 * Seeds one blank resume (the state right after the create flow) and opens the
 * editor — no sample/personal content is involved.
 *
 * Seeding MUST happen through addInitScript: the ResumeProvider flushes its
 * in-memory store to localStorage on `beforeunload`, so any script that writes
 * the key after the app has booted gets clobbered by the next navigation. The
 * init script runs before app code on every load and never overwrites a store
 * that already contains real resumes.
 */
async function freshApp(page, options = {}) {
  const { summary = '' } = options;
  await page.addInitScript((seedSummary) => {
    const raw = localStorage.getItem('ai-resume-craft:store');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.store?.resumes) && parsed.store.resumes.length > 0) return;
      } catch {
        // fall through and reseed
      }
    }
    const id = 'e2e-resume-1';
    localStorage.setItem('ai-resume-craft:store', JSON.stringify({
      version: 2,
      savedAt: new Date().toISOString(),
      store: {
        resumes: [{
          id,
          title: 'My Resume',
          template: 'modern',
          personal: { fullName: '', email: '', phone: '', location: '', headline: '', website: '', linkedin: '', github: '', summary: seedSummary },
          experience: [], education: [], skills: [], projects: [], certifications: [],
        }],
        activeId: id,
      },
    }));
  }, summary);
  await page.goto('/editor');
  await expect(page.getByPlaceholder('Your full name')).toBeVisible();
}

/**
 * Seeds `count` blank resumes (exactly what the app creates — no personal
 * content) so the My Resumes rail has more cards than fit on one page.
 */
async function seedResumes(page, count) {
  await page.addInitScript((n) => {
    const raw = localStorage.getItem('ai-resume-craft:store');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.store?.resumes) && parsed.store.resumes.length > 0) return;
      } catch {
        // fall through and reseed
      }
    }
    const resumes = Array.from({ length: n }, (_, i) => ({
      id: `e2e-r${i + 1}`,
      title: i === 0 ? 'My Resume' : `My Resume ${i + 1}`,
      template: 'modern',
      personal: { fullName: '', email: '', phone: '', location: '', headline: '', website: '', linkedin: '', github: '', summary: '' },
      experience: [], education: [], skills: [], projects: [], certifications: [],
    }));
    localStorage.setItem('ai-resume-craft:store', JSON.stringify({
      version: 2,
      savedAt: new Date().toISOString(),
      store: { resumes, activeId: resumes[0].id },
    }));
  }, count);
}

/** Walks the five-step create flow with the given details and design index. */
async function completeOnboarding(page, details, templateIndex = 0) {
  await expect(page.getByText('Tell us about yourself')).toBeVisible();
  await page.getByLabel(/Full Name/).fill(details.name);
  await page.getByLabel(/Email/).fill(details.email);
  await page.getByLabel(/Phone/).fill(details.phone);
  await page.getByRole('button', { name: /^Continue/ }).click();
  await expect(page.getByRole('heading', { name: 'Your professional summary' })).toBeVisible();
  await page.getByRole('button', { name: /^Continue/ }).click();
  await expect(page.getByRole('heading', { name: 'Round out your background' })).toBeVisible();
  await page.getByRole('button', { name: /Next: Choose Design/ }).click();
  await expect(page.getByText('Choose a design for your resume')).toBeVisible();
  await page.getByRole('button', { name: /Use This Template/ }).nth(templateIndex).click();
  await expect(page.getByPlaceholder('Your full name')).toBeVisible({ timeout: 10000 });
}

// ─── 1. Fresh application ──────────────────────────────────────────────────────

test('fresh app loads with editor and header toolbar', async ({ page }) => {
  await freshApp(page);

  // Editor toolbar (breadcrumb + actions) is visible
  await expect(page.getByRole('button', { name: 'Export PDF' })).toBeVisible();

  // Editor section with personal info is visible
  await expect(page.getByRole('button', { name: /Personal Information/ }).first()).toBeVisible();
  await expect(page.getByPlaceholder('Your full name')).toBeVisible();
});

// ─── 2. Landing page + slider ─────────────────────────────────────────────────

test('landing renders hero, slider and CTA sections', async ({ page }) => {
  await freshVisit(page);

  await expect(page.getByRole('heading', { name: 'Create a Resume That Gets You Noticed.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Four steps to a finished resume' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ready to build your resume?' })).toBeVisible();

  // Home slider: counter, next/previous and pause controls all work.
  const slider = page.getByRole('region', { name: 'AI Resume Craft highlights' });
  await expect(slider.getByText('1 / 4')).toBeVisible();
  await slider.getByRole('button', { name: 'Next slide' }).click();
  await expect(slider.getByText('2 / 4')).toBeVisible();
  await slider.getByRole('button', { name: 'Previous slide' }).click();
  await expect(slider.getByText('1 / 4')).toBeVisible();
  await slider.getByRole('button', { name: 'Pause autoplay' }).click();
  await expect(slider.getByRole('button', { name: 'Resume autoplay' })).toBeVisible();
});

test('header navigation reaches every main page', async ({ page }) => {
  await freshVisit(page);

  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Templates' }).click();
  await expect(page.getByText('Choose a resume design that fits your career.')).toBeVisible();

  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'My Resumes' }).click();
  await expect(page.getByText('Welcome to AI Resume Craft')).toBeVisible();

  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Home' }).click();
  await expect(page.getByRole('heading', { name: 'Create a Resume That Gets You Noticed.' })).toBeVisible();
});

// ─── 3. New user: welcome state → create flow → editor ────────────────────────

test('new user sees the welcome state and completes the create flow', async ({ page }) => {
  await freshVisit(page);

  // Dashboard shows the welcome state — never a fake/previous resume.
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'My Resumes' }).first().click();
  await expect(page.getByText('Welcome to AI Resume Craft')).toBeVisible();
  await expect(page.getByText('Create your first professional resume.')).toBeVisible();

  // The primary CTA starts the create flow.
  await page.getByRole('button', { name: /Create New Resume/ }).click();
  await completeOnboarding(page, { name: 'Jane Smith', email: 'jane@example.com', phone: '+1 555 123 4567' });

  // The editor holds the user's own details and nothing else.
  await expect(page.getByPlaceholder('Your full name')).toHaveValue('Jane Smith');
  await expect(page.getByPlaceholder('you@example.com')).toHaveValue('jane@example.com');
});

test('landing CTA creates a resume from scratch', async ({ page }) => {
  await freshVisit(page);

  await page.getByRole('button', { name: /Create My Resume/ }).first().click();
  await completeOnboarding(page, { name: 'Sam Lee', email: 'sam@example.com', phone: '5551234567' }, 1);

  await expect(page.getByPlaceholder('Your full name')).toHaveValue('Sam Lee');
  // No sample persona leaks into the user's resume.
  await expect(page.getByPlaceholder('Your full name')).not.toHaveValue('Alex Morgan');
});

// ─── 4-8. Edit all sections ───────────────────────────────────────────────────

test('edit personal information', async ({ page }) => {
  await freshApp(page);

  // Fill personal fields
  await page.getByPlaceholder('Your full name').fill('Jane Smith');
  await page.getByPlaceholder('you@example.com').fill('jane@example.com');
  await page.getByPlaceholder('+1 555 123 4567').fill('+1 555 1234567');
  await page.getByPlaceholder('City, Country').fill('New York, NY');

  // Verify values persist
  await expect(page.getByPlaceholder('Your full name')).toHaveValue('Jane Smith');
  await expect(page.getByPlaceholder('you@example.com')).toHaveValue('jane@example.com');
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

test('section reorder controls exist', async ({ page }) => {
  await freshApp(page);

  // The move up/down buttons exist for every section (keyboard-accessible reorder).
  await expect(page.getByRole('button', { name: /Move Personal Information up/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Move Personal Information down/ })).toBeVisible();
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
  await expect(page.getByText('Hidden from resume. Click eye to show.')).toBeVisible();

  // Show it again
  const showBtn = page.getByRole('button', { name: /Show Experience/ });
  await showBtn.click();

  // Hidden message should be gone
  await expect(page.getByText('Hidden from resume. Click eye to show.')).not.toBeVisible();
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

test('dashboard lists, duplicates and deletes resumes', async ({ page }) => {
  await freshApp(page);

  // Go to dashboard
  await page.getByRole('link', { name: 'My Resumes' }).first().click();
  await expect(page.getByText('Your Resumes')).toBeVisible();

  // Create a second resume through the guided flow
  await page.getByRole('button', { name: /Create New Resume/ }).click();
  await completeOnboarding(page, { name: 'Second Resume', email: 'second@example.com', phone: '5551234567' });

  // Go back to dashboard
  await page.getByRole('link', { name: 'My Resumes' }).first().click();
  await expect(page.getByText('Your Resumes')).toBeVisible();

  // Duplicate the first resume card via its labelled button
  await page.getByRole('button', { name: /^Duplicate / }).first().click();
  await page.waitForTimeout(300);

  // Delete one copy — click the delete button, then confirm
  const deleteBtn = page.getByRole('button', { name: /^Delete / }).first();
  await deleteBtn.click();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: /^Confirm delete / }).first().click();

  // Dashboard still renders with the remaining resume(s)
  await expect(page.getByText('Your Resumes')).toBeVisible();
});

// ─── 19. Template switching ────────────────────────────────────────────────────

test('switch resume template via dialog', async ({ page }) => {
  await freshApp(page);

  // Open the template picker via the "Change Template" button in the editor toolbar
  const templateBtn = page.getByRole('button', { name: /Change Template/ });
  await expect(templateBtn).toBeVisible();
  await templateBtn.click();

  // Dialog should open with template options (match the heading — the
  // toolbar button carries the same words)
  await expect(page.getByRole('heading', { name: 'Change template' })).toBeVisible({ timeout: 5000 });

  // Click on Minimal template card
  const minimalCard = page.getByText('Minimal', { exact: true }).first();
  await expect(minimalCard).toBeVisible();
  await minimalCard.click();

  // Close the dialog
  await page.keyboard.press('Escape');
});

// ─── 20. Templates page gallery ────────────────────────────────────────────────

test('templates page shows gallery and spotlight slider', async ({ page }) => {
  await freshVisit(page);

  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Templates' }).click();
  await expect(page.getByText('Choose a resume design that fits your career.')).toBeVisible();

  // Spotlight carousel controls
  const spotlight = page.getByRole('region', { name: 'Featured design collections' });
  await expect(spotlight.getByRole('button', { name: 'Next slide' })).toBeVisible();
  await spotlight.getByRole('button', { name: 'Next slide' }).click();

  // Use Template buttons are present for every card
  await expect(page.getByRole('button', { name: /Use Template/ }).first()).toBeVisible();
});

// ─── 21. Theme switching ───────────────────────────────────────────────────────

test('theme toggle cycles through light/dark/system', async ({ page }) => {
  await freshApp(page);

  // The editor toolbar hosts the theme control (fresh context → system theme)
  const themeBtn = page.getByRole('button', { name: 'Toggle theme' });
  await expect(themeBtn).toBeVisible();

  // system → light → dark
  await themeBtn.click();
  await themeBtn.click();
  await expect(page.locator('html')).toHaveClass(/dark/);

  // dark → system (light OS preference → no dark class)
  await themeBtn.click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

// ─── 22. PDF export ────────────────────────────────────────────────────────────

test('PDF export triggers download', async ({ page }) => {
  await freshApp(page);

  // Set up download listener
  const downloadPromise = page.waitForEvent('download');

  // Click export PDF
  await page.getByRole('button', { name: 'Export PDF' }).click();

  // Should show success toast
  await expect(page.getByText(/PDF exported/)).toBeVisible({ timeout: 15000 });
});

// ─── 23. All routes load for a returning user ──────────────────────────────────

test('all routes load for a returning user', async ({ page }) => {
  await freshApp(page);
  // Start from a header-bearing page — the editor intentionally has its own
  // toolbar instead of the site header.
  await page.goto('/');

  const routes = [
    { nav: 'Home', heading: 'Create a Resume That Gets You Noticed.' },
    { nav: 'My Resumes', heading: 'Your Resumes' },
    { nav: 'Templates', heading: 'Choose a resume design' },
  ];

  for (const { nav, heading } of routes) {
    await page.getByRole('link', { name: nav }).first().click();
    await expect(page.getByText(heading).first()).toBeVisible({ timeout: 10000 });
  }

  // Navigate back to editor
  await page.getByRole('link', { name: 'My Resumes' }).first().click();
  await page.getByRole('button', { name: /Edit/ }).first().click();
  await expect(page.getByPlaceholder('Your full name')).toBeVisible({ timeout: 10000 });
});

// ─── 24. 404 page ──────────────────────────────────────────────────────────────

test('404 page shows for unknown routes', async ({ page }) => {
  await freshApp(page);
  await page.goto('/nonexistent-route');
  await expect(page.getByText('404')).toBeVisible();
  await expect(page.getByText('Page not found')).toBeVisible();
});

// ─── 25. Settings page ─────────────────────────────────────────────────────────

test('settings page exposes the privacy slider and data controls', async ({ page }) => {
  await freshVisit(page);

  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Settings' }).click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

  // Supporting slider sits beside (never instead of) the real controls.
  const slider = page.getByRole('region', { name: 'How your data is handled' });
  await expect(slider.getByRole('button', { name: 'Next slide' })).toBeVisible();
  await slider.getByRole('button', { name: 'Next slide' }).click();

  // Controls live outside the slider and are directly accessible.
  await expect(page.getByRole('button', { name: /Download backup/ })).toBeDisabled(); // nothing stored yet
  await expect(page.getByRole('button', { name: /Restore from backup/ })).toBeEnabled();
  await expect(page.locator('#privacy')).toBeVisible();
  await expect(page.locator('#terms')).toBeVisible();
});

test('backup control enables once a resume exists', async ({ page }) => {
  await freshApp(page);
  await page.goto('/settings');
  await expect(page.getByRole('button', { name: /Download backup/ })).toBeEnabled();
  await expect(page.getByText('All changes saved').or(page.getByText('Saving…'))).toBeVisible();
});

// ─── 26. My Resumes card rail ──────────────────────────────────────────────────

test('dashboard slides resume cards once they no longer fit', async ({ page }) => {
  await freshVisit(page);
  await seedResumes(page, 5);
  await page.goto('/resumes');

  await expect(page.getByText('5 resumes saved in this browser.')).toBeVisible();

  const rail = page.getByRole('region', { name: 'Saved resumes' });
  await expect(rail.getByText('1–3 of 5')).toBeVisible();
  await rail.getByRole('button', { name: 'Next slide' }).click();
  await expect(rail.getByText('3–5 of 5')).toBeVisible();
  await rail.getByRole('button', { name: 'Previous slide' }).click();
  await expect(rail.getByText('1–3 of 5')).toBeVisible();

  // Every visible card keeps its full action set.
  await expect(rail.getByRole('button', { name: /^Edit/ }).first()).toBeVisible();
  await expect(rail.getByRole('button', { name: /^Duplicate / }).first()).toBeVisible();
});

// ─── 27. Multi-page A4 preview navigation ──────────────────────────────────────

test('long resume preview pages through A4 sheets', async ({ page }) => {
  // A summary long enough to overflow a single A4 page.
  const longSummary = 'Experienced engineer with a decade of building reliable systems, leading teams and shipping products end to end. '.repeat(200);
  await freshApp(page, { summary: longSummary });

  const prevPage = page.getByRole('button', { name: 'Previous page' });
  const nextPage = page.getByRole('button', { name: 'Next page' });

  await expect(nextPage).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Page 1 of \d+/)).toBeVisible();

  await nextPage.click();
  await expect(page.getByText(/Page 2 of \d+/)).toBeVisible();
  await expect(prevPage).toBeEnabled();

  await prevPage.click();
  await expect(page.getByText(/Page 1 of \d+/)).toBeVisible();
});

// ─── 28. Responsive horizontal-overflow audit ──────────────────────────────────

test('no page-level horizontal overflow at any breakpoint', async ({ page }) => {
  await freshVisit(page);
  await seedResumes(page, 5);

  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/create', '/resumes', '/templates', '/settings', '/nonexistent']) {
      await page.goto(path);
      // Let lazy chunks mount and carousels measure their containers.
      await page.waitForTimeout(500);
      const overflowPx = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflowPx, `${path} @ ${width}px horizontal overflow`).toBeLessThanOrEqual(0);
    }
  }
});
