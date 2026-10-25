// src/components/SlotCell.tsx

import { FunctionalComponent } from 'preact';
import type { SlotCell } from '../types/game';
import { useShelfSlotDrop } from '../hooks/useDragDrop';
import { ItemComponent } from './Item';
import styles from './SlotCell.module.css';

interface SlotCellProps {
  cell: SlotCell;
  shelfId: string;
  slotIndex: number;
  cellIndex: number;
  canAccept: boolean;
  isDragTarget: boolean;
  hasMatch: boolean;
  onDrop: (source: { shelfId: string; slotIndex: number; cellIndex: number; item: any }) => void;
  onDragStart: (source: { shelfId: string; slotIndex: number; cellIndex: number; item: any }) => void;
  onDragEnd: () => void;
}

export const SlotCellComponent: FunctionalComponent<SlotCellProps> = ({
  cell,
  shelfId,
  slotIndex,
  cellIndex,
  canAccept,
  isDragTarget,
  hasMatch,
  onDrop,
  onDragStart,
  onDragEnd,
}) => {
  const { isDragOver, handleDragOver, handleDragLeave, handleDrop } = useShelfSlotDrop(
    shelfId,
    slotIndex,
    cellIndex,
    onDrop,
    canAccept
  );

  const items = cell.items;
  const itemCount = items.length;
  const hiddenCount = Math.max(0, itemCount - 3);

  const cellClasses = [
    styles.cell,
    canAccept ? styles.canAccept : styles.full,
    isDragOver && canAccept ? styles.dragOver : '',
    isDragTarget ? styles.dragTarget : '',
    hasMatch ? styles.hasMatch : '',
    itemCount === 0 ? styles.empty : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      class={cellClasses}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      aria-label={itemCount === 0 
        ? `Cell ${cellIndex + 1} empty` 
        : `Cell ${cellIndex + 1} with ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
      aria-dropeffect={canAccept ? 'move' : 'none'}
      tabIndex={canAccept ? 0 : -1}
    >
      <div class={styles.stack}>
        {items.map((item, index) => (
          <ItemComponent
            key={item.id}
            item={item}
            shelfId={shelfId}
            slotIndex={slotIndex}
            cellIndex={cellIndex}
            isTopItem={index === 0}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={index > 0 ? styles.stackItem : ''}
            style={index > 0 ? { '--stack-offset': index } : undefined}
          />
        ))}
      </div>
      
      {hiddenCount > 0 && (
        <div class={styles.countBadge} aria-label={`${hiddenCount} more item${hiddenCount !== 1 ? 's' : ''} behind`}>
          +{hiddenCount}
        </div>
      )}
      
      {hasMatch && (
        <div class={styles.matchIndicator} aria-label="Match found! Will clear on drop.">
          ✓
        </div>
      )}
      
      {itemCount === 0 && canAccept && (
        <div class={styles.dropHint} aria-hidden="true">
          Drop
        </div>
      )}
    </div>
  );
};

export default SlotCellComponent;