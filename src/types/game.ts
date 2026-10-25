// src/types/game.ts

export type ItemType = 
  | 'apple' 
  | 'banana' 
  | 'orange' 
  | 'grape' 
  | 'strawberry' 
  | 'pear' 
  | 'lemon' 
  | 'watermelon';

export interface Item {
  id: string;
  type: ItemType;
}

// Cell = one of 3 horizontal positions within a slot
// Each cell has vertical depth (stack)
export interface SlotCell {
  items: Item[];  // Stack of items, items[0] = front/top
}

// ShelfSlot = 3 horizontal cells sharing depth
// Match: all 3 cells have same item type at front → clear that layer
export interface ShelfSlot {
  cells: [SlotCell, SlotCell, SlotCell];  // Exactly 3 cells per slot
}

export interface Shelf {
  id: string;
  slots: [ShelfSlot, ShelfSlot, ShelfSlot];  // Exactly 3 slots
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

// Item type colors for visual representation
export const ITEM_COLORS: Record<ItemType, string> = {
  apple: '#E74C3C',       // Red
  banana: '#F1C40F',      // Yellow
  orange: '#E67E22',      // Orange
  grape: '#8E44AD',       // Purple
  strawberry: '#FF6B9D',  // Pink
  pear: '#2ECC71',        // Green
  lemon: '#F39C12',       // Light Yellow/Orange
  watermelon: '#E91E63',  // Deep Pink
};

// Item type labels (for debugging/accessibility)
export const ITEM_LABELS: Record<ItemType, string> = {
  apple: '🍎',
  banana: '🍌',
  orange: '🍊',
  grape: '🍇',
  strawberry: '🍓',
  pear: '🍐',
  lemon: '🍋',
  watermelon: '🍉',
};