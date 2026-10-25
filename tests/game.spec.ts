import { test, expect } from '@playwright/test';

test('game loads and renders shelves', async ({ page }) => {
  await page.goto('http://localhost:4200');
  
  // Check title
  await expect(page.locator('h1')).toContainText('Goods Sort');
  
  // Check shelves are rendered (3 shelves with role="list" and aria-label starting with "Shelf")
  const shelves = page.locator('[role="list"][aria-label^="Shelf"]');
  await expect(shelves).toHaveCount(3);
  
  // Check each shelf has 3 slots (role="list" with aria-label starting with "Slot")
  const slots = page.locator('[role="list"][aria-label^="Slot"]');
  await expect(slots).toHaveCount(9);
  
  // Check cells are rendered (role="button" with aria-label starting with "Cell")
  const cells = page.locator('[role="button"][aria-label^="Cell"]');
  await expect(cells).toHaveCount(27);
  
  // Check some items are present
  const items = page.locator('[role="button"][aria-label^="Item:"]');
  const count = await items.count();
  console.log(`Found ${count} items`);
  expect(count).toBeGreaterThan(0);
});

test('can drag and drop item', async ({ page }) => {
  await page.goto('http://localhost:4200');
  
  // Find a draggable item (top item of a cell)
  const firstItem = page.locator('[role="button"][aria-label^="Item:"]').first();
  await expect(firstItem).toBeVisible();
  
  // Find an empty cell
  const emptyCell = page.locator('[role="button"][aria-label*="empty"]').first();
  await expect(emptyCell).toBeVisible();
  
  // Drag and drop
  await firstItem.dragTo(emptyCell);
  
  // Wait a bit
  await page.waitForTimeout(500);
  
  // Check move count increased
  const moveCount = page.locator('text=Moves').locator('..').locator('text=/^\\d+$/');
  await expect(moveCount).toContainText('1');
});