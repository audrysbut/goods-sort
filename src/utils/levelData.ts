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
  slots: [ShelfSlot, ShelfSlot],
): Shelf => ({
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
  "pear",
  "lemon",
  "watermelon",
  "cherry",
  "pineapple",
];

let itemCounter = 0;
const nextId = (type: ItemType) => `${type}-${itemCounter++}`;

const makeItem = (type: ItemType): Item => ({
  id: nextId(type),
  type,
});

/**
 * Generate a random but solvable level.
 *
 * - 21 items total (7 triples), counts always multiples of 3.
 * - Every shelf and every slot contains at least one item.
 */
export const generateRandomLevel = (shelfCount: number = 8): LevelData => {
  itemCounter = 0;

  // 11 triples -> 33 items, counts are multiples of 3.
  // (Need at least 2 items per slot × 16 slots = 32 items)
  const tripleTypes: ItemType[] = Array.from({ length: 11 }, () =>
    ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)],
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

  const totalSlots = shelfCount * 2;

  // First pass: two items per slot to ensure every slot has at least 2.
  // Second pass: distribute remaining items randomly.
  const slotItems: Item[][] = Array.from({ length: totalSlots }, () => []);

  for (let i = 0; i < items.length; i++) {
    if (i < totalSlots * 2) {
      // Ensure each slot gets at least two items.
      const slotIdx = Math.floor(i / 2);
      slotItems[slotIdx].push(items[i]);
    } else {
      // Distribute remaining items randomly.
      const randomSlot = Math.floor(Math.random() * totalSlots);
      slotItems[randomSlot].push(items[i]);
    }
  }

  // Group by shelf.
  const shelfItems: Item[][][] = Array.from({ length: shelfCount }, () => [[], []]);
  for (let slotIdx = 0; slotIdx < totalSlots; slotIdx++) {
    const shelf = Math.floor(slotIdx / 2);
    const slot = slotIdx % 2;
    shelfItems[shelf][slot] = slotItems[slotIdx];
  }

  const shelves: Shelf[] = shelfItems.map((slots, shelfIdx) => {
    const shelfSlots = slots.map((slotItems) => {
      if (slotItems.length === 0) return createEmptySlot();

      // Place items in random cells.
      const layer: (Item | null)[] = [null, null, null];
      const positions = [0, 1, 2].sort(() => Math.random() - 0.5);
      slotItems.forEach((item, idx) => {
        layer[positions[idx % 3]] = item;
      });

      return createSlot(createLayer(layer));
    }) as [ShelfSlot, ShelfSlot];

    // Safety: ensure no shelf is completely empty.
    const hasItems = shelfSlots.some((sl) => sl.layers.length > 0);
    if (!hasItems && slots.flat().length > 0) {
      shelfSlots[0] = createSlot(createLayer([slots.flat()[0]]));
    }

    return createShelf(`shelf-${shelfIdx + 1}`, shelfSlots);
  });

  // Safety: ensure no shelf is completely empty (retry if needed).
  const hasEmptyShelf = shelves.some((s) =>
    s.slots.every((sl) => sl.layers.length === 0),
  );
  if (hasEmptyShelf) {
    return generateRandomLevel(shelfCount);
  }

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
      if (slot.layers.length > 4) return false;
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
