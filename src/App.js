import React, { useState } from 'react';
import BabyWelcomeSite from './components/BabyWelcomeSite';
import HackerTerminal from './components/HackerTerminal';

function App() {
  const [showTerminal, setShowTerminal] = useState(true);
  const [terminalDone, setTerminalDone] = useState(false);

  return (
    <div>
      {showTerminal && !terminalDone ? (
        <HackerTerminal onDone={() => {
          setTerminalDone(true);
          setShowTerminal(false);
        }} />
      ) : (
        <BabyWelcomeSite />
      )}
    </div>
  );
}

export default App;
