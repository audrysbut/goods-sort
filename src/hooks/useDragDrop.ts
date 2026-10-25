// src/hooks/useDragDrop.ts

import { useState, useCallback, useRef } from 'preact/hooks';
import type { Item, DragSource } from '../types/game';

interface UseDragDropOptions {
  onDragStart?: (source: DragSource) => void;
  onDrop?: (source: DragSource, targetShelfId: string, targetSlotIndex: number, targetCellIndex: number) => void;
  onDragEnd?: () => void;
}

interface UseDragDropReturn {
  draggedItem: Item | null;
  draggedFrom: DragSource | null;
  isDragging: boolean;
  dragOverTarget: { shelfId: string; slotIndex: number; cellIndex: number } | null;
  
  handleDragStart: (e: DragEvent, source: DragSource) => void;
  handleDragOver: (e: DragEvent, shelfId: string, slotIndex: number, cellIndex: number) => void;
  handleDragLeave: (e: DragEvent) => void;
  handleDrop: (e: DragEvent, shelfId: string, slotIndex: number, cellIndex: number) => void;
  handleDragEnd: (e: DragEvent) => void;
}

export const useDragDrop = (options: UseDragDropOptions = {}): UseDragDropReturn => {
  const [draggedItem, setDraggedItem] = useState<Item | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<DragSource | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{ shelfId: string; slotIndex: number; cellIndex: number } | null>(null);
  
  const isDragging = draggedItem !== null;
  
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const handleDragStart = useCallback((e: DragEvent, source: DragSource) => {
    if (!e.dataTransfer) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(source));
    
    setDraggedItem(source.item);
    setDraggedFrom(source);
    optionsRef.current.onDragStart?.(source);
  }, []);

  const handleDragOver = useCallback((e: DragEvent, shelfId: string, slotIndex: number, cellIndex: number) => {
    if (!e.dataTransfer) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTarget({ shelfId, slotIndex, cellIndex });
  }, []);

  const handleDragLeave = useCallback((_e: DragEvent) => {
  }, []);

  const handleDrop = useCallback((e: DragEvent, shelfId: string, slotIndex: number, cellIndex: number) => {
    if (!e.dataTransfer) return;
    e.preventDefault();
    
    if (!draggedFrom) return;
    
    if (draggedFrom.shelfId === shelfId && draggedFrom.slotIndex === slotIndex && draggedFrom.cellIndex === cellIndex) {
      setDraggedItem(null);
      setDraggedFrom(null);
      setDragOverTarget(null);
      return;
    }
    
    optionsRef.current.onDrop?.(draggedFrom, shelfId, slotIndex, cellIndex);
    
    setDraggedItem(null);
    setDraggedFrom(null);
    setDragOverTarget(null);
  }, [draggedFrom]);

  const handleDragEnd = useCallback((_e: DragEvent) => {
    setDraggedItem(null);
    setDraggedFrom(null);
    setDragOverTarget(null);
    optionsRef.current.onDragEnd?.();
  }, []);

  return {
    draggedItem,
    draggedFrom,
    isDragging,
    dragOverTarget,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
};

interface UseShelfSlotDropReturn {
  isDragOver: boolean;
  handleDragOver: (e: DragEvent) => void;
  handleDragLeave: (e: DragEvent) => void;
  handleDrop: (e: DragEvent) => void;
}

export const useShelfSlotDrop = (
  _shelfId: string,
  _slotIndex: number,
  _cellIndex: number,
  onDrop: (source: DragSource) => void,
  canAccept: boolean
): UseShelfSlotDropReturn => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    if (!canAccept) return;
    if (!e.dataTransfer) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, [canAccept]);

  const handleDragLeave = useCallback((e: DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    const currentTarget = e.currentTarget as HTMLElement;
    
    if (relatedTarget && !currentTarget.contains(relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    if (!canAccept) return;
    if (!e.dataTransfer) return;
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (data) {
        const source: DragSource = JSON.parse(data);
        onDrop(source);
      }
    } catch (err) {
      console.error('Failed to parse drag data:', err);
    }
  }, [canAccept, onDrop]);

  return {
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};

interface UseDraggableItemReturn {
  isDragging: boolean;
  dragProps: {
    draggable: boolean;
    onDragStart: (e: DragEvent) => void;
    onDragEnd: (e: DragEvent) => void;
  };
}

export const useDraggableItem = (
  item: Item,
  shelfId: string,
  slotIndex: number,
  cellIndex: number,
  onDragStart?: (source: DragSource) => void,
  onDragEnd?: () => void
): UseDraggableItemReturn => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback((e: DragEvent) => {
    if (!e.dataTransfer) return;
    const source: DragSource = { shelfId, slotIndex, cellIndex, item };
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(source));
    
    setIsDragging(true);
    onDragStart?.(source);
  }, [shelfId, slotIndex, cellIndex, item, onDragStart]);

  const handleDragEnd = useCallback((_e: DragEvent) => {
    setIsDragging(false);
    onDragEnd?.();
  }, [onDragEnd]);

  return {
    isDragging,
    dragProps: {
      draggable: true,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
    },
  };
}