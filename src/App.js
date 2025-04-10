import React from 'react';
import './App.css';

function App() {
  const handleReveal = () => {
    if (selectedCard === null) return;

    const newCards = [...cards];
    newCards[selectedCard] = { ...newCards[selectedCard], revealed: true };
    setCards(newCards);

    const multiplier = parseFloat(newCards[selectedCard].multiplier);
    const won = parseFloat(betAmount) * multiplier;
    setWinAmount(won);
    setSelectedMultiplier(newCards[selectedCard].multiplier);

    if (multiplier === 0) {
      setResult('lose');
    } else {
      setResult('win');
    }
    setGameOver(true);
    setShowPopup(false);
    setSelectedCard(null);
  };

  const initializeGame = () => {
    const newCards = Array(25).fill(null).map(() => {
      const random = Math.random();
      let cumulativeProbability = 0;
      let selectedMultiplier = multipliers[0];

      for (const multiplier of multipliers) {
        cumulativeProbability += multiplier.probability;
        if (random <= cumulativeProbability) {
          selectedMultiplier = multiplier;
          break;
        }
      }

      return { 
        revealed: false, 
        multiplier: selectedMultiplier.value,
        color: selectedMultiplier.color
      };
    });
    setCards(newCards);
    setGameOver(false);
    setSelectedCard(null);
    setGameStarted(true);
    setResult(null);
    setWinAmount(0);
    setShowPopup(false);
    setSelectedMultiplier('0.00x'); // Reset multiplier display
  };

  const resetGame = () => {
    setGameStarted(false);
    setCards(Array(25).fill({ revealed: false, multiplier: '0.00x' }));
    setBetAmount('');
    setWinAmount(0);
    setGameOver(false);
    setSelectedCard(null);
    setResult(null);
    setShowPopup(false);
    setSelectedMultiplier('0.00x'); // Reset multiplier display
  };

  return (
    <div className="App">
      <div className="game-container">
        <h1 className="game-title">Mines Game</h1>
        
        <div className="left-sidebar">
          {/* User Text Output Tile */}
          <div className="user-text-container">
            <h3>📝 Game Status</h3>
            <div className="user-text-content">
              <div className="status-item">
                <span className="status-label">Current Bet:</span>
                <span className="status-value">${betAmount || '0.00'}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Current Multiplier:</span>
                <span className="status-value">{selectedMultiplier}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Game Status:</span>
                <span className="status-value">{gameStarted ? 'In Progress' : 'Ready to Start'}</span>
              </div>
              {winAmount > 0 && (
                <div className="status-item highlight">
                  <span className="status-label">Last Win:</span>
                  <span className="status-value win">${winAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Controls Section */}
          <div className="controls-container">
            <div className="bet-controls">
              <div className="bet-input-group">
                <label htmlFor="bet">Bet Amount</label>
                <input
                  type="text"
                  id="bet"
                  value={betAmount}
                  onChange={handleBetChange}
                  placeholder="0.00"
                  className="bet-input"
                  disabled={gameStarted}
                />
              </div>
              <div className="multiplier-input-group">
                <label htmlFor="multiplier">Multiplier</label>
                <input
                  type="text"
                  id="multiplier"
                  value={selectedMultiplier}
                  readOnly
                  className="multiplier-input"
                />
              </div>
            </div>
            <button 
              className="start-button" 
              onClick={initializeGame}
              disabled={!betAmount || parseFloat(betAmount) <= 0 || gameStarted}
            >
              {gameStarted ? 'Game In Progress' : 'Start Game'}
            </button>

            {result && (
              <div className={`result-message ${result}`}>
                {result === 'win' 
                  ? `🎉 You Won $${winAmount.toFixed(2)}!` 
                  : '😔 Better luck next time!'}
              </div>
            )}

            {gameOver && (
              <div className="button-container">
                <button className="new-game-button" onClick={resetGame}>
                  Play Again
                </button>
              </div>
            )}
          </div>

          {/* Top Wins Section */}
          <div className="top-wins-container">
            <h3>🏆 Top Wins</h3>
            <div className="top-wins-list">
              {topWins.map((win, index) => (
                <div key={index} className="top-win-item">
                  <span className="rank">#{index + 1}</span>
                  <span className="player">{win.player}</span>
                  <span className="amount">${win.amount.toFixed(2)}</span>
                  <span className="multiplier">{win.multiplier}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="game-board">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`card ${selectedCard === index ? 'selected' : ''} 
                ${card.revealed ? 'revealed' : ''} 
                ${!gameStarted ? 'disabled' : ''}`}
              onClick={() => handleCardSelect(index)}
            >
              {card.revealed ? (
                <div className="multiplier" style={{ color: card.color }}>
                  {card.multiplier}
                </div>
              ) : ''}
            </div>
          ))}
        </div>

        {/* Popup Card */}
        {showPopup && selectedCard !== null && (
          <div className="popup-overlay">
            <div className="popup-card">
              <button className="popup-close" onClick={handleClosePopup}>×</button>
              <ScratchCard
                onReveal={handleReveal}
                revealed={cards[selectedCard].revealed}
                multiplier={cards[selectedCard].multiplier}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 