// src/components/Item.tsx

import { FunctionalComponent, CSSProperties } from 'preact';
import type { Item } from '../types/game';
import { useDraggableItem } from '../hooks/useDragDrop';
import { ITEM_COLORS, ITEM_LABELS } from '../types/game';
import styles from './Item.module.css';

interface ItemProps {
  item: Item;
  shelfId: string;
  slotIndex: number;
  cellIndex: number;
  isTopItem?: boolean;
  onDragStart: (source: { shelfId: string; slotIndex: number; cellIndex: number; item: Item }) => void;
  onDragEnd: () => void;
  className?: string;
  style?: CSSProperties;
}

export const ItemComponent: FunctionalComponent<ItemProps> = ({
  item,
  shelfId,
  slotIndex,
  cellIndex,
  isTopItem = true,
  onDragStart,
  onDragEnd,
  className = '',
  style,
}) => {
  const { isDragging, dragProps } = useDraggableItem(item, shelfId, slotIndex, cellIndex, onDragStart, onDragEnd);
  
  const color = ITEM_COLORS[item.type];
  const label = ITEM_LABELS[item.type];
  
  const draggable = isTopItem;
  
  const baseClasses = [
    styles.item,
    className,
    isDragging ? styles.dragging : '',
    !isTopItem ? styles.hidden : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      {...dragProps}
      class={baseClasses}
      style={{ 
        backgroundColor: color,
        opacity: isDragging ? 0.5 : (isTopItem ? 1 : 0.3),
        transform: isDragging ? 'scale(1.1) rotate(3deg)' : 'none',
        zIndex: isDragging ? 1000 : (isTopItem ? 10 : 1),
        ...style,
      }}
      aria-label={`Item: ${label} (${item.type})`}
      role={draggable ? 'button' : 'img'}
      aria-grabbed={isDragging}
      tabindex={draggable ? 0 : -1}
    >
      <span class={styles.itemLabel} aria-hidden="true">{label}</span>
    </div>
  );
};

export default ItemComponent;