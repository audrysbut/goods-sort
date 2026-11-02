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
const createShelf = (id: string, slots: [ShelfSlot, ShelfSlot]): Shelf => ({
  id,
  slots,
});

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
    ]),
  ),
});

const ITEM_TYPES: ItemType[] = [
  "apple",
  "banana",
  "orange",
  "grape",
  "strawberry",
];

let itemCounter = 0;
const nextId = (type: ItemType) => `${type}-${itemCounter++}`;

const makeItem = (type: ItemType): Item => ({
  id: nextId(type),
  type,
});

/**
 * Generate a random but solvable level with 10 shelves.
 *
 * - 21 items total (7 triples), counts always multiples of 3.
 * - Every shelf contains at least one item (no empty shelves).
 */
export const generateRandomLevel = (shelfCount: number = 8): LevelData => {
  itemCounter = 0;

  // 7 triples -> 21 items, counts are multiples of 3.
  const tripleTypes: ItemType[] = Array.from(
    { length: 7 },
    () => ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)],
  );

  const items: Item[] = tripleTypes.flatMap((type) => [
    makeItem(type),
    makeItem(type),
    makeItem(type),
  ]);

  // Shuffle items.
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  // Ensure every shelf gets at least one item.
  const shelfItems: Item[][] = Array.from({ length: shelfCount }, () => []);
  for (let i = 0; i < shelfCount; i++) {
    shelfItems[i].push(items[i]);
  }
  for (let i = shelfCount; i < items.length; i++) {
    const shelf = Math.floor(Math.random() * shelfCount);
    shelfItems[shelf].push(items[i]);
  }

  const shelves: Shelf[] = shelfItems.map((sItems, shelfIdx) => {
    const slots = [createEmptySlot(), createEmptySlot()];

    // Place items into distinct random cells of this shelf.
    const cells: { slot: number; cell: number }[] = [];
    for (let slot = 0; slot < 2; slot++) {
      for (let cell = 0; cell < 3; cell++) {
        cells.push({ slot, cell });
      }
    }
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    sItems.forEach((item, idx) => {
      const { slot, cell } = cells[idx % cells.length];
      if (!slots[slot].layers.length) {
        slots[slot].layers.push([null, null, null]);
      }
      (slots[slot].layers[0] as (Item | null)[])[cell] = item;
    });

    const shelfSlots = slots.map((sl) => {
      if (!sl.layers.length) return createEmptySlot();
      return createSlot(createLayer(sl.layers[0] as (Item | null)[]));
    }) as [ShelfSlot, ShelfSlot];

    return createShelf(`shelf-${shelfIdx + 1}`, shelfSlots);
  });

  return { shelves };
};

// Default level (random each load)
export const level1: LevelData = generateRandomLevel();

// Validate level data
export const validateLevel = (level: LevelData): boolean => {
  if (!level.shelves || level.shelves.length === 0) return false;

  for (const shelf of level.shelves) {
    if (!shelf.slots || shelf.slots.length !== 2) return false;
    for (const slot of shelf.slots) {
      if (!Array.isArray(slot.layers)) return false;
      if (slot.layers.length > 3) return false;
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
