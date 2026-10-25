// src/utils/helpers.ts

import type { Item, ItemType, Shelf, ShelfSlot, SlotCell, LevelData } from '../types/game';

/**
 * Generate a unique ID
 */
export const generateId = (prefix: string = 'item'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

/**
 * Create a new item
 */
export const createItem = (type: ItemType): Item => ({
  id: generateId(type),
  type,
});

/**
 * Deep clone shelves array
 */
export const cloneShelves = (shelves: Shelf[]): Shelf[] => {
  return shelves.map(shelf => ({
    ...shelf,
    slots: [
      { cells: [...shelf.slots[0].cells.map(cell => ({ items: [...cell.items] }))] as [SlotCell, SlotCell, SlotCell] },
      { cells: [...shelf.slots[1].cells.map(cell => ({ items: [...cell.items] }))] as [SlotCell, SlotCell, SlotCell] },
      { cells: [...shelf.slots[2].cells.map(cell => ({ items: [...cell.items] }))] as [SlotCell, SlotCell, SlotCell] },
    ] as [ShelfSlot, ShelfSlot, ShelfSlot]
  }));
};

/**
 * Check if a slot has a layer match (all 3 cells have same item type at front)
 */
export const checkSlotLayerMatch = (slot: ShelfSlot): ItemType | null => {
  const frontItems = slot.cells.map(cell => cell.items[0]).filter(Boolean) as Item[];
  if (frontItems.length !== 3) return null;
  
  const firstType = frontItems[0].type;
  if (frontItems.every(item => item.type === firstType)) {
    return firstType;
  }
  return null;
};

/**
 * Find all slots that have a layer match
 */
export const findSlotLayerMatches = (shelves: Shelf[]): Array<{ shelfId: string; slotIndex: number; itemType: ItemType }> => {
  const matches: Array<{ shelfId: string; slotIndex: number; itemType: ItemType }> = [];
  
  for (const shelf of shelves) {
    for (let slotIdx = 0; slotIdx < 3; slotIdx++) {
      const matchType = checkSlotLayerMatch(shelf.slots[slotIdx]);
      if (matchType) {
        matches.push({ shelfId: shelf.id, slotIndex: slotIdx, itemType: matchType });
      }
    }
  }
  
  return matches;
};

/**
 * Clear matched layers (remove front item from all 3 cells in matched slots)
 */
export const clearSlotLayerMatches = (shelves: Shelf[]): Shelf[] => {
  const newShelves = cloneShelves(shelves);
  
  for (const shelf of newShelves) {
    for (let slotIdx = 0; slotIdx < 3; slotIdx++) {
      const matchType = checkSlotLayerMatch(shelf.slots[slotIdx]);
      if (matchType) {
        // Remove front item from all 3 cells
        shelf.slots[slotIdx].cells.forEach(cell => {
          if (cell.items.length > 0) {
            cell.items.shift();
          }
        });
      }
    }
  }
  
  return newShelves;
};

/**
 * Check if all shelves are empty (win condition)
 */
export const checkWin = (shelves: Shelf[]): boolean => {
  return shelves.every(shelf => 
    shelf.slots.every(slot => 
      slot.cells.every(cell => cell.items.length === 0)
    )
  );
};

/**
 * Check if a cell can accept more items (has space)
 */
export const canAcceptItem = (cell: SlotCell): boolean => {
  return cell.items.length < 3;
};

/**
 * Get the top (front) item of a cell
 */
export const getTopItem = (cell: SlotCell): Item | null => {
  return cell.items.length > 0 ? cell.items[0] : null;
};

/**
 * Remove top item from a cell
 */
export const removeTopItem = (cell: SlotCell): Item | null => {
  if (cell.items.length === 0) return null;
  return cell.items.shift() ?? null;
};

/**
 * Add item to front of cell
 */
export const addItemToFront = (cell: SlotCell, item: Item): boolean => {
  if (cell.items.length >= 3) return false;
  cell.items.unshift(item);
  return true;
};

/**
 * Move item from one cell to another
 * Returns new shelves array if move is valid, null otherwise
 */
export const moveItem = (
  shelves: Shelf[],
  fromShelfId: string,
  fromSlotIndex: number,
  fromCellIndex: number,
  toShelfId: string,
  toSlotIndex: number,
  toCellIndex: number
): Shelf[] | null => {
  // Find source shelf and slot
  const fromShelfIndex = shelves.findIndex(s => s.id === fromShelfId);
  if (fromShelfIndex === -1) return null;
  
  const fromShelf = shelves[fromShelfIndex];
  const fromCell = fromShelf.slots[fromSlotIndex].cells[fromCellIndex];
  
  // Check if there's an item to move
  const item = getTopItem(fromCell);
  if (!item) return null;
  
  // Find target shelf and slot
  const toShelfIndex = shelves.findIndex(s => s.id === toShelfId);
  if (toShelfIndex === -1) return null;
  
  const toShelf = shelves[toShelfIndex];
  const toCell = toShelf.slots[toSlotIndex].cells[toCellIndex];
  
  // Check if target has space
  if (!canAcceptItem(toCell)) return null;
  
  // Don't allow moving to the same cell
  if (fromShelfId === toShelfId && fromSlotIndex === toSlotIndex && fromCellIndex === toCellIndex) return null;
  
  // Perform the move
  const newShelves = cloneShelves(shelves);
  const newFromShelf = newShelves[fromShelfIndex];
  const newToShelf = newShelves[toShelfIndex];
  
  // Remove from source
  removeTopItem(newFromShelf.slots[fromSlotIndex].cells[fromCellIndex]);
  
  // Add to target
  addItemToFront(newToShelf.slots[toSlotIndex].cells[toCellIndex], item);
  
  return newShelves;
};

/**
 * Process a move and check for slot layer matches/clears
 * Returns { shelves, isWon }
 */
export const processMove = (
  shelves: Shelf[],
  fromShelfId: string,
  fromSlotIndex: number,
  fromCellIndex: number,
  toShelfId: string,
  toSlotIndex: number,
  toCellIndex: number
): { shelves: Shelf[]; isWon: boolean } | null => {
  // Perform the move
  const newShelves = moveItem(shelves, fromShelfId, fromSlotIndex, fromCellIndex, toShelfId, toSlotIndex, toCellIndex);
  if (!newShelves) return null;
  
  // Check for slot layer matches and clear them
  const matches = findSlotLayerMatches(newShelves);
  
  if (matches.length > 0) {
    const clearedShelves = clearSlotLayerMatches(newShelves);
    const isWon = checkWin(clearedShelves);
    return { shelves: clearedShelves, isWon };
  }
  
  const isWon = checkWin(newShelves);
  return { shelves: newShelves, isWon };
};

/**
 * Count total items of each type across all shelves
 */
export const countItemTypes = (shelves: Shelf[]): Record<ItemType, number> => {
  const counts: Record<ItemType, number> = {
    apple: 0,
    banana: 0,
    orange: 0,
    grape: 0,
    strawberry: 0,
    pear: 0,
    lemon: 0,
    watermelon: 0,
  };
  
  for (const shelf of shelves) {
    for (const slot of shelf.slots) {
      for (const cell of slot.cells) {
        for (const item of cell.items) {
          counts[item.type]++;
        }
      }
    }
  }
  
  return counts;
};

/**
 * Check if level is solvable
 */
export const isLevelSolvable = (level: LevelData): boolean => {
  const counts = countItemTypes(level.shelves);
  
  // Check that we have at least some items that can form triples
  const clearableTypes = Object.entries(counts).filter(([, count]) => count >= 3);
  return clearableTypes.length > 0;
};