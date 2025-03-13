import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:5000/api",
    headers: {
        'Content-Type': 'application/json',
    }
})

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

// Function to start a new game
export const startNewGame = async () => {
    try {
        const response = await api.post('/wordle/game')
        return response.data
    } catch (err) {
        console.log('Error starting new Wordle game:', err.message)
        throw err
    }
}

// Function to submit a guess
export const submitGuess = async (gameId, guess) => {
    try {
        const response = await api.post(`/wordle/game/${gameId}/guess`, { guess })
        return response.data
    } catch (err) {
        console.log('Error submitting guess:', err.message)
        throw err
    }
}

// Function to get the current game state
export const getGameState = async (gameId) => {
    try {
        const response = await api.get(`/wordle/game/${gameId}`)
        return response.data
    } catch (err) {
        console.log('Error getting game state:', err.message)
        throw err
    }
}

// Function to get keyboard key statuses
export const getKeyStatuses = async (gameId) => {
    try {
        const response = await api.get(`/wordle/game/${gameId}/key-statuses`)
        return response.data
    } catch (err) {
        console.log('Error getting key statuses:', err.message)
        throw err
    }
}