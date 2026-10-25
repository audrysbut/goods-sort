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
// Total: 9 cells per shelf, 27 cells total
// 
// We'll use 3 item types (apple, banana, orange) each appearing 3 times
// Distributed across cells so they can be matched

let itemCounter = 0;
const nextId = (type: ItemType) => `${type}-${itemCounter++}`;

export const level1: LevelData = {
  shelves: [
    createShelf('shelf-1', [
      createSlot([
        createCell({ id: nextId('apple'), type: 'apple' }, { id: nextId('apple'), type: 'apple' }),  // cell 0: 2 apples
        createCell({ id: nextId('banana'), type: 'banana' }),  // cell 1: 1 banana
        createCell({ id: nextId('orange'), type: 'orange' }),  // cell 2: 1 orange
      ]),
      createSlot([
        createCell({ id: nextId('apple'), type: 'apple' }),  // cell 0: 1 apple
        createCell({ id: nextId('banana'), type: 'banana' }, { id: nextId('banana'), type: 'banana' }),  // cell 1: 2 bananas
        createCell({ id: nextId('orange'), type: 'orange' }, { id: nextId('orange'), type: 'orange' }),  // cell 2: 2 oranges
      ]),
      createSlot([
        createCell(),  // cell 0: empty
        createCell(),  // cell 1: empty
        createCell(),  // cell 2: empty
      ]),
    ]),
    createShelf('shelf-2', [
      createSlot([
        createCell(),
        createCell(),
        createCell(),
      ]),
      createSlot([
        createCell(),
        createCell(),
        createCell(),
      ]),
      createSlot([
        createCell(),
        createCell(),
        createCell(),
      ]),
    ]),
    createShelf('shelf-3', [
      createSlot([
        createCell(),
        createCell(),
        createCell(),
      ]),
      createSlot([
        createCell(),
        createCell(),
        createCell(),
      ]),
      createSlot([
        createCell(),
        createCell(),
        createCell(),
      ]),
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