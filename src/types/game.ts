// src/types/game.ts

export type ItemType =
  | "apple"
  | "banana"
  | "orange"
  | "grape"
  | "strawberry"
  | "pear"
  | "lemon"
  | "watermelon";

export interface Item {
  id: string;
  type: ItemType;
}

// SlotDepth = one depth layer across all 3 cells
// Each layer has 3 positions (one per cell), can be empty (null) or have an item
export type SlotDepth = [Item | null, Item | null, Item | null];

// ShelfSlot = vertical stack of depth layers (max 3 layers)
// All 3 cells share the same depth
export interface ShelfSlot {
  layers: SlotDepth[]; // Max 3 layers deep
}

export interface Shelf {
  id: string;
  slots: [ShelfSlot, ShelfSlot, ShelfSlot]; // Exactly 3 slots
}

export interface GameState {
  shelves: Shelf[];
  draggedItem: Item | null;
  draggedFrom: { shelfId: string; slotIndex: number; cellIndex: number } | null;
  isGameWon: boolean;
  moveCount: number;
}

export interface LevelData {
  shelves: Shelf[];
}

export type DragSource = {
  shelfId: string;
  slotIndex: number;
  cellIndex: number;
  item: Item;
};

// PointerEvent type (Preact uses standard DOM events)
export type PointerEvent = globalThis.PointerEvent;

// Item type colors for visual representation
export const ITEM_COLORS: Record<ItemType, string> = {
  apple: "#E74C3C", // Red
  banana: "#F1C40F", // Yellow
  orange: "#E67E22", // Orange
  grape: "#8E44AD", // Purple
  strawberry: "#FF6B9D", // Pink
  pear: "#2ECC71", // Green
  lemon: "#F39C12", // Light Yellow/Orange
  watermelon: "#E91E63", // Deep Pink
};

// Item type labels (for debugging/accessibility)
export const ITEM_LABELS: Record<ItemType, string> = {
  apple: "🍎",
  banana: "🍌",
  orange: "🍊",
  grape: "🍇",
  strawberry: "🍓",
  pear: "🍐",
  lemon: "🍋",
  watermelon: "🍉",
};
