// src/components/ShelfSlot.tsx

import { FunctionalComponent } from 'preact';
import type { ShelfSlot, Item } from '../types/game';
import { useShelfSlotDrop } from '../hooks/useDragDrop';
import { ItemComponent } from './Item';
import styles from './ShelfSlot.module.css';

interface ShelfSlotProps {
  slot: ShelfSlot;
  shelfId: string;
  slotIndex: number;
  canAccept: boolean;
  isDragTarget: boolean;
  hasMatch: boolean;
  onDrop: (source: { shelfId: string; slotIndex: number; item: Item }) => void;
  onDragStart: (source: { shelfId: string; slotIndex: number; item: Item }) => void;
  onDragEnd: () => void;
}

export const ShelfSlotComponent: FunctionalComponent<ShelfSlotProps> = ({
  slot,
  shelfId,
  slotIndex,
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
    onDrop,
    canAccept
  );

  const items = slot.items;
  const itemCount = items.length;
  const hiddenCount = itemCount - 1;

  const slotClasses = [
    styles.slot,
    canAccept ? styles.canAccept : styles.full,
    isDragOver && canAccept ? styles.dragOver : '',
    isDragTarget ? styles.dragTarget : '',
    hasMatch ? styles.hasMatch : '',
    itemCount === 0 ? styles.empty : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      class={slotClasses}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      aria-label={itemCount === 0 
        ? `Empty slot ${slotIndex + 1}` 
        : `Slot ${slotIndex + 1} with ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
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
            isTopItem={index === 0}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
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
          Drop here
        </div>
      )}
    </div>
  );
};

export default ShelfSlotComponent;