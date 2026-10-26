// src/components/ShelfSlot.tsx

import { FunctionalComponent } from "preact";
import type { SlotView } from "../hooks/useGameState";
import { SlotCellComponent } from "./SlotCell";
import styles from "./ShelfSlot.module.css";

interface ShelfSlotProps {
  slot: SlotView;
  shelfId: string;
  slotIndex: number;
}

export const ShelfSlotComponent: FunctionalComponent<ShelfSlotProps> = ({
  slot,
  shelfId,
  slotIndex,
}) => {
  return (
    <div
      class={styles.slotContainer}
      role="list"
      aria-label={`Slot ${slotIndex + 1} (3 cells, depth ${slot.depth})`}
    >
      <div class={styles.cellsContainer}>
        {slot.cells.map((cell, cellIndex) => (
          <SlotCellComponent
            key={`${shelfId}-slot-${slotIndex}-cell-${cellIndex}`}
            cell={cell}
            shelfId={shelfId}
            slotIndex={slotIndex}
            cellIndex={cellIndex}
            hasMatch={slot.hasFrontMatch}
          />
        ))}
      </div>

      {/* Depth indicator */}
      <div
        class={styles.depthIndicator}
        aria-label={`Depth: ${slot.depth} layers`}
      >
        {Array.from({ length: 3 }, (_, i) => (
          <span
            key={i}
            class={
              styles.depthDot + (i < slot.depth ? " " + styles.filled : "")
            }
          />
        ))}
      </div>
    </div>
  );
};

export default ShelfSlotComponent;
