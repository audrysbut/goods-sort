// src/components/Shelf.tsx

import { FunctionalComponent } from "preact";
import type { ShelfView } from "../hooks/useGameState";
import { ShelfSlotComponent } from "./ShelfSlot";
import styles from "./Shelf.module.css";

interface ShelfProps {
  shelf: ShelfView;
}

export const ShelfComponent: FunctionalComponent<ShelfProps> = ({ shelf }) => {
  return (
    <div
      class={styles.shelf}
      role="list"
      aria-label={`Shelf ${shelf.id.replace("shelf-", "")}`}
    >
      {shelf.slots.map((slot, slotIndex) => (
        <ShelfSlotComponent
          key={`${shelf.id}-slot-${slotIndex}`}
          slot={slot}
          shelfId={shelf.id}
          slotIndex={slotIndex}
        />
      ))}
    </div>
  );
};

export default ShelfComponent;
