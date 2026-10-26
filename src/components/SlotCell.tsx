// src/components/SlotCell.tsx

import { FunctionalComponent } from 'preact';
import { useDragController } from '../hooks/usePointerDrag';
import type { CellView } from '../hooks/useGameState';
import { ItemComponent } from './Item';
import styles from './SlotCell.module.css';

interface SlotCellProps {
  cell: CellView;
  shelfId: string;
  slotIndex: number;
  cellIndex: number;
  hasMatch: boolean;
}

export const SlotCellComponent: FunctionalComponent<SlotCellProps> = ({
  cell,
  shelfId,
  slotIndex,
  cellIndex,
  hasMatch,
}) => {
  const { dragOverTarget } = useDragController();

  const frontItem = cell.frontItem;
  const canAccept = cell.canAccept;
  const hiddenCount = Math.max(0, cell.itemCount - 1);

  const isCellDragTarget =
    dragOverTarget?.shelfId === shelfId &&
    dragOverTarget?.slotIndex === slotIndex &&
    dragOverTarget?.cellIndex === cellIndex;

  const cellClasses = [
    styles.cell,
    canAccept ? styles.canAccept : styles.full,
    isCellDragTarget && canAccept ? styles.dragOver : '',
    hasMatch ? styles.hasMatch : '',
    !frontItem ? styles.empty : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      class={cellClasses}
      role="button"
      data-shelf-id={shelfId}
      data-slot-index={slotIndex.toString()}
      data-cell-index={cellIndex.toString()}
      data-cell-id="true"
      style={{ touchAction: 'none' }}
      aria-label={!frontItem
        ? `Cell ${cellIndex + 1} empty`
        : `Cell ${cellIndex + 1} with ${cell.itemCount} item${cell.itemCount !== 1 ? 's' : ''}`}
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
            className={styles.stackItem}
            style={{ '--stack-offset': '1' }}
          />
        )}
      </div>

      {hiddenCount > 0 && (
        <div
          class={styles.countBadge}
          aria-label={`${hiddenCount} more item${hiddenCount !== 1 ? 's' : ''} behind`}
        >
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
