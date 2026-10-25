// src/components/ShelfSlot.tsx

import { FunctionalComponent } from 'preact';
import type { ShelfSlot } from '../types/game';
import { SlotCellComponent } from './SlotCell';
import styles from './ShelfSlot.module.css';

interface ShelfSlotProps {
  slot: ShelfSlot & {
    cells: {
      frontItem: any;
      canAccept: boolean;
      isDragTarget: boolean;
      hasFrontMatch: boolean;
      nextItem: any;
      itemCount: number;
    }[];
    hasFrontMatch: boolean;
    matchType: string | null;
    depth: number;
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
  ].filter(Boolean).join(' ');

  return (
    <div class={slotClasses} role="list" aria-label={`Slot ${slotIndex + 1} (3 cells, depth ${slot.depth})`}>
      <div class={styles.cellsContainer}>
        {cells.map((cell, cellIndex) => {
          const isDragTarget = dragPreview?.shelfId === shelfId && dragPreview?.slotIndex === slotIndex && dragPreview?.cellIndex === cellIndex;
          const canAccept = cell.canAccept;
          const hasMatch = false;
          
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
      
      {/* Depth indicator */}
      <div class={styles.depthIndicator} aria-label={`Depth: ${slot.depth} layers`}>
        {Array.from({ length: 3 }, (_, i) => (
          <span 
            key={i} 
            class={styles.depthDot + (i < slot.depth ? ' ' + styles.filled : '')}
          />
        ))}
      </div>
    </div>
  );
};

export default ShelfSlotComponent;