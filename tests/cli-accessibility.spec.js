const { test, expect } = require('@playwright/test');

async function tabToLocator(page, locator, maxTabs = 12) {
    for (let i = 0; i < maxTabs; i += 1) {
        if (await locator.evaluate((element) => element === document.activeElement)) {
            return;
        }

        await page.keyboard.press('Tab');
    }

    throw new Error('Failed to move keyboard focus to the requested element.');
}

function parseHexColor(color) {
    const value = color.replace('#', '');
    const expanded = value.length === 3
        ? value.split('').map((char) => char + char).join('')
        : value;

    return [
        parseInt(expanded.slice(0, 2), 16),
        parseInt(expanded.slice(2, 4), 16),
        parseInt(expanded.slice(4, 6), 16)
    ];
}

function relativeLuminance([red, green, blue]) {
    const normalize = (channel) => {
        const value = channel / 255;
        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };

    const [r, g, b] = [red, green, blue].map(normalize);
    return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
}

function contrastRatio(foreground, background) {
    const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
    const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
    return (lighter + 0.05) / (darker + 0.05);
}

async function cssVars(page) {
    return page.evaluate(() => {
        const styles = getComputedStyle(document.documentElement);
        return {
            bg: styles.getPropertyValue('--bg-color').trim(),
            textMain: styles.getPropertyValue('--text-main').trim(),
            textMuted: styles.getPropertyValue('--text-muted').trim()
        };
    });
}

test('library cards stay keyboard reachable and open with Enter', async ({ page }) => {
    await page.goto('/');

    const firstCard = page.locator('.card').first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).toHaveAttribute('href', 'Concepts/simple-oscillations.html');

    await tabToLocator(page, firstCard);
    await expect(firstCard).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/Concepts\/simple-oscillations\.html$/);
});

test('AI buttons expose accessible names in the browser accessibility tree', async ({ page }) => {
    await page.goto('/Concepts/newtons-laws-of-motion.html');

    const aiButtons = page.locator('.ai-btn');
    await expect(aiButtons.first()).toHaveAccessibleName('Ask Perplexity');
    await expect(aiButtons.nth(1)).toHaveAccessibleName('Ask Gemini');
    await expect(aiButtons.nth(2)).toHaveAccessibleName('Ask ChatGPT');
});

test('concept canvases expose meaningful accessible names', async ({ page }) => {
    await page.goto('/Concepts/newtons-laws-of-motion.html');

    const canvases = page.locator('.visual-col canvas');
    await expect(canvases.first()).toHaveAccessibleName('Objects at Rest or in Motion visualization');
    await expect(canvases.nth(1)).toHaveAccessibleName('Force and Acceleration visualization');
    await expect(canvases.nth(2)).toHaveAccessibleName('Equal and Opposite visualization');
});

test('sample pages stay free of console and page errors', async ({ page }) => {
    const failures = [];
    page.on('pageerror', (error) => failures.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
        if (message.type() === 'error') {
            failures.push(`console: ${message.text()}`);
        }
    });

    await page.goto('/');
    await page.waitForTimeout(500);
    await page.goto('/Concepts/newtons-laws-of-motion.html');
    await page.waitForTimeout(500);

    expect(failures).toEqual([]);
});

test('core text contrast stays above WCAG AA in light and dark themes', async ({ page }) => {
    await page.goto('/');

    const light = await cssVars(page);
    const lightBg = parseHexColor(light.bg);
    expect(contrastRatio(parseHexColor(light.textMain), lightBg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(parseHexColor(light.textMuted), lightBg)).toBeGreaterThanOrEqual(4.5);

    await page.locator('#themeBtn').click();

    const dark = await cssVars(page);
    const darkBg = parseHexColor(dark.bg);
    expect(contrastRatio(parseHexColor(dark.textMain), darkBg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(parseHexColor(dark.textMuted), darkBg)).toBeGreaterThanOrEqual(4.5);
});
