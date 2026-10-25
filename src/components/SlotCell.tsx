// src/components/SlotCell.tsx

import { FunctionalComponent } from 'preact';
import { useShelfSlotDrop } from '../hooks/useDragDrop';
import { ItemComponent } from './Item';
import styles from './SlotCell.module.css';

interface SlotCellProps {
  cell: {
    frontItem: any;
    canAccept: boolean;
    isDragTarget: boolean;
    hasFrontMatch: boolean;
    nextItem: any;
    itemCount: number;
  };
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

  const frontItem = cell.frontItem;
  const itemCount = cell.itemCount;
  const hiddenCount = Math.max(0, itemCount - 1);

  const cellClasses = [
    styles.cell,
    canAccept ? styles.canAccept : styles.full,
    isDragOver && canAccept ? styles.dragOver : '',
    isDragTarget ? styles.dragTarget : '',
    hasMatch ? styles.hasMatch : '',
    !frontItem ? styles.empty : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      class={cellClasses}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      aria-label={!frontItem 
        ? `Cell ${cellIndex + 1} empty` 
        : `Cell ${cellIndex + 1} with ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
      aria-dropeffect={canAccept ? 'move' : 'none'}
      tabIndex={canAccept ? 0 : -1}
    >
      <div class={styles.stack}>
        {frontItem && (
          <ItemComponent
            key={frontItem.id}
            item={frontItem}
            shelfId={shelfId}
            slotIndex={slotIndex}
            cellIndex={cellIndex}
            isTopItem={true}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        )}
        {cell.nextItem && (
          <ItemComponent
            key={`next-${cell.nextItem.id}`}
            item={cell.nextItem}
            shelfId={shelfId}
            slotIndex={slotIndex}
            cellIndex={cellIndex}
            isTopItem={false}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={styles.stackItem}
            style={{ '--stack-offset': 1 }}
          />
        )}
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
      
      {!frontItem && canAccept && (
        <div class={styles.dropHint} aria-hidden="true">
          Drop
        </div>
      )}
    </div>
  );
};

export default SlotCellComponent;