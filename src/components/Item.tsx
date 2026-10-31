// src/components/Item.tsx

import { FunctionalComponent } from "preact";
import type { Item, PointerEvent } from "../types/game";
import { useDragController } from "../hooks/usePointerDrag";
import { ITEM_COLORS, ITEM_LABELS } from "../types/game";
import styles from "./Item.module.css";

interface ItemProps {
  item: Item;
  shelfId: string;
  slotIndex: number;
  cellIndex: number;
  isTopItem?: boolean;
  className?: string;
  style?: Record<string, string>;
}

export const ItemComponent: FunctionalComponent<ItemProps> = ({
  item,
  shelfId,
  slotIndex,
  cellIndex,
  isTopItem = true,
  className = "",
  style,
}) => {
  const { draggedFrom, startDrag } = useDragController();

  const color = ITEM_COLORS[item.type];
  const label = ITEM_LABELS[item.type];

  const isCurrentlyDragged =
    draggedFrom?.shelfId === shelfId &&
    draggedFrom?.slotIndex === slotIndex &&
    draggedFrom?.cellIndex === cellIndex;

  const baseClasses = [
    styles.item,
    className,
    isCurrentlyDragged ? styles.dragging : "",
    !isTopItem ? styles.hidden : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handlePointerDown = (e: PointerEvent) => {
    if (!isTopItem) return;
    startDrag(e, { shelfId, slotIndex, cellIndex, item });
  };

  return (
    <div
      class={baseClasses}
      onPointerDown={handlePointerDown}
      style={{
        backgroundColor: color,
        opacity: isCurrentlyDragged ? 0.35 : isTopItem ? 1 : 0.3,
        zIndex: isTopItem ? 10 : 1,
        // The floating drag ghost takes over; the in-place item must not
        // intercept pointer events (or elementFromPoint) mid-drag.
        pointerEvents: isCurrentlyDragged ? "none" : "auto",
        touchAction: "none",
        userSelect: "none",
        ...style,
      }}
      aria-label={`Item: ${label} (${item.type})`}
      role={isTopItem ? "button" : "img"}
      aria-grabbed={isCurrentlyDragged}
      tabindex={isTopItem ? 0 : -1}
    >
      <span class={styles.itemLabel} aria-hidden="true">
        {label}
      </span>
    </div>
  );
};

export default ItemComponent;
