// src/hooks/useGameState.ts

import { useState, useCallback, useMemo } from 'preact/hooks';
import type { LevelData, Shelf, Item, DragSource, SlotCell } from '../types/game';
import { level1 } from '../utils/levelData';
import { 
  processMove, 
  canAcceptItem,
  getTopItem,
  checkSlotLayerMatch
} from '../utils/helpers';

interface SlotCellWithMeta extends SlotCell {
  topItem: Item | null;
  itemCount: number;
  canAccept: boolean;
  isDragTarget: boolean;
  hasMatch: boolean;
  nextItem: Item | null;
}

interface ShelfSlotWithMeta {
  cells: [SlotCellWithMeta, SlotCellWithMeta, SlotCellWithMeta];
  hasLayerMatch: boolean;
  matchType: string | null;
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

  const enhanceCell = (cell: SlotCell): SlotCellWithMeta => ({
    ...cell,
    topItem: getTopItem(cell),
    itemCount: cell.items.length,
    canAccept: canAcceptItem(cell),
    isDragTarget: false,
    hasMatch: false,
    nextItem: cell.items.length > 1 ? cell.items[1] : null,
  });

  const enhanceSlot = (slot: { cells: [SlotCell, SlotCell, SlotCell] }): { 
    cells: [SlotCellWithMeta, SlotCellWithMeta, SlotCellWithMeta];
    hasLayerMatch: boolean;
    matchType: string | null;
  } => {
    const matchType = checkSlotLayerMatch(slot as any);
    return {
      cells: [
        enhanceCell(slot.cells[0]),
        enhanceCell(slot.cells[1]),
        enhanceCell(slot.cells[2]),
      ] as [SlotCellWithMeta, SlotCellWithMeta, SlotCellWithMeta],
      hasLayerMatch: !!matchType,
      matchType: matchType || null,
    };
  };

  const shelfData = useMemo(() => shelves.map(shelf => ({
    ...shelf,
    slots: [
      enhanceSlot(shelf.slots[0]),
      enhanceSlot(shelf.slots[1]),
      enhanceSlot(shelf.slots[2]),
    ] as [ShelfSlotWithMeta, ShelfSlotWithMeta, ShelfSlotWithMeta]
  })), [shelves]);

  // Set isDragTarget at render time based on dragPreview
  const shelvesWithDragTarget = useMemo(() => shelfData.map(shelf => ({
    ...shelf,
    slots: [
      {
        ...shelf.slots[0],
        cells: shelf.slots[0].cells.map((cell, cellIdx) => ({
          ...cell,
          isDragTarget: dragPreview?.shelfId === shelf.id && dragPreview?.slotIndex === 0 && dragPreview?.cellIndex === cellIdx
        })) as [SlotCellWithMeta, SlotCellWithMeta, SlotCellWithMeta]
      },
      {
        ...shelf.slots[1],
        cells: shelf.slots[1].cells.map((cell, cellIdx) => ({
          ...cell,
          isDragTarget: dragPreview?.shelfId === shelf.id && dragPreview?.slotIndex === 1 && dragPreview?.cellIndex === cellIdx
        })) as [SlotCellWithMeta, SlotCellWithMeta, SlotCellWithMeta]
      },
      {
        ...shelf.slots[2],
        cells: shelf.slots[2].cells.map((cell, cellIdx) => ({
          ...cell,
          isDragTarget: dragPreview?.shelfId === shelf.id && dragPreview?.slotIndex === 2 && dragPreview?.cellIndex === cellIdx
        })) as [SlotCellWithMeta, SlotCellWithMeta, SlotCellWithMeta]
      },
    ] as [ShelfSlotWithMeta, ShelfSlotWithMeta, ShelfSlotWithMeta]
  })), [shelfData, dragPreview]);

  return {
    shelves: shelvesWithDragTarget,
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