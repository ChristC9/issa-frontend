import React, { useState, useEffect } from 'react';
import './App.css';
import GameBoard from './components/GameBoard';
import Keyboard from './components/Keyboard';
import { startNewGame, submitGuess, getGameState, getKeyStatuses } from './services/api';

function App() {
  const [gameId, setGameId] = useState(null);
  const [guesses, setGuesses] = useState(Array(6).fill(null));
  const [currentGuess, setCurrentGuess] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameMessage, setGameMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keyStatuses, setKeyStatuses] = useState({});
  const [solution, setSolution] = useState(''); // Will be set from API or fallback to 'REACT'
  const [hasWon, setHasWon] = useState(false);

  // For debugging - log state changes
  useEffect(() => {
    console.log('State updated:');
    console.log('- Game ID:', gameId);
    console.log('- Current guesses:', JSON.stringify(guesses));
    console.log('- Current guess:', currentGuess);
    console.log('- Is game over:', isGameOver);
    console.log('- Has won:', hasWon);
    console.log('- Current row index:', guesses.findIndex(val => val === null));
  }, [gameId, guesses, currentGuess, isGameOver, hasWon]);

  // Initialize a new game on component mount
  useEffect(() => {
    initGame();
  }, []);

  // Function to initialize or reset the game
  const initGame = async () => {
    try {
      setIsLoading(true);
      setGameMessage('Starting new game...');

      // Reset game state
      setGuesses(Array(6).fill(null));
      setCurrentGuess('');
      setIsGameOver(false);
      setHasWon(false);
      setKeyStatuses({});

      // Try to call the backend API to start a new game
      try {
        const gameData = await startNewGame();
        console.log('New game started:', gameData);
        setGameId(gameData.gameId);

        // If API returns guesses, use them
        if (gameData.guesses) {
          setGuesses(gameData.guesses);
        }

        // Set solution if provided (in development mode)
        if (process.env.NODE_ENV === 'development' && gameData.solution) {
          setSolution(gameData.solution);
        } else {
          // Default solution for offline/testing
          setSolution('REACT');
        }

        // Get initial key statuses
        if (gameData.gameId) {
          try {
            const keyStatusData = await getKeyStatuses(gameData.gameId);
            setKeyStatuses(keyStatusData);
          } catch (error) {
            console.error('Error getting key statuses:', error);
          }
        }

        setGameMessage(gameData.message || 'Guess the 5-letter word!');
      } catch (error) {
        console.error('Error calling startNewGame API:', error);
        // Fallback to offline mode
        setSolution('REACT');
        setGameMessage('Game started! (offline mode)');
      }
    } catch (error) {
      console.error('Error initializing game:', error);
      setGameMessage('Error starting game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard input
  const handleKeyup = async (key) => {
    if (isGameOver || isLoading) {
      console.log('Game is over or loading, ignoring key press');
      return;
    }

    console.log('Key pressed:', key);

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        setGameMessage('Word must be 5 letters!');
        setTimeout(() => setGameMessage(''), 2000);
        return;
      }

      try {
        setIsLoading(true);

        // Find current row
        const currentRowIndex = guesses.findIndex(val => val === null);

        console.log('Submitting guess at row:', currentRowIndex);

        if (currentRowIndex === -1) {
          setGameMessage('No more guesses available');
          setIsLoading(false);
          return;
        }

        // Try to submit the guess to the API if we have a gameId
        if (gameId) {
          try {
            console.log(`Submitting guess to API endpoint: /wordle/game/${gameId}/guess`);
            console.log(`Guess data: ${currentGuess}`);

            const guessData = await submitGuess(gameId, currentGuess);
            console.log('API response for guess:', guessData);

            // Update game state based on API response
            if (guessData.guesses) {
              setGuesses(guessData.guesses);
            }

            if (guessData.keyStatuses) {
              setKeyStatuses(guessData.keyStatuses);
            }

            // Check game status from API
            if (guessData.gameOver) {
              setIsGameOver(true);
              if (guessData.won) {
                setHasWon(true);
                setGameMessage('You won!');
              } else {
                setGameMessage(`Game over! The word was ${guessData.solution || solution}`);
              }
            } else {
              setGameMessage(guessData.message || 'Keep guessing!');
              setTimeout(() => setGameMessage(''), 2000);
            }

            // Reset current guess
            setCurrentGuess('');
            return; // Exit early since API handled everything
          } catch (error) {
            console.error('Error submitting guess to API:', error);
            console.log('Falling back to local guess handling');
            // Continue with local guess handling
          }
        }

        // Local guess handling (fallback if API fails or isn't available)
        console.log('Using local guess handling');

        // Create a copy of the guesses array
        const newGuesses = [...guesses];

        // Calculate letter statuses locally
        const statuses = currentGuess.split('').map((letter, index) => {
          const upperLetter = letter.toUpperCase();
          const upperSolution = solution.toUpperCase();

          if (upperLetter === upperSolution[index]) return 'correct';
          if (upperSolution.includes(upperLetter)) return 'present';
          return 'absent';
        });

        // Update guesses array
        newGuesses[currentRowIndex] = {
          word: currentGuess.toUpperCase(),
          statuses: statuses
        };

        // Update state with new reference
        setGuesses([...newGuesses]);

        // Update keyboard statuses
        const newKeyStatuses = { ...keyStatuses };
        currentGuess.split('').forEach((letter, index) => {
          const upperLetter = letter.toUpperCase();
          const upperSolution = solution.toUpperCase();

          if (upperLetter === upperSolution[index]) {
            newKeyStatuses[upperLetter] = 'correct';
          } else if (upperSolution.includes(upperLetter) &&
            (!newKeyStatuses[upperLetter] || newKeyStatuses[upperLetter] !== 'correct')) {
            newKeyStatuses[upperLetter] = 'present';
          } else if (!upperSolution.includes(upperLetter)) {
            newKeyStatuses[upperLetter] = 'absent';
          }
        });

        setKeyStatuses(newKeyStatuses);

        // Check game status locally
        const isWin = currentGuess.toUpperCase() === solution.toUpperCase();
        const isLastRow = currentRowIndex >= 5;

        if (isWin) {
          setIsGameOver(true);
          setHasWon(true);
          setGameMessage('You won!');

          // If we have a game ID, try to update the win status on the server
          if (gameId) {
            try {
              // Call the API with the correct endpoint format including game ID
              console.log(`Updating win status for game ${gameId}`);
              await submitGuess(gameId, currentGuess);
              console.log(`Successfully updated win status for game ${gameId}`);
            } catch (error) {
              console.error('Error updating win status on server:', error);
            }
          }
        } else if (isLastRow) {
          setIsGameOver(true);
          setGameMessage(`Game over! The word was ${solution}`);
        } else {
          setGameMessage('Keep guessing!');
          setTimeout(() => setGameMessage(''), 2000);
        }

        // Reset current guess
        setCurrentGuess('');

      } catch (error) {
        console.error('Error processing guess:', error);
        setGameMessage('Error processing guess. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key)) {
      if (currentGuess.length < 5) {
        setCurrentGuess(prev => prev + key);
      }
    }
  };

  // Debug function
  const debugGame = async () => {
    console.log('=== DEBUG INFO ===');
    console.log('Game ID:', gameId);
    console.log('Solution:', solution);
    console.log('Guesses:', JSON.stringify(guesses));
    console.log('Current guess:', currentGuess);
    console.log('Game over:', isGameOver);
    console.log('Has won:', hasWon);

    // If we have a game ID, get the current game state
    if (gameId) {
      try {
        console.log(`Getting game state for game ${gameId}`);
        const gameState = await getGameState(gameId);
        console.log('Current game state from API:', gameState);
      } catch (error) {
        console.error('Error getting game state:', error);
      }
    }
  };

  return (
    <div className="App">
      <header>
        <h1>Wordle Clone</h1>
      </header>
      <div className="game-message">{gameMessage}</div>
      {isLoading && <div className="loading-indicator">Loading...</div>}

      <GameBoard
        guesses={guesses}
        currentGuess={currentGuess}
        solution={solution}
      />

      <Keyboard
        onKeyPress={handleKeyup}
        keyStatuses={keyStatuses}
      />

      <div className="button-container" style={{ marginTop: '20px' }}>
        <button
          className="new-game-button"
          onClick={initGame}
          style={{
            padding: '10px 20px',
            backgroundColor: '#538d4e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          New Game
        </button>

        <button
          className="debug-button"
          onClick={debugGame}
          style={{
            marginLeft: '10px',
            padding: '10px 20px',
            backgroundColor: '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          RESTART
        </button>
      </div>
    </div>
  );
}

export default App;