// src/utils/levelData.ts

import type { LevelData, Shelf, ShelfSlot, SlotDepth, Item, ItemType } from '../types/game';

// Helper to create a slot depth layer
const createLayer = (items: (Item | null)[]): SlotDepth => {
  const layer: SlotDepth = [null, null, null];
  items.forEach((item, idx) => {
    if (idx < 3) layer[idx] = item;
  });
  return layer;
};

// Helper to create a shelf slot with layers
const createSlot = (...layers: SlotDepth[]): ShelfSlot => ({
  layers,
});

// Helper to create a shelf
const createShelf = (id: string, slots: [ShelfSlot, ShelfSlot, ShelfSlot]): Shelf => ({
  id,
  slots,
});

// Level 1: Hand-crafted, guaranteed solvable
// 
// Each shelf has 3 slots, each slot has depth layers (max 3)
// Match rule: All 3 cells in a slot's front layer have same item type → clear that layer
// 
// Layout:
// Shelf 1:
//   Slot 1: Layer 0: [🍎, 🍎, 🍎] (3 apples) → match!
//   Slot 2: Layer 0: [🍌, 🍌, 🍌] (3 bananas) → match!
//   Slot 3: Layer 0: [🍊, 🍊, 🍊] (3 oranges) → match!
// Shelf 2: All empty
// Shelf 3: All empty

let itemCounter = 0;
const nextId = (type: ItemType) => `${type}-${itemCounter++}`;

const apple = () => ({ id: nextId('apple'), type: 'apple' as ItemType });
const banana = () => ({ id: nextId('banana'), type: 'banana' as ItemType });
const orange = () => ({ id: nextId('orange'), type: 'orange' as ItemType });

export const level1: LevelData = {
  shelves: [
    createShelf('shelf-1', [
      createSlot(
        createLayer([apple(), apple(), apple()])  // Layer 0: 3 apples
      ),
      createSlot(
        createLayer([banana(), banana(), banana()])  // Layer 0: 3 bananas
      ),
      createSlot(
        createLayer([orange(), orange(), orange()])  // Layer 0: 3 oranges
      ),
    ]),
    createShelf('shelf-2', [
      createSlot(),  // Empty slot
      createSlot(),
      createSlot(),
    ]),
    createShelf('shelf-3', [
      createSlot(),
      createSlot(),
      createSlot(),
    ]),
  ],
};

// Helper to create empty shelf slot
const createEmptySlot = (): ShelfSlot => ({
  layers: [],
});

// Helper to create empty level data structure
export const createEmptyLevel = (shelfCount: number = 3): LevelData => ({
  shelves: Array.from({ length: shelfCount }, (_, i) => 
    createShelf(`shelf-${i + 1}`, [
      createEmptySlot(),
      createEmptySlot(),
      createEmptySlot(),
    ])
  ),
});

// Validate level data
export const validateLevel = (level: LevelData): boolean => {
  if (!level.shelves || level.shelves.length === 0) return false;
  
  for (const shelf of level.shelves) {
    if (!shelf.slots || shelf.slots.length !== 3) return false;
    for (const slot of shelf.slots) {
      if (!Array.isArray(slot.layers)) return false;
      if (slot.layers.length > 3) return false; // Max 3 depth layers
      for (const layer of slot.layers) {
        if (!Array.isArray(layer) || layer.length !== 3) return false;
        for (const item of layer) {
          if (item !== null && (!item.id || !item.type)) return false;
        }
      }
    }
  }
  
  return true;
};