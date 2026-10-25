// src/components/GameBoard.tsx

import { FunctionalComponent } from 'preact';
import { ShelfComponent } from './Shelf';
import { LevelCompleteComponent } from './LevelComplete';
import { useGameState } from '../hooks/useGameState';
import styles from './GameBoard.module.css';

export const GameBoardComponent: FunctionalComponent = () => {
  const {
    shelves,
    isGameWon,
    moveCount,
    canUndo,
    dragPreview,
    handleDragStart,
    handleDrop,
    handleDragEnd,
    resetGame,
    undoMove,
  } = useGameState();

  return (
    <div class={styles.gameBoard}>
      <header class={styles.header}>
        <h1 class={styles.title}>Goods Sort</h1>
        <div class={styles.stats}>
          <div class={styles.stat}>
            <span class={styles.statLabel}>Moves</span>
            <span class={styles.statValue}>{moveCount}</span>
          </div>
          <button 
            class={styles.undoButton}
            onClick={undoMove}
            disabled={!canUndo}
            aria-label={canUndo ? `Undo move (${moveCount} moves)` : 'No moves to undo'}
          >
            ↩ Undo
          </button>
        </div>
      </header>

      <main class={styles.board} role="region" aria-label="Game board">
        {shelves.map(shelf => (
          <ShelfComponent
            key={shelf.id}
            shelf={shelf}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            dragPreview={dragPreview}
          />
        ))}
      </main>

      {isGameWon && (
        <LevelCompleteComponent 
          moveCount={moveCount}
          onPlayAgain={resetGame}
        />
      )}

      <footer class={styles.footer}>
        <p class={styles.instructions}>
          Drag items between slots. Match 3 identical items to clear. Clear all to win!
        </p>
      </footer>
    </div>
  );
};

export default GameBoardComponent;