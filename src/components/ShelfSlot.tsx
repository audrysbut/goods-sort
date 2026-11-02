// src/components/ShelfSlot.tsx

import { FunctionalComponent } from "preact";
import { memo } from "preact/compat";
import type { SlotView, ExitingItem } from "../hooks/useGameState";
import { SlotCellComponent } from "./SlotCell";
import styles from "./ShelfSlot.module.css";

interface ShelfSlotProps {
  slot: SlotView;
  shelfId: string;
  slotIndex: number;
  exitingItems?: ExitingItem[];
  onExitComplete?: (id: string) => void;
}

const ShelfSlotComponentBase: FunctionalComponent<ShelfSlotProps> = ({
  slot,
  shelfId,
  slotIndex,
  exitingItems,
  onExitComplete,
}) => {
  const slotExiting = exitingItems?.filter(
    (e) => e.shelfId === shelfId && e.slotIndex === slotIndex,
  );
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
            exitingItems={slotExiting?.filter((e) => e.cellIndex === cellIndex)}
            onExitComplete={onExitComplete}
          />
        ))}
      </div>

      {/* Depth indicator */}
      <div
        class={styles.depthIndicator}
        aria-label={`Depth: ${slot.depth} layers`}
      >
        {Array.from({ length: 6 }, (_, i) => (
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

export const ShelfSlotComponent = memo(ShelfSlotComponentBase);
export default ShelfSlotComponent;
