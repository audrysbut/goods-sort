// src/components/LevelComplete.tsx

import { FunctionalComponent } from "preact";
import styles from "./LevelComplete.module.css";

interface LevelCompleteProps {
  moveCount: number;
  onPlayAgain: () => void;
}

export const LevelCompleteComponent: FunctionalComponent<
  LevelCompleteProps
> = ({ moveCount, onPlayAgain }) => {
  return (
    <div
      class={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="win-title"
    >
      <div class={styles.modal}>
        <div class={styles.icon} aria-hidden="true">
          🎉
        </div>
        <h2 id="win-title" class={styles.title}>
          Level Complete!
        </h2>
        <p class={styles.message}>
          You cleared all shelves in <strong>{moveCount}</strong> move
          {moveCount !== 1 ? "s" : ""}.
        </p>
        <button class={styles.playAgainButton} onClick={onPlayAgain} autoFocus>
          Play Again
        </button>
      </div>
    </div>
  );
};

export default LevelCompleteComponent;
