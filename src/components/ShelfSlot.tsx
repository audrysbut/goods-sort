// src/components/ShelfSlot.tsx

import { FunctionalComponent } from 'preact';
import type { ShelfSlot, SlotCell } from '../types/game';
import { SlotCellComponent } from './SlotCell';
import styles from './ShelfSlot.module.css';

interface ShelfSlotProps {
  slot: ShelfSlot & {
    cells: (SlotCell & {
      topItem: any;
      itemCount: number;
      canAccept: boolean;
      isDragTarget: boolean;
      hasMatch: boolean;
      nextItem: any;
    })[];
    hasLayerMatch: boolean;
    matchType: string | null;
  };
  shelfId: string;
  slotIndex: number;
  onDrop: (source: { shelfId: string; slotIndex: number; cellIndex: number; item: any }, targetShelfId: string, targetSlotIndex: number, targetCellIndex: number) => void;
  onDragStart: (source: { shelfId: string; slotIndex: number; cellIndex: number; item: any }) => void;
  onDragEnd: () => void;
  dragPreview: { shelfId: string; slotIndex: number; cellIndex: number } | null;
}

export const ShelfSlotComponent: FunctionalComponent<ShelfSlotProps> = ({
  slot,
  shelfId,
  slotIndex,
  onDrop,
  onDragStart,
  onDragEnd,
  dragPreview,
}) => {
  const cells = slot.cells;

  const slotClasses = [
    styles.slotContainer,
    slot.hasLayerMatch ? styles.hasLayerMatch : '',
  ].filter(Boolean).join(' ');

  return (
    <div class={slotClasses} role="list" aria-label={`Slot ${slotIndex + 1} (3 cells)`}>
      {/* Layer match indicator */}
      {slot.hasLayerMatch && (
        <div class={styles.layerMatchIndicator} aria-label={`Layer match: ${slot.matchType}! Will clear on next move.`}>
          <span class={styles.matchIcon}>✓</span>
          <span class={styles.matchText}>Layer Match: {slot.matchType}</span>
        </div>
      )}
      
      {cells.map((cell, cellIndex) => {
        const isDragTarget = dragPreview?.shelfId === shelfId && dragPreview?.slotIndex === slotIndex && dragPreview?.cellIndex === cellIndex;
        const canAccept = cell.items.length < 3;
        const hasMatch = false; // Match is at slot level
        
        const handleDrop = (source: { shelfId: string; slotIndex: number; cellIndex: number; item: any }) => {
          onDrop(source, shelfId, slotIndex, cellIndex);
        };
        
        return (
          <SlotCellComponent
            key={`${shelfId}-slot-${slotIndex}-cell-${cellIndex}`}
            cell={cell}
            shelfId={shelfId}
            slotIndex={slotIndex}
            cellIndex={cellIndex}
            canAccept={canAccept}
            isDragTarget={isDragTarget}
            hasMatch={hasMatch}
            onDrop={handleDrop}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        );
      })}
    </div>
  );
};

export default ShelfSlotComponent;