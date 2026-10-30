# Features

## Gameplay
- Real-time multiplayer with support for any number of players
- Create and join lobbies
- Quick play and easy card selection
- Customize game rules and cards to create your own gameplay experience
- Interactive gameplay
- Live updates and syncing
- Add bots with your own custom names
- Expressive game UI that displays:
  - The current base color
  - Card history
  - The current player's turn
  - Timer
  - The current game direction
- Responsive client-side updates for a smoother experience, especially with higher network latency
- Game contextual hints
- Game history (previous plays)
- Game information panel (details about the current match)
- Win animation
- Inspect ended game
- Auto leave ended game after configurable timeout
- Play on behalf of players who leave the game
- Automatically take over for disconnected players after a configurable timeout
- Bot messages in chat based on the game state (for when you're lonely)

## Cards
- A wide variety of cards to choose from
- Not enough? Easily add your own cards
- Animated player hand based on game state
- Easily distinguish playable cards from unplayable ones
- Special rainbow effect on playable wild cards
- Effects and rules
- Choose a new color or select a player when prompted by a card
- Classic UNO cards, plus more creative cards
- Card descriptions to explain what each card does

## Customization & Lobby Management
- Configure game behavior through a `configuration file`
- Customize bot names
- Kick players as the lobby owner
- Automatically transfer lobby ownership if the owner disconnects
- Automatically remove players from the lobby after a timeout
- Advanced game options:
  - Set any custom base colors
  - Customize the weight of individual card objects
  - Customize the numbers of normal cards
- Configurable game rules:
  - Set the initial deck size to any amount
  - Choose whether players can draw when they have a playable card
  - Set the maximum number of cards a player can draw per turn, including unlimited draws
  - Allow wild card stacking
  - Require wild cards to match the current base color
  - Set the turn timer to any duration or disable it entirely

## User Interface & Accessibility
- Various themes to choose from
- Dont like out themes? Make your own under 2 minutes!
- Colorful visuals and smooth animations
- Responsive interface
- Loading animations and indicators
- An interactive UI that helps new players understand the game
- Chat box
- Player status
- Connection quality indicators
- Game-end animation
- Notifications when navigating the interface
- UI that adapts to any player count (any player count!)
- An indicator for new chat messages, which can be toggled on or off
- Expand or collapse sidebar panels
- A syncing indicator for high network latency
- Clear feedback when an action is processing or fails
- Client-side validation for faster feedback
- Rendering limits to keep the UI smooth, especially on weaker devices

## Networking & Reliability
- Automatic reconnection and game state synchronization
- Responsive client-side updates for a smoother experience, especially with higher network latency
- Automatic synchronization with the server after it responds
- Server-side validation to keep the game state consistent
- Automatic state synchronization when errors occur
- Automatic server cache cleanup
- Support for taking over for disconnected players after a timeout
- Rejoin an ongoing game or lobby after reconnecting
- Compressed SVG icons and assets for faster transfers and a smoother experience
- Synchronize the client timer with the server timer to prevent timer mismatches
