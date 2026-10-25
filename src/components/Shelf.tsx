// src/components/Shelf.tsx

import { FunctionalComponent } from 'preact';
import type { Shelf } from '../types/game';
import { ShelfSlotComponent } from './ShelfSlot';
import styles from './Shelf.module.css';

interface ShelfProps {
  shelf: Shelf;
  onDrop: (source: { shelfId: string; slotIndex: number; item: any }, targetShelfId: string, targetSlotIndex: number) => void;
  onDragStart: (source: { shelfId: string; slotIndex: number; item: any }) => void;
  onDragEnd: () => void;
  dragPreview: { shelfId: string; slotIndex: number } | null;
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
      {slots.map((slot, slotIndex) => {
        const isDragTarget = dragPreview?.shelfId === shelf.id && dragPreview?.slotIndex === slotIndex;
        const canAccept = slot.items.length < 3;
        const hasMatch = slot.items.length === 3 && 
                         slot.items.every(item => item.type === slot.items[0].type);
        
        const handleDrop = (source: { shelfId: string; slotIndex: number; item: any }) => {
          onDrop(source, shelf.id, slotIndex);
        };
        
        return (
          <ShelfSlotComponent
            key={`${shelf.id}-slot-${slotIndex}`}
            slot={slot}
            shelfId={shelf.id}
            slotIndex={slotIndex}
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

export default ShelfComponent;