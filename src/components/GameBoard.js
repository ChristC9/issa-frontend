import React from 'react';
import './GameBoard.css';

const GameBoard = ({ guesses, currentGuess, solution }) => {
    const getLetterStatus = (letter, position, word) => {
        if (!letter) return '';
        if (!word) return '';

        const upperLetter = letter.toUpperCase();
        const upperWord = word.toUpperCase();

        if (upperLetter === upperWord[position]) {
            return 'correct';
        } else if (upperWord.includes(upperLetter)) {
            return 'present';
        } else {
            return 'absent';
        }
    };

    const validGuesses = Array.isArray(guesses) ? guesses : Array(6).fill(null);

    const currentRowIndex = validGuesses.findIndex(val => val === null);

    // Enhanced debugging
    console.log('GameBoard rendering with:');
    console.log('- Guesses array:', JSON.stringify(validGuesses));
    console.log('- Current guess:', currentGuess);
    console.log('- Current row index:', currentRowIndex);

    return (
        <div className="game-board">
            {Array(6).fill().map((_, rowIndex) => {
                const isCurrentRow = currentRowIndex !== -1 && rowIndex === currentRowIndex;
                const isCompletedRow = validGuesses[rowIndex] !== null;
                const isEmptyRow = !isCurrentRow && !isCompletedRow;

                return (
                    <div
                        key={rowIndex}
                        className="row"
                        data-row-index={rowIndex}
                        data-row-type={isCurrentRow ? 'current' : isCompletedRow ? 'completed' : 'empty'}
                    >
                        {Array(5).fill().map((_, colIndex) => {
                            let letter = '';
                            let status = '';
                            let cellClass = isEmptyRow ? 'empty' : isCurrentRow ? 'current' : '';
                            let animationDelay = `${colIndex * 0.2}s`;

                            if (isCompletedRow && validGuesses[rowIndex]) {

                                try {
                                    const guess = validGuesses[rowIndex];

                                    if (typeof guess === 'string') {

                                        letter = guess[colIndex] || '';
                                        status = getLetterStatus(letter, colIndex, solution);
                                    } else if (Array.isArray(guess)) {
                                        if (guess[colIndex] && typeof guess[colIndex] === 'object') {
                                            letter = guess[colIndex].letter || '';
                                            status = guess[colIndex].status || '';
                                        } else if (typeof guess[colIndex] === 'string') {
                                            letter = guess[colIndex] || '';
                                            status = getLetterStatus(letter, colIndex, solution);
                                        }
                                    } else if (guess && typeof guess === 'object') {
                                        if (guess.word) {
                                            letter = guess.word[colIndex] || '';
                                            status = guess.statuses ? guess.statuses[colIndex] : getLetterStatus(letter, colIndex, solution);
                                        } else if (guess.letter) {
                                            letter = guess.letter;
                                            status = guess.status || '';
                                        }
                                    } else {
                                        const guessStr = String(guess);
                                        letter = guessStr[colIndex] || '';
                                        status = getLetterStatus(letter, colIndex, solution);
                                    }
                                } catch (error) {
                                    console.error(`Error processing cell at row ${rowIndex}, col ${colIndex}:`, error);
                                }
                            } else if (isCurrentRow) {
                                letter = colIndex < currentGuess.length ? currentGuess[colIndex] : '';
                            }

                            return (
                                <div
                                    key={colIndex}
                                    className={`cell ${status} ${cellClass} ${isCompletedRow ? 'flip' : ''}`}
                                    style={{ animationDelay }}
                                    data-row={rowIndex}
                                    data-col={colIndex}
                                >
                                    {letter}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

export default GameBoard;