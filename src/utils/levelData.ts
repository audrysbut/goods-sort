// src/utils/levelData.ts

import type { LevelData, Shelf, ShelfSlot, SlotCell, Item, ItemType } from '../types/game';

// Helper to create a slot cell with items
const createCell = (...items: Item[]): SlotCell => ({
  items,
});

// Helper to create a shelf slot with 3 cells
const createSlot = (cells: [SlotCell, SlotCell, SlotCell]): ShelfSlot => ({
  cells,
});

// Helper to create a shelf
const createShelf = (id: string, slots: [ShelfSlot, ShelfSlot, ShelfSlot]): Shelf => ({
  id,
  slots,
});

// Level 1: Hand-crafted, guaranteed solvable
// 
// Each shelf has 3 slots, each slot has 3 cells
// Match rule: All 3 cells in a slot have same item type at front → clear that layer
// 
// Layout:
// Shelf 1:
//   Slot 1: [🍎,🍎] [🍎] [🍎]      ← Layer 0: 3 apples (will clear immediately)
//   Slot 2: [🍌] [🍌] [🍌]          ← Layer 0: 3 bananas (will clear immediately)
//   Slot 3: [🍊,🍊] [🍊] [🍊]       ← Layer 0: 3 oranges (will clear immediately)
// Shelf 2: All empty (for maneuvering)
// Shelf 3: All empty (for maneuvering)

let itemCounter = 0;
const nextId = (type: ItemType) => `${type}-${itemCounter++}`;

export const level1: LevelData = {
  shelves: [
    createShelf('shelf-1', [
      createSlot([
        createCell({ id: nextId('apple'), type: 'apple' }, { id: nextId('apple'), type: 'apple' }),  // cell 0: 2 apples
        createCell({ id: nextId('apple'), type: 'apple' }),  // cell 1: 1 apple
        createCell({ id: nextId('apple'), type: 'apple' }),  // cell 2: 1 apple
      ]),
      createSlot([
        createCell({ id: nextId('banana'), type: 'banana' }),  // cell 0: 1 banana
        createCell({ id: nextId('banana'), type: 'banana' }),  // cell 1: 1 banana
        createCell({ id: nextId('banana'), type: 'banana' }),  // cell 2: 1 banana
      ]),
      createSlot([
        createCell({ id: nextId('orange'), type: 'orange' }, { id: nextId('orange'), type: 'orange' }),  // cell 0: 2 oranges
        createCell({ id: nextId('orange'), type: 'orange' }),  // cell 1: 1 orange
        createCell({ id: nextId('orange'), type: 'orange' }),  // cell 2: 1 orange
      ]),
    ]),
    createShelf('shelf-2', [
      createSlot([createCell(), createCell(), createCell()]),
      createSlot([createCell(), createCell(), createCell()]),
      createSlot([createCell(), createCell(), createCell()]),
    ]),
    createShelf('shelf-3', [
      createSlot([createCell(), createCell(), createCell()]),
      createSlot([createCell(), createCell(), createCell()]),
      createSlot([createCell(), createCell(), createCell()]),
    ]),
  ],
};

// Helper to create empty level data structure
export const createEmptyLevel = (shelfCount: number = 3): LevelData => ({
  shelves: Array.from({ length: shelfCount }, (_, i) => 
    createShelf(`shelf-${i + 1}`, [
      createSlot([createCell(), createCell(), createCell()]),
      createSlot([createCell(), createCell(), createCell()]),
      createSlot([createCell(), createCell(), createCell()]),
    ])
  ),
});

// Validate level data
export const validateLevel = (level: LevelData): boolean => {
  if (!level.shelves || level.shelves.length === 0) return false;
  
  for (const shelf of level.shelves) {
    if (!shelf.slots || shelf.slots.length !== 3) return false;
    for (const slot of shelf.slots) {
      if (!slot.cells || slot.cells.length !== 3) return false;
      for (const cell of slot.cells) {
        if (!Array.isArray(cell.items)) return false;
        if (cell.items.length > 3) return false; // Max 3 items per cell depth
      }
    }
  }
  
  return true;
};