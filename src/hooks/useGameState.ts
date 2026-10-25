// src/hooks/useGameState.ts

import { useState, useCallback, useMemo } from 'preact/hooks';
import type { LevelData, Shelf, Item, DragSource, SlotCell } from '../types/game';
import { level1 } from '../utils/levelData';
import { 
  processMove, 
  canAcceptItem,
  getTopItem 
} from '../utils/helpers';

interface SlotCellWithMeta extends SlotCell {
  topItem: Item | null;
  itemCount: number;
  canAccept: boolean;
  isDragTarget: boolean;
  hasMatch: boolean;
}

interface ShelfSlotWithMeta {
  cells: [SlotCellWithMeta, SlotCellWithMeta, SlotCellWithMeta];
}

interface ShelfWithMeta {
  id: string;
  slots: [ShelfSlotWithMeta, ShelfSlotWithMeta, ShelfSlotWithMeta];
}

interface UseGameStateReturn {
  shelves: ShelfWithMeta[];
  isGameWon: boolean;
  moveCount: number;
  canUndo: boolean;
  dragPreview: { shelfId: string; slotIndex: number; cellIndex: number } | null;
  
  handleDragStart: (source: DragSource) => void;
  handleDrop: (source: DragSource, targetShelfId: string, targetSlotIndex: number, targetCellIndex: number) => void;
  handleDragOver: (shelfId: string, slotIndex: number, cellIndex: number) => void;
  handleDragLeave: () => void;
  handleDragEnd: () => void;
  resetGame: () => void;
  undoMove: () => void;
}

export const useGameState = (initialLevel: LevelData = level1): UseGameStateReturn => {
  const [shelves, setShelves] = useState<Shelf[]>(initialLevel.shelves);
  const [isGameWon, setIsGameWon] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [history, setHistory] = useState<Shelf[][]>([initialLevel.shelves]);
  const [dragPreview, setDragPreview] = useState<{ shelfId: string; slotIndex: number; cellIndex: number } | null>(null);

  const canDrop = useCallback((shelfId: string, slotIndex: number, cellIndex: number): boolean => {
    const shelf = shelves.find(s => s.id === shelfId);
    if (!shelf) return false;
    return canAcceptItem(shelf.slots[slotIndex].cells[cellIndex]);
  }, [shelves]);

  const handleDragStart = useCallback((_source: DragSource) => {
    // Drag started - preview handled by dragOver
  }, []);

  const handleDragOver = useCallback((shelfId: string, slotIndex: number, cellIndex: number) => {
    if (canDrop(shelfId, slotIndex, cellIndex)) {
      setDragPreview({ shelfId, slotIndex, cellIndex });
    }
  }, [canDrop]);

  const handleDragLeave = useCallback(() => {
    setDragPreview(null);
  }, []);

  const handleDrop = useCallback((
    source: DragSource, 
    targetShelfId: string, 
    targetSlotIndex: number,
    targetCellIndex: number
  ) => {
    const targetShelf = shelves.find(s => s.id === targetShelfId);
    if (!targetShelf) return;
    
    const targetCell = targetShelf.slots[targetSlotIndex].cells[targetCellIndex];
    if (!canAcceptItem(targetCell)) return;
    
    if (source.shelfId === targetShelfId && source.slotIndex === targetSlotIndex && source.cellIndex === targetCellIndex) return;
    
    const result = processMove(
      shelves,
      source.shelfId,
      source.slotIndex,
      source.cellIndex,
      targetShelfId,
      targetSlotIndex,
      targetCellIndex
    );
    
    if (!result) return;
    
    setShelves(result.shelves);
    setHistory(prev => [...prev, result.shelves]);
    setMoveCount(prev => prev + 1);
    
    if (result.isWon) {
      setIsGameWon(true);
    }
    
    setDragPreview(null);
  }, [shelves]);

  const handleDragEnd = useCallback(() => {
    setDragPreview(null);
  }, []);

  const resetGame = useCallback(() => {
    setShelves(initialLevel.shelves);
    setIsGameWon(false);
    setMoveCount(0);
    setHistory([initialLevel.shelves]);
    setDragPreview(null);
  }, [initialLevel]);

  const undoMove = useCallback(() => {
    if (history.length <= 1) return;
    
    const newHistory = [...history];
    newHistory.pop();
    const previousState = newHistory[newHistory.length - 1];
    
    setShelves(previousState);
    setHistory(newHistory);
    setMoveCount(prev => Math.max(0, prev - 1));
    setIsGameWon(false);
  }, [history]);

  const enhanceCell = (cell: SlotCell, shelfId: string, slotIndex: number, cellIndex: number): SlotCellWithMeta => ({
    ...cell,
    topItem: getTopItem(cell),
    itemCount: cell.items.length,
    canAccept: canAcceptItem(cell),
    isDragTarget: dragPreview?.shelfId === shelfId && dragPreview?.slotIndex === slotIndex && dragPreview?.cellIndex === cellIndex,
    hasMatch: cell.items.length === 3 && 
              cell.items.every(item => item.type === cell.items[0].type),
  });

  const shelfData = useMemo(() => shelves.map(shelf => ({
    ...shelf,
    slots: shelf.slots.map((slot, slotIdx) => ({
      cells: slot.cells.map((cell, cellIdx) => enhanceCell(cell, shelf.id, slotIdx, cellIdx))
    })) as [ShelfSlotWithMeta, ShelfSlotWithMeta, ShelfSlotWithMeta]
  })), [shelves, dragPreview]);

  return {
    shelves: shelfData,
    isGameWon,
    moveCount,
    canUndo: history.length > 1,
    dragPreview,
    handleDragStart,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    resetGame,
    undoMove,
  };
};