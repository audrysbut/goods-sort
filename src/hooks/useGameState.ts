// src/hooks/useGameState.ts

import { useState, useCallback, useMemo } from 'preact/hooks';
import type { LevelData, Shelf, Item, DragSource, ShelfSlot } from '../types/game';
import { level1 } from '../utils/levelData';
import { 
  processMove, 
  canAcceptItem,
  getTopItem 
} from '../utils/helpers';

interface ShelfSlotWithMeta extends ShelfSlot {
  topItem: Item | null;
  itemCount: number;
  canAccept: boolean;
  isDragTarget: boolean;
  hasMatch: boolean;
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
  dragPreview: { shelfId: string; slotIndex: number } | null;
  
  handleDragStart: (source: DragSource) => void;
  handleDrop: (source: DragSource, targetShelfId: string, targetSlotIndex: number) => void;
  handleDragOver: (shelfId: string, slotIndex: number) => void;
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
  const [dragPreview, setDragPreview] = useState<{ shelfId: string; slotIndex: number } | null>(null);

  const canDrop = useCallback((shelfId: string, slotIndex: number): boolean => {
    const shelf = shelves.find(s => s.id === shelfId);
    if (!shelf) return false;
    return canAcceptItem(shelf.slots[slotIndex]);
  }, [shelves]);

  const handleDragStart = useCallback((_source: DragSource) => {
    // Drag started - preview handled by dragOver
  }, []);

  const handleDragOver = useCallback((shelfId: string, slotIndex: number) => {
    if (canDrop(shelfId, slotIndex)) {
      setDragPreview({ shelfId, slotIndex });
    }
  }, [canDrop]);

  const handleDragLeave = useCallback(() => {
    setDragPreview(null);
  }, []);

  const handleDrop = useCallback((
    source: DragSource, 
    targetShelfId: string, 
    targetSlotIndex: number
  ) => {
    const targetShelf = shelves.find(s => s.id === targetShelfId);
    if (!targetShelf) return;
    
    const targetSlot = targetShelf.slots[targetSlotIndex];
    if (!canAcceptItem(targetSlot)) return;
    
    if (source.shelfId === targetShelfId && source.slotIndex === targetSlotIndex) return;
    
    const result = processMove(
      shelves,
      source.shelfId,
      source.slotIndex,
      targetShelfId,
      targetSlotIndex
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

  const enhanceSlot = (slot: ShelfSlot, shelfId: string, index: number): ShelfSlotWithMeta => ({
    ...slot,
    topItem: getTopItem(slot),
    itemCount: slot.items.length,
    canAccept: canAcceptItem(slot),
    isDragTarget: dragPreview?.shelfId === shelfId && dragPreview?.slotIndex === index,
    hasMatch: slot.items.length === 3 && 
              slot.items.every(item => item.type === slot.items[0].type),
  });

  const shelfData = useMemo(() => shelves.map(shelf => ({
    ...shelf,
    slots: [
      enhanceSlot(shelf.slots[0], shelf.id, 0),
      enhanceSlot(shelf.slots[1], shelf.id, 1),
      enhanceSlot(shelf.slots[2], shelf.id, 2),
    ] as [ShelfSlotWithMeta, ShelfSlotWithMeta, ShelfSlotWithMeta]
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