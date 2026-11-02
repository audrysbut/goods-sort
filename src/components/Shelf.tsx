// src/components/Shelf.tsx

import { FunctionalComponent } from "preact";
import { memo } from "preact/compat";
import type { ShelfView, ExitingItem } from "../hooks/useGameState";
import { ShelfSlotComponent } from "./ShelfSlot";
import styles from "./Shelf.module.css";

interface ShelfProps {
  shelf: ShelfView;
  exitingItems?: ExitingItem[];
  onExitComplete?: (id: string) => void;
}

const ShelfComponentBase: FunctionalComponent<ShelfProps> = ({
  shelf,
  exitingItems,
  onExitComplete,
}) => {
  return (
    <div
      class={styles.shelf}
      role="list"
      data-shelf-id={shelf.id}
      aria-label={`Shelf ${shelf.id.replace("shelf-", "")}`}
    >
      {shelf.slots.map((slot, slotIndex) => (
        <ShelfSlotComponent
          key={`${shelf.id}-slot-${slotIndex}`}
          slot={slot}
          shelfId={shelf.id}
          slotIndex={slotIndex}
          exitingItems={exitingItems}
          onExitComplete={onExitComplete}
        />
      ))}
    </div>
  );
};

export const ShelfComponent = memo(ShelfComponentBase);
export default ShelfComponent;
