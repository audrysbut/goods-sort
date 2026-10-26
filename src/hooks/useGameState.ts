// src/hooks/useGameState.ts

import { useState, useCallback, useMemo } from 'preact/hooks';
import type { DragSource, Item, LevelData, Shelf, ShelfSlot, SlotDepth } from '../types/game';
import { level1 } from '../utils/levelData';
import {
  canAcceptItemInFrontLayer,
  checkSlotFrontLayerMatch,
  cloneShelves,
  getFrontLayerItem,
  getItemAtDepth,
  getSlotDepth,
  processMove,
} from '../utils/helpers';

export interface CellView {
  frontItem: Item | null;
  nextItem: Item | null;
  itemCount: number;
  canAccept: boolean;
}

export interface SlotView {
  layers: SlotDepth[];
  cells: CellView[];
  hasFrontMatch: boolean;
  depth: number;
}

export interface ShelfView {
  id: string;
  slots: SlotView[];
}

const createCellView = (slot: ShelfSlot, cellIndex: number): CellView => ({
  frontItem: getFrontLayerItem(slot, cellIndex),
  nextItem: getItemAtDepth(slot, 1, cellIndex),
  itemCount: slot.layers.reduce(
    (count, layer) => count + (layer[cellIndex] ? 1 : 0),
    0,
  ),
  canAccept: canAcceptItemInFrontLayer(slot, cellIndex),
});

const createSlotView = (slot: ShelfSlot): SlotView => ({
  layers: slot.layers,
  cells: [0, 1, 2].map(cellIndex => createCellView(slot, cellIndex)),
  hasFrontMatch: checkSlotFrontLayerMatch(slot) !== null,
  depth: getSlotDepth(slot),
});

export const useGameState = (initialLevel: LevelData = level1) => {
  const [shelves, setShelves] = useState<Shelf[]>(() => cloneShelves(initialLevel.shelves));
  const [isGameWon, setIsGameWon] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [history, setHistory] = useState<Shelf[][]>(() => [cloneShelves(initialLevel.shelves)]);

  const handleDragStart = useCallback((_source: DragSource) => {
    // Intentionally empty: the visual preview is driven by usePointerDrag.
  }, []);

  const handleDrop = useCallback(
    (
      source: DragSource,
      targetShelfId: string,
      targetSlotIndex: number,
      targetCellIndex: number,
    ) => {
      if (
        source.shelfId === targetShelfId &&
        source.slotIndex === targetSlotIndex &&
        source.cellIndex === targetCellIndex
      ) {
        return;
      }

      const result = processMove(
        shelves,
        source.shelfId,
        source.slotIndex,
        source.cellIndex,
        targetShelfId,
        targetSlotIndex,
        targetCellIndex,
      );

      if (!result) return;

      setShelves(result.shelves);
      setHistory(prev => [...prev, result.shelves]);
      setMoveCount(prev => prev + 1);
      if (result.isWon) setIsGameWon(true);
    },
    [shelves],
  );

  const handleDragEnd = useCallback(() => {
    // Intentionally empty: usePointerDrag resets its own state.
  }, []);

  const resetGame = useCallback(() => {
    const fresh = cloneShelves(initialLevel.shelves);
    setShelves(fresh);
    setHistory([fresh]);
    setMoveCount(0);
    setIsGameWon(false);
  }, [initialLevel]);

  const undoMove = useCallback(() => {
    if (history.length <= 1) return;

    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    setShelves(newHistory[newHistory.length - 1]);
    setMoveCount(prev => Math.max(0, prev - 1));
    setIsGameWon(false);
  }, [history]);

  const shelvesView = useMemo<ShelfView[]>(
    () =>
      shelves.map(shelf => ({
        id: shelf.id,
        slots: shelf.slots.map(slot => createSlotView(slot)),
      })),
    [shelves],
  );

  return {
    shelves: shelvesView,
    isGameWon,
    moveCount,
    canUndo: history.length > 1,

    handleDragStart,
    handleDrop,
    handleDragEnd,
    resetGame,
    undoMove,
  };
};
