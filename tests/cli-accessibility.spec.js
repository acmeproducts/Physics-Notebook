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
