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
 * Generate a random but solvable level.
 *
 * - 18 items total, counts always multiples of 3.
 * - Every shelf and every slot contains items (no completely empty shelf/slot).
 * - Each slot keeps one empty cell for moves.
 */
export const generateRandomLevel = (shelfCount: number = 3): LevelData => {
  itemCounter = 0;

  // 6 triples -> 18 items, counts are multiples of 3.
  const tripleTypes: ItemType[] = Array.from(
    { length: 6 },
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

  const slotCount = shelfCount * 3;
  const itemsPerSlot = Math.floor(items.length / slotCount); // 2

  const shelves: Shelf[] = Array.from({ length: shelfCount }, (_, shelfIdx) => {
    const slots = [0, 1, 2].map((slotOffset) => {
      const slotIndex = shelfIdx * 3 + slotOffset;
      const slotItems = items.slice(
        slotIndex * itemsPerSlot,
        slotIndex * itemsPerSlot + itemsPerSlot,
      );

      // Place the items in random cells, leaving the rest empty.
      const layer: (Item | null)[] = [null, null, null];
      const positions = [0, 1, 2].sort(() => Math.random() - 0.5);
      slotItems.forEach((item, idx) => {
        layer[positions[idx]] = item;
      });

      return createSlot(createLayer(layer));
    }) as [ShelfSlot, ShelfSlot, ShelfSlot];
    return createShelf(`shelf-${shelfIdx + 1}`, slots);
  });

  return { shelves };
};

// Default level (random each load)
export const level1: LevelData = generateRandomLevel();

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
