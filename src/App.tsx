// src/App.tsx

import { FunctionalComponent } from 'preact';
import { GameBoardComponent } from './components/GameBoard';
import './styles/global.css';

export const App: FunctionalComponent = () => {
  return (
    <div id="app">
      <GameBoardComponent />
    </div>
  );
};

export default App;