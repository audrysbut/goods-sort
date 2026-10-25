// src/utils/levelData.ts

import type { LevelData, Shelf, ShelfSlot, Item, ItemType } from '../types/game';

// Helper to create a shelf slot with items
const createSlot = (...items: Item[]): ShelfSlot => ({
  items,
});

// Helper to create a shelf
const createShelf = (id: string, slots: [ShelfSlot, ShelfSlot, ShelfSlot]): Shelf => ({
  id,
  slots,
});

// Level 1: Hand-crafted, guaranteed solvable
// 
// Uses 3 item types (apple, banana, orange) - each appears exactly 3 times
// 3 empty slots for maneuvering
//
// Shelf 1: [🍎,🍎] [🍌] [🍊]          <- 2 apples, 1 banana, 1 orange
// Shelf 2: [🍎] [🍌,🍌] [🍊,🍊]       <- 1 apple, 2 bananas, 2 oranges
// Shelf 3: [] [] []                   <- 3 empty slots for maneuvering
//
// Total: 🍎×3, 🍌×3, 🍊×3 - all can be cleared!

let itemCounter = 0;
const nextId = (type: ItemType) => `${type}-${itemCounter++}`;

export const level1: LevelData = {
  shelves: [
    createShelf('shelf-1', [
      createSlot(
        { id: nextId('apple'), type: 'apple' },
        { id: nextId('apple'), type: 'apple' }
      ),
      createSlot(
        { id: nextId('banana'), type: 'banana' }
      ),
      createSlot(
        { id: nextId('orange'), type: 'orange' }
      ),
    ]),
    createShelf('shelf-2', [
      createSlot(
        { id: nextId('apple'), type: 'apple' }
      ),
      createSlot(
        { id: nextId('banana'), type: 'banana' },
        { id: nextId('banana'), type: 'banana' }
      ),
      createSlot(
        { id: nextId('orange'), type: 'orange' },
        { id: nextId('orange'), type: 'orange' }
      ),
    ]),
    createShelf('shelf-3', [
      createSlot(),  // Empty slot for maneuvering
      createSlot(),  // Empty slot for maneuvering
      createSlot(),  // Empty slot for maneuvering
    ]),
  ],
};

// Helper to create empty level data structure
export const createEmptyLevel = (shelfCount: number = 3): LevelData => ({
  shelves: Array.from({ length: shelfCount }, (_, i) => 
    createShelf(`shelf-${i + 1}`, [
      createSlot(),
      createSlot(),
      createSlot(),
    ])
  ),
});

// Validate level data
export const validateLevel = (level: LevelData): boolean => {
  if (!level.shelves || level.shelves.length === 0) return false;
  
  for (const shelf of level.shelves) {
    if (!shelf.slots || shelf.slots.length !== 3) return false;
    for (const slot of shelf.slots) {
      if (!Array.isArray(slot.items)) return false;
      if (slot.items.length > 3) return false; // Max 3 items per slot
    }
  }
  
  return true;
};