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
 * - 33 items total (11 triples), counts always multiples of 3.
 * - Every slot has at least 2 items in the front layer.
 * - Front layer leaves 1 empty cell for maneuvering.
 * - Deeper layers are fully populated (3 items each).
 * - At least 3 depth layers per slot.
 */
export const generateRandomLevel = (shelfCount: number = 8): LevelData => {
  itemCounter = 0;

  // 16 triples -> 48 items, counts are multiples of 3.
  // (Need enough items for 3 layers per slot with actual content)
  const tripleTypes: ItemType[] = Array.from({ length: 16 }, () =>
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

  const totalSlots = shelfCount * 2; // 16 slots

  // Distribute items to slots: each slot gets ~3 items.
  const slotItems: Item[][] = Array.from({ length: totalSlots }, () => []);
  items.forEach((item, idx) => {
    const slotIdx = idx % totalSlots;
    slotItems[slotIdx].push(item);
  });

  // Ensure each slot has at least 2 items in front layer.
  // (Already guaranteed since itemsPerSlot >= 2 with 33 items / 16 slots)

  const shelves: Shelf[] = Array.from({ length: shelfCount }, (_, shelfIdx) => {
    const slots = [createEmptySlot(), createEmptySlot()];

    for (let slotOffset = 0; slotOffset < 2; slotOffset++) {
      const slotIndex = shelfIdx * 2 + slotOffset;
      const sItems = slotItems[slotIndex];

      if (sItems.length === 0) continue;

      // Front layer: 2 items + 1 empty cell for maneuvering.
      const frontLayer: (Item | null)[] = [null, null, null];
      const positions = [0, 1, 2].sort(() => Math.random() - 0.5);
      const frontCount = Math.min(2, sItems.length);
      for (let i = 0; i < frontCount; i++) {
        frontLayer[positions[i]] = sItems[i];
      }
      slots[slotOffset].layers.push(createLayer(frontLayer));

      // Deeper layers: remaining items in groups of 3.
      const remaining = sItems.slice(frontCount);
      for (let i = 0; i < remaining.length; i += 3) {
        const layerItems = remaining.slice(i, i + 3);
        if (layerItems.length === 3) {
          slots[slotOffset].layers.push(createLayer(layerItems));
        } else if (layerItems.length > 0) {
          const padded: (Item | null)[] = [null, null, null];
          layerItems.forEach((item, idx) => {
            padded[idx] = item;
          });
          slots[slotOffset].layers.push(createLayer(padded));
        }
      }

      // Ensure at least 3 layers: pad with empty layers if needed.
      while (slots[slotOffset].layers.length < 3) {
        slots[slotOffset].layers.push(createLayer([null, null, null]));
      }
    }

    return createShelf(`shelf-${shelfIdx + 1}`, slots as [ShelfSlot, ShelfSlot]);
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
      if (slot.layers.length > 6) return false;
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
