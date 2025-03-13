# Wordle Clone Frontend

This is a frontend implementation of a Wordle clone game built with React. The game logic is designed to be handled by a backend service, with this frontend focusing on the UI components and user interactions.

## Features

- 6x5 game board (6 attempts, 5 letters per word)
- Flip animations when words are submitted
- Color-coded feedback (green for correct position, yellow for correct letter in wrong position, gray for incorrect letters)
- Virtual keyboard with color-coded keys
- Physical keyboard support
- Responsive design

## Project Structure

- `src/App.js` - Main component that manages the UI state and communicates with the backend
- `src/components/GameBoard.js` - Renders the 6x5 grid for the Wordle game
- `src/components/Keyboard.js` - Renders the virtual keyboard for user input
- `src/services/api.js` - Contains functions for communicating with the backend API

## Backend Integration

The frontend is designed to work with a backend service that handles:

1. Starting a new game
2. Validating guesses
3. Providing feedback on guesses
4. Tracking game state

The `api.js` file contains placeholder functions that would be replaced with actual API calls in a production environment.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

## Environment Variables

- `REACT_APP_API_BASE_URL` - Base URL for the backend API (defaults to 'http://localhost:3001/api')

## Future Improvements

- Add animations for key presses
- Implement statistics tracking
- Add a dark/light theme toggle
- Add accessibility features
- Implement share functionality for results

## License

MIT
