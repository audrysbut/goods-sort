// src/components/Shelf.tsx

import { FunctionalComponent } from 'preact';
import type { Shelf } from '../types/game';
import { ShelfSlotComponent } from './ShelfSlot';
import styles from './Shelf.module.css';

interface ShelfProps {
  shelf: Shelf;
  onDrop: (source: { shelfId: string; slotIndex: number; cellIndex: number; item: any }, targetShelfId: string, targetSlotIndex: number, targetCellIndex: number) => void;
  onDragStart: (source: { shelfId: string; slotIndex: number; cellIndex: number; item: any }) => void;
  onDragEnd: () => void;
  dragPreview: { shelfId: string; slotIndex: number; cellIndex: number } | null;
}

export const ShelfComponent: FunctionalComponent<ShelfProps> = ({
  shelf,
  onDrop,
  onDragStart,
  onDragEnd,
  dragPreview,
}) => {
  const slots = shelf.slots;

  return (
    <div class={styles.shelf} role="list" aria-label={`Shelf ${shelf.id.replace('shelf-', '')}`}>
      {slots.map((slot, slotIndex) => (
        <ShelfSlotComponent
          key={`${shelf.id}-slot-${slotIndex}`}
          slot={slot as any}
          shelfId={shelf.id}
          slotIndex={slotIndex}
          onDrop={onDrop}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          dragPreview={dragPreview}
        />
      ))}
    </div>
  );
};

export default ShelfComponent;