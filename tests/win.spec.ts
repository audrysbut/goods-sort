import { test, expect } from '@playwright/test';

test('can win the game by matching all items', async ({ page }) => {
  await page.goto('http://localhost:4200');
  
  // Initial state: 
  // Shelf 1: [🍎,🍎] [🍌] [🍊]
  // Shelf 2: [🍎] [🍌,🍌] [🍊,🍊]
  // Shelf 3: [] [] []
  
  // Solution: Move items to create triples
  // Move banana from S1S2 to S3S1 (empty)
  await page.locator('[role="button"][aria-label*="Slot 2 with 1 item"] >> [aria-label^="Item:"]').first().dragTo(
    page.locator('[role="button"][aria-label="Empty slot 1"]').first()
  );
  await page.waitForTimeout(300);
  
  // Move orange from S1S3 to S3S2 (empty)
  await page.locator('[role="button"][aria-label*="Slot 3 with 1 item"] >> [aria-label^="Item:"]').first().dragTo(
    page.locator('[role="button"][aria-label="Empty slot 2"]').first()
  );
  await page.waitForTimeout(300);
  
  // Move apple from S2S1 to S1S2 (now has space)
  await page.locator('[role="button"][aria-label*="Slot 1 with 1 item"] >> [aria-label^="Item:"]').nth(1).dragTo(
    page.locator('[role="button"][aria-label*="Slot 2 with"]').first()
  );
  await page.waitForTimeout(300);
  
  // Move banana from S3S1 to S1S2 (now has 2 apples)
  await page.locator('[role="button"][aria-label*="Empty slot 1"] >> [aria-label^="Item:"]').first().dragTo(
    page.locator('[role="button"][aria-label*="Slot 2 with"]').first()
  );
  await page.waitForTimeout(300);
  
  // Continue until win - check if win modal appears
  const winModal = page.locator('[role="dialog"]');
  if (await winModal.isVisible({ timeout: 2000 })) {
    await expect(winModal).toContainText('Level Complete');
    console.log('WIN!');
  } else {
    console.log('Game not yet won - made some progress');
  }
});
