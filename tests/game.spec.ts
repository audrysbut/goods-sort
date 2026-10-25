import { test, expect } from '@playwright/test';

test('game loads and renders shelves', async ({ page }) => {
  await page.goto('http://localhost:4200');
  
  // Check title
  await expect(page.locator('h1')).toContainText('Goods Sort');
  
  // Check shelves are rendered (3 shelves)
  const shelves = page.locator('[role="list"]');
  await expect(shelves).toHaveCount(3);
  
  // Check each shelf has 3 slots
  const slots = page.locator('[role="button"][aria-dropeffect="move"]');
  await expect(slots).toHaveCount(9);
  
  // Check some items are present - use role="button" with aria-label containing "Item:"
  const items = page.locator('[role="button"][aria-label^="Item:"]');
  const count = await items.count();
  console.log(`Found ${count} items`);
  expect(count).toBeGreaterThan(0);
});

test('can drag and drop item', async ({ page }) => {
  await page.goto('http://localhost:4200');
  
  // Find a draggable item (top item of a slot)
  const firstItem = page.locator('[role="button"][aria-label^="Item:"]').first();
  await expect(firstItem).toBeVisible();
  
  // Find an empty slot
  const emptySlot = page.locator('[aria-label*="Empty slot"]').first();
  await expect(emptySlot).toBeVisible();
  
  // Drag and drop
  await firstItem.dragTo(emptySlot);
  
  // Wait a bit
  await page.waitForTimeout(500);
  
  // Check move count increased
  const moveCount = page.locator('text=Moves').locator('..').locator('text=/^\\d+$/');
  await expect(moveCount).toContainText('1');
});