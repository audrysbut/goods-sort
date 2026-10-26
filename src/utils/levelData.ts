// src/utils/levelData.ts

import type {
  LevelData,
  Shelf,
  ShelfSlot,
  SlotDepth,
  Item,
  ItemType,
} from "../types/game";

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
const createShelf = (
  id: string,
  slots: [ShelfSlot, ShelfSlot, ShelfSlot],
): Shelf => ({
  id,
  slots,
});

// Level 1: Multi-depth level for testing
//
// Each slot has multiple depth layers (no front layer matches at start)
//
// Shelf 1:
//   Slot 1: Depth 3 - Layer 0: [🍎, 🍌, 🍊] (mixed, no match)
//                        Layer 1: [🍎, 🍌, 🍊] (mixed, no match)
//                        Layer 2: [🍎, 🍌, 🍊] (mixed, no match)
//   Slot 2: Depth 2 - Layer 0: [🍌, 🍊, 🍇] (mixed)
//                        Layer 1: [🍌, 🍊, 🍇] (mixed)
//   Slot 3: Depth 1 - Layer 0: [🍊, 🍇, 🍓] (mixed)
// Shelf 2: Empty for maneuvering
// Shelf 3: Empty for maneuvering
//
// Total items: 3×3 + 2×3 + 1×3 = 18 items across 3 shelves
// All item types appear 3+ times for solvability

let itemCounter = 0;
const nextId = (type: ItemType) => `${type}-${itemCounter++}`;

const apple = () => ({ id: nextId("apple"), type: "apple" as ItemType });
const banana = () => ({ id: nextId("banana"), type: "banana" as ItemType });
const orange = () => ({ id: nextId("orange"), type: "orange" as ItemType });
const grape = () => ({ id: nextId("grape"), type: "grape" as ItemType });
const strawberry = () => ({
  id: nextId("strawberry"),
  type: "strawberry" as ItemType,
});

export const level1: LevelData = {
  shelves: [
    createShelf("shelf-1", [
      createSlot(
        // Slot 1: Depth 3
        createLayer([apple(), banana(), orange()]), // Layer 0 (front): mixed
        createLayer([apple(), banana(), orange()]), // Layer 1: mixed
        createLayer([apple(), banana(), orange()]), // Layer 2 (back): mixed
      ),
      createSlot(
        // Slot 2: Depth 2
        createLayer([banana(), orange(), grape()]), // Layer 0: mixed
        createLayer([banana(), orange(), grape()]), // Layer 1: mixed
      ),
      createSlot(
        // Slot 3: Depth 1
        createLayer([orange(), grape(), strawberry()]), // Layer 0: mixed
      ),
    ]),
    createShelf("shelf-2", [
      createSlot(), // Empty slot
      createSlot(),
      createSlot(),
    ]),
    createShelf("shelf-3", [
      createSlot(), // Empty slot
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
    ]),
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
