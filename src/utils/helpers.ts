// src/utils/helpers.ts

import type {
  Item,
  ItemType,
  Shelf,
  ShelfSlot,
  SlotDepth,
  LevelData,
} from "../types/game";

/**
 * Generate a unique ID
 */
export const generateId = (prefix: string = "item"): string => {
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
  return shelves.map((shelf) => ({
    ...shelf,
    slots: [
      { layers: shelf.slots[0].layers.map((layer) => [...layer]) } as ShelfSlot,
      { layers: shelf.slots[1].layers.map((layer) => [...layer]) } as ShelfSlot,
      { layers: shelf.slots[2].layers.map((layer) => [...layer]) } as ShelfSlot,
    ] as [ShelfSlot, ShelfSlot, ShelfSlot],
  }));
};

/**
 * Check if a slot's front layer has a match (all 3 cells have same item type)
 */
export const checkSlotFrontLayerMatch = (slot: ShelfSlot): ItemType | null => {
  if (slot.layers.length === 0) return null;

  const frontLayer = slot.layers[0];
  const frontItems = frontLayer.filter(Boolean) as Item[];
  if (frontItems.length !== 3) return null;

  const firstType = frontItems[0].type;
  if (frontItems.every((item) => item.type === firstType)) {
    return firstType;
  }
  return null;
};

/**
 * Find all slots that have a front layer match
 */
export const findSlotFrontLayerMatches = (
  shelves: Shelf[],
): Array<{ shelfId: string; slotIndex: number; itemType: ItemType }> => {
  const matches: Array<{
    shelfId: string;
    slotIndex: number;
    itemType: ItemType;
  }> = [];

  for (const shelf of shelves) {
    for (let slotIdx = 0; slotIdx < 3; slotIdx++) {
      const matchType = checkSlotFrontLayerMatch(shelf.slots[slotIdx]);
      if (matchType) {
        matches.push({
          shelfId: shelf.id,
          slotIndex: slotIdx,
          itemType: matchType,
        });
      }
    }
  }

  return matches;
};

/**
 * Clear front layer match (remove front layer from all 3 cells in matched slot)
 * This reveals the next depth layer
 */
export const clearSlotFrontLayerMatch = (
  shelves: Shelf[],
  shelfId: string,
  slotIndex: number,
): Shelf[] => {
  const newShelves = cloneShelves(shelves);
  const shelf = newShelves.find((s) => s.id === shelfId);
  if (!shelf) return newShelves;

  const slot = shelf.slots[slotIndex];
  if (slot.layers.length > 0) {
    // Remove the front layer (shift)
    slot.layers.shift();
  }

  return newShelves;
};

/**
 * Check if a cell (in front layer) can accept more items
 * For depth-per-slot: can only add to front layer, and only if cell is empty
 */
export const canAcceptItemInFrontLayer = (
  slot: ShelfSlot,
  cellIndex: number,
): boolean => {
  if (slot.layers.length === 0) return true; // Empty slot, can add to new front layer

  const frontLayer = slot.layers[0];
  return frontLayer[cellIndex] === null; // Can only add if cell is empty in front layer
};

/**
 * Get the top (front) item of a cell in the front layer
 */
export const getFrontLayerItem = (
  slot: ShelfSlot,
  cellIndex: number,
): Item | null => {
  if (slot.layers.length === 0) return null;
  return slot.layers[0][cellIndex];
};

/**
 * Get item at specific depth layer
 */
export const getItemAtDepth = (
  slot: ShelfSlot,
  depth: number,
  cellIndex: number,
): Item | null => {
  if (depth >= slot.layers.length) return null;
  return slot.layers[depth][cellIndex];
};

/**
 * Get number of depth layers in slot
 */
export const getSlotDepth = (slot: ShelfSlot): number => {
  return slot.layers.length;
};

/**
 * Add item to front layer of a cell
 * If slot is empty, creates new front layer
 */
export const addItemToFrontLayer = (
  slot: ShelfSlot,
  cellIndex: number,
  item: Item,
): boolean => {
  if (slot.layers.length === 0) {
    // Create first layer
    const newLayer: SlotDepth = [null, null, null];
    newLayer[cellIndex] = item;
    slot.layers.push(newLayer);
    return true;
  }

  const frontLayer = slot.layers[0];
  if (frontLayer[cellIndex] !== null) return false; // Cell occupied

  frontLayer[cellIndex] = item;
  return true;
};

