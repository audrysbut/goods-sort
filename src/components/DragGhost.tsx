// src/components/DragGhost.tsx

import { createPortal } from "preact/compat";
import { useDragController } from "../hooks/usePointerDrag";
import { ITEM_COLORS, ITEM_LABELS } from "../types/game";
import styles from "./DragGhost.module.css";

/**
 * The item that follows the pointer while dragging.
 *
 * Rendered in a portal on document.body so it is never trapped inside a
 * shelf/cell stacking context (which previously made it appear underneath
 * the shelves).
 */
export const DragGhostComponent = () => {
  const { draggedItem, ghostPosition } = useDragController();

  if (!draggedItem || !ghostPosition) return null;

  return createPortal(
    <div
      class={styles.ghost}
      style={{
        left: `${ghostPosition.x}px`,
        top: `${ghostPosition.y}px`,
        backgroundColor: ITEM_COLORS[draggedItem.type],
      }}
      aria-hidden="true"
    >
      <span class={styles.label}>{ITEM_LABELS[draggedItem.type]}</span>
    </div>,
    document.body,
  );
};

export default DragGhostComponent;
