# Tank Shooter - Yandex Games Version

This is a version of the Tank Shooter game optimized for the Yandex Games platform with integrated loading screen and SDK support.

## Features

- **Loading Screen**: Beautiful animated loading screen with progress bar
- **Yandex SDK Integration**: Ready for Yandex Games platform deployment
- **Fallback Support**: Works in development mode when SDK is not available
- **Responsive Design**: Smooth transitions and animations

## How it works

1. **Loading Phase**: Shows loading screen with progress indicators
2. **SDK Initialization**: Attempts to connect to Yandex Games SDK
3. **Game Initialization**: Sets up game state and canvas
4. **Game Launch**: Transitions to the main game after loading completes

## Files

- `index.html` - Main HTML file with loading screen and game container
- `game.js` - Game logic with Yandex SDK integration and loading management
- `style.css` - Styles for both loading screen and game interface
- `README.md` - This documentation file

## Development

For local development, the game will automatically fall back to development mode if the Yandex SDK is not available.

## Screenshots

The game features a polished loading experience that transitions smoothly to the main game.