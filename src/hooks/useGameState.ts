// src/hooks/useGameState.ts

import { useState, useCallback, useMemo } from 'preact/hooks';
import type { LevelData, Shelf, ShelfSlot, DragSource } from '../types/game';
import { level1 } from '../utils/levelData';
import { 
  processMove, 
  canAcceptItemInFrontLayer,
  getFrontLayerItem,
  checkSlotFrontLayerMatch,
  getSlotDepth,
  getItemAtDepth
} from '../utils/helpers';

function enhanceCell(slot: ShelfSlot, cellIndex: number) {
  const frontItem = getFrontLayerItem(slot, cellIndex);
  const nextItem = getItemAtDepth(slot, 1, cellIndex);
  const itemCount = slot.layers.reduce((count, layer) => count + (layer[cellIndex] ? 1 : 0), 0);
  
  return {
    frontItem,
    canAccept: false,
    isDragTarget: false,
    hasFrontMatch: false,
    nextItem,
    itemCount,
  };
}

function enhanceSlot(slot: ShelfSlot) {
  const matchType = checkSlotFrontLayerMatch(slot);
  return {
    cells: [enhanceCell(slot, 0), enhanceCell(slot, 1), enhanceCell(slot, 2)] as any,
    hasFrontMatch: !!matchType,
    matchType: matchType || null,
    depth: getSlotDepth(slot),
    layers: slot.layers,
  };
}

function updateSlotForDrag(slot: any, shelfId: string, slotIndex: number, dragPreview: any) {
  return {
    ...slot,
    cells: slot.cells.map((cell: any, cellIdx: number) => ({
      ...cell,
      isDragTarget: dragPreview?.shelfId === shelfId && dragPreview?.slotIndex === slotIndex && dragPreview?.cellIndex === cellIdx,
      canAccept: canAcceptItemInFrontLayer(slot, cellIdx),
    })),
  };
}

export const useGameState = (initialLevel: LevelData = level1) => {
  const [shelves, setShelves] = useState<Shelf[]>(initialLevel.shelves);
  const [isGameWon, setIsGameWon] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [history, setHistory] = useState<Shelf[][]>([initialLevel.shelves]);
  const [dragPreview, setDragPreview] = useState<{ shelfId: string; slotIndex: number; cellIndex: number } | null>(null);

  const canDrop = useCallback((shelfId: string, slotIndex: number, cellIndex: number): boolean => {
    const shelf = shelves.find(s => s.id === shelfId);
    if (!shelf) return false;
    return canAcceptItemInFrontLayer(shelf.slots[slotIndex], cellIndex);
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
    
    if (!canAcceptItemInFrontLayer(targetShelf.slots[targetSlotIndex], targetCellIndex)) return;
    
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

  const shelfData = useMemo(() => shelves.map(shelf => ({
    ...shelf,
    slots: [
      enhanceSlot(shelf.slots[0]),
      enhanceSlot(shelf.slots[1]),
      enhanceSlot(shelf.slots[2]),
    ] as any
  })), [shelves]);

  // Set isDragTarget and canAccept at render time based on dragPreview
  const shelvesWithDragTarget = useMemo(() => shelfData.map(shelf => ({
    ...shelf,
    slots: [
      updateSlotForDrag(shelf.slots[0], shelf.id, 0, dragPreview),
      updateSlotForDrag(shelf.slots[1], shelf.id, 1, dragPreview),
      updateSlotForDrag(shelf.slots[2], shelf.id, 2, dragPreview),
    ] as any
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