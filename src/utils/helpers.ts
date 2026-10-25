// src/utils/helpers.ts

import type { Item, ItemType, Shelf, ShelfSlot, LevelData } from '../types/game';

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
    slots: shelf.slots.map(slot => ({
      items: [...slot.items]
    })) as [ShelfSlot, ShelfSlot, ShelfSlot]
  }));
};

/**
 * Check if a slot has 3 identical items (match-3)
 */
export const checkMatch = (slot: ShelfSlot): boolean => {
  if (slot.items.length !== 3) return false;
  const firstType = slot.items[0].type;
  return slot.items.every(item => item.type === firstType);
};

/**
 * Find all slots that have a match (3 identical items)
 */
export const findMatches = (shelves: Shelf[]): Array<{ shelfId: string; slotIndex: number }> => {
  const matches: Array<{ shelfId: string; slotIndex: number }> = [];
  
  for (const shelf of shelves) {
    for (let i = 0; i < 3; i++) {
      if (checkMatch(shelf.slots[i])) {
        matches.push({ shelfId: shelf.id, slotIndex: i });
      }
    }
  }
  
  return matches;
};

/**
 * Clear matched slots (remove all items from matched slots)
 */
export const clearMatches = (shelves: Shelf[]): Shelf[] => {
  const newShelves = cloneShelves(shelves);
  
  for (const shelf of newShelves) {
    for (let i = 0; i < 3; i++) {
      if (checkMatch(shelf.slots[i])) {
        shelf.slots[i].items = [];
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
    shelf.slots.every(slot => slot.items.length === 0)
  );
};

/**
 * Check if a slot can accept more items (has space)
 */
export const canAcceptItem = (slot: ShelfSlot): boolean => {
  return slot.items.length < 3;
};

/**
 * Get the top (front) item of a slot
 */
export const getTopItem = (slot: ShelfSlot): Item | null => {
  return slot.items.length > 0 ? slot.items[0] : null;
};

/**
 * Remove top item from a slot
 */
export const removeTopItem = (slot: ShelfSlot): Item | null => {
  if (slot.items.length === 0) return null;
  return slot.items.shift() ?? null;
};

/**
 * Add item to front of slot
 */
export const addItemToFront = (slot: ShelfSlot, item: Item): boolean => {
  if (slot.items.length >= 3) return false;
  slot.items.unshift(item);
  return true;
};

/**
 * Move item from one slot to another
 * Returns new shelves array if move is valid, null otherwise
 */
export const moveItem = (
  shelves: Shelf[],
  fromShelfId: string,
  fromSlotIndex: number,
  toShelfId: string,
  toSlotIndex: number
): Shelf[] | null => {
  const fromShelfIndex = shelves.findIndex(s => s.id === fromShelfId);
  if (fromShelfIndex === -1) return null;
  
  const fromShelf = shelves[fromShelfIndex];
  const fromSlot = fromShelf.slots[fromSlotIndex];
  
  const item = getTopItem(fromSlot);
  if (!item) return null;
  
  const toShelfIndex = shelves.findIndex(s => s.id === toShelfId);
  if (toShelfIndex === -1) return null;
  
  const toShelf = shelves[toShelfIndex];
  const toSlot = toShelf.slots[toSlotIndex];
  
  if (!canAcceptItem(toSlot)) return null;
  
  if (fromShelfId === toShelfId && fromSlotIndex === toSlotIndex) return null;
  
  const newShelves = cloneShelves(shelves);
  const newFromShelf = newShelves[fromShelfIndex];
  const newToShelf = newShelves[toShelfIndex];
  
  removeTopItem(newFromShelf.slots[fromSlotIndex]);
  addItemToFront(newToShelf.slots[toSlotIndex], item);
  
  return newShelves;
};

/**
 * Process a move and check for matches/clears
 * Returns { shelves, didClear, isWon }
 */
export const processMove = (
  shelves: Shelf[],
  fromShelfId: string,
  fromSlotIndex: number,
  toShelfId: string,
  toSlotIndex: number
): { shelves: Shelf[]; isWon: boolean } | null => {
  const newShelves = moveItem(shelves, fromShelfId, fromSlotIndex, toShelfId, toSlotIndex);
  if (!newShelves) return null;
  
  const matches = findMatches(newShelves);
  
  if (matches.length > 0) {
    const clearedShelves = clearMatches(newShelves);
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
      for (const item of slot.items) {
        counts[item.type]++;
      }
    }
  }
  
  return counts;
};

/**
 * Check if level is solvable (each item type appears in multiples of 3, or can be maneuvered)
 */
export const isLevelSolvable = (level: LevelData): boolean => {
  const counts = countItemTypes(level.shelves);
  
  let hasEmptySlot = false;
  for (const shelf of level.shelves) {
    for (const slot of shelf.slots) {
      if (slot.items.length === 0) {
        hasEmptySlot = true;
        break;
      }
    }
    if (hasEmptySlot) break;
  }
  
  if (!hasEmptySlot) return false;
  
  const clearableTypes = Object.entries(counts).filter(([, count]) => count >= 3);
  return clearableTypes.length > 0;
};