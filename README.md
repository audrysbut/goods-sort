# Goods Sort

A relaxing puzzle game built with **Bun**, **Preact**, **TypeScript**, and **Vite**. Sort items on shelves by matching 3 identical items in a row to clear them.

## 🌐 Live Demo

**https://audrysbut.github.io/goods-sort/**

## 🎮 Gameplay

### Mechanics

- **Shelves**: 3 shelves, each with 3 slots
- **Slots**: Each slot has 3 horizontal cells (visible positions)
- **Depth**: All 3 cells in a slot share vertical depth layers (max 3 layers deep)
- **Match**: When all 3 cells in a slot's **front layer** show the same item → that layer clears
- **Reveal**: Cleared layer removed from all 3 cells → next depth layer becomes visible
- **Win**: Clear all items from all shelves

### Level 1 (Solvable)

```
Shelf 1:
  Slot 1: [🍎, 🍎, 🍎] → Front layer match!
  Slot 2: [🍌, 🍌, 🍌] → Front layer match!
  Slot 3: [🍊, 🍊, 🍊] → Front layer match!
Shelf 2: Empty (for maneuvering)
Shelf 3: Empty (for maneuvering)
```

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start dev server (port 4200)
bun run dev

# Production build
bun run build

# Preview production build
bun run preview

# Run E2E tests (requires dev server running)
npx playwright test
```

## 🛠 Tech Stack

| Tool        | Version             |
| ----------- | ------------------- |
| Runtime     | Bun                 |
| Framework   | Preact 10           |
| Language    | TypeScript          |
| Build       | Vite 5              |
| Testing     | Playwright          |
| Styling     | CSS Modules         |
| Drag & Drop | HTML5 API (vanilla) |

## 📁 Project Structure

```
src/
├── components/
│   ├── GameBoard.tsx      # Main game container
│   ├── Shelf.tsx          # Single shelf (3 slots)
│   ├── ShelfSlot.tsx      # Single slot (3 cells + depth)
│   ├── SlotCell.tsx       # Single cell (front item + depth hint)
│   ├── Item.tsx           # Draggable item
│   └── LevelComplete.tsx  # Win modal
├── hooks/
│   ├── useGameState.ts    # Core game logic (move, match, undo)
│   └── useDragDrop.ts     # HTML5 Drag & Drop handlers
├── types/
│   └── game.ts            # TypeScript interfaces
├── utils/
│   ├── levelData.ts       # Level 1 definition
│   └── helpers.ts         # Game logic helpers
└── styles/
    └── global.css         # Global styles & CSS variables
tests/
├── game.spec.ts           # Basic load + drag tests
└── depth-test.spec.ts     # Depth mechanic verification
```

## 🎯 Key Features

- **Vanilla HTML5 Drag & Drop** — no external dependencies
- **Undo System** — revert last move
- **Depth Visualization** — depth indicator dots on each slot
- **Match Indicators** — green pulse + badge on matching slots
- **Responsive Design** — works on mobile & desktop
- **Accessible** — ARIA labels, keyboard navigation, focus styles
- **Dark Mode Support** — follows system preference

## 🧪 Testing

```bash
# Run all tests
npx playwright test

# Run specific test
npx playwright test tests/game.spec.ts

# Run with UI
npx playwright test --ui
```

Tests require the dev server running on `localhost:4200`.

## 🔧 Configuration

### Port

Set in `vite.config.ts`:

```typescript
server: {
  port: 4200;
}
```

### CSS Variables (in `global.css`)

```css
:root {
  --bg-primary: #f5f5f5;
  --accent-green: #4CAF50;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  /* ... */
}
```

## 📝 License

MIT
