// src/components/ShelfSlot.tsx

import { FunctionalComponent } from 'preact';
import type { ShelfSlot } from '../types/game';
import { SlotCellComponent } from './SlotCell';
import styles from './ShelfSlot.module.css';

interface ShelfSlotProps {
  slot: ShelfSlot;
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

  return (
    <div class={styles.slotContainer} role="list" aria-label={`Slot ${slotIndex + 1} (3 cells)`}>
      {cells.map((cell, cellIndex) => {
        const isDragTarget = dragPreview?.shelfId === shelfId && dragPreview?.slotIndex === slotIndex && dragPreview?.cellIndex === cellIndex;
        const canAccept = cell.items.length < 3;
        const hasMatch = cell.items.length === 3 && 
                         cell.items.every(item => item.type === cell.items[0].type);
        
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