/**
 * Remove item from front layer of a cell
 */
export const removeItemFromFrontLayer = (
  slot: ShelfSlot,
  cellIndex: number,
): Item | null => {
  if (slot.layers.length === 0) return null;

  const frontLayer = slot.layers[0];
  const item = frontLayer[cellIndex];
  if (!item) return null;

  frontLayer[cellIndex] = null;

  // If front layer is now completely empty, remove it
  if (frontLayer.every((cell) => cell === null)) {
    slot.layers.shift();
  }

  return item;
};

/**
 * Move item from one cell's front layer to another
 * Returns new shelves array if move is valid, null otherwise
 */
export const moveItem = (
  shelves: Shelf[],
  fromShelfId: string,
  fromSlotIndex: number,
  fromCellIndex: number,
  toShelfId: string,
  toSlotIndex: number,
  toCellIndex: number,
): Shelf[] | null => {
  // Find source shelf and slot
  const fromShelfIndex = shelves.findIndex((s) => s.id === fromShelfId);
  if (fromShelfIndex === -1) return null;

  const fromShelf = shelves[fromShelfIndex];
  const fromSlot = fromShelf.slots[fromSlotIndex];

  // Check if there's an item to move (from front layer)
  const item = getFrontLayerItem(fromSlot, fromCellIndex);
  if (!item) return null;

  // Find target shelf and slot
  const toShelfIndex = shelves.findIndex((s) => s.id === toShelfId);
  if (toShelfIndex === -1) return null;

  const toShelf = shelves[toShelfIndex];
  const toSlot = toShelf.slots[toSlotIndex];

  // Check if target can accept item (in front layer)
  if (!canAcceptItemInFrontLayer(toSlot, toCellIndex)) return null;

  // Don't allow moving to the same cell
  if (
    fromShelfId === toShelfId &&
    fromSlotIndex === toSlotIndex &&
    fromCellIndex === toCellIndex
  )
    return null;

  // Perform the move
  const newShelves = cloneShelves(shelves);
  const newFromShelf = newShelves[fromShelfIndex];
  const newToShelf = newShelves[toShelfIndex];

  // Remove from source
  removeItemFromFrontLayer(newFromShelf.slots[fromSlotIndex], fromCellIndex);

  // Add to target
  addItemToFrontLayer(newToShelf.slots[toSlotIndex], toCellIndex, item);

  return newShelves;
};

/**
 * Process a move and check for front layer matches/clears
 * Only checks target slot for new matches
 * Returns { shelves, isWon }
 */
export const processMove = (
  shelves: Shelf[],
  fromShelfId: string,
  fromSlotIndex: number,
  fromCellIndex: number,
  toShelfId: string,
  toSlotIndex: number,
  toCellIndex: number,
): { shelves: Shelf[]; isWon: boolean } | null => {
  // Perform the move
  const newShelves = moveItem(
    shelves,
    fromShelfId,
    fromSlotIndex,
    fromCellIndex,
    toShelfId,
    toSlotIndex,
    toCellIndex,
  );
  if (!newShelves) return null;

  // Check for front layer match ONLY on the target slot
  const targetShelf = newShelves.find((s) => s.id === toShelfId);
  if (!targetShelf) return { shelves: newShelves, isWon: checkWin(newShelves) };

  const targetSlot = targetShelf.slots[toSlotIndex];
  const matchType = checkSlotFrontLayerMatch(targetSlot);

  let finalShelves = newShelves;

  if (matchType) {
    // Clear the matched front layer on target slot only
    finalShelves = clearSlotFrontLayerMatch(newShelves, toShelfId, toSlotIndex);
  }

  const isWon = checkWin(finalShelves);
  return { shelves: finalShelves, isWon };
};

/**
 * Check if all shelves are empty (win condition)
 */
export const checkWin = (shelves: Shelf[]): boolean => {
  return shelves.every((shelf) =>
    shelf.slots.every((slot) => slot.layers.length === 0),
  );
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
      for (const layer of slot.layers) {
        for (const item of layer) {
          if (item) counts[item.type]++;
        }
      }
    }
  }

  return counts;
};

/**
 * Check if level is solvable
 */
export const isLevelSolvable = (level: LevelData): boolean => {
  const counts = countItemTypes(level.shelves);

  const clearableTypes = Object.entries(counts).filter(
    ([, count]) => count >= 3,
  );
  return clearableTypes.length > 0;
};
