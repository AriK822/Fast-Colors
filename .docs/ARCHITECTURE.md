# Architecture

Fast Colors uses a client-server architecture built with React, Express, and Socket.IO. The client handles the UI and player interactions, while the server manages game logic and authoritative state.

- [Configuration](#configuration)
- [Client](#client)
- [Communication](#communication)
- [Session and State Synchronization](#session-and-state-synchronization)
- [Lobbies and Games](#lobbies-and-games)
- [Game Engine](#game-engine)
- [Card System](#card-system)
- [Storage and Persistence](#storage-and-persistence)
- [Disconnections](#disconnections)


## Configuration
The server has a central **configuration file** for settings that affect its behavior. This keeps configuration separate from the implementation and makes it easier to adjust the server without modifying its core logic.

## Client
The client is built with React. Components are divided into shared components, which can be reused across the application, and page-specific components, which implement functionality for individual pages.
Tailwind CSS is used primarily for layout, spacing, responsiveness, and styling directly within JSX. Shared components help keep the UI consistent and reduce repeated code.

## Communication
All client-server communication uses Socket.IO. Fast Colors does not use a REST API; client requests and server responses are handled through socket events.
This allows the server to send updates to connected clients in real time, without requiring them to repeatedly fetch the latest state.

## Session and State Synchronization
The server maintains the authoritative session state. When a client connects or synchronizes its session, it receives a copy of the relevant state.
The client stores this data in the application context, making it accessible to components throughout the application. Subsequent server updates keep the client-side state synchronized with the server.
The client-side state is a representation of the server's state, not an independent source of truth.

## Lobbies and Games
Lobbies manage players and game settings before a match begins. They also handle lobby-specific actions, such as joining, leaving, and managing players.
When a game starts, the game system takes responsibility for the match. Once a game ends or is abandoned, its state can be cleaned up.

## Game Engine
The game engine processes player actions, validates card plays, applies card effects, and manages turn progression.
A game is represented as a plain JavaScript object containing its current state. This includes information such as the players, their hands, the current card, the turn state, and game history.
Keeping the game state in a structured object makes it easier for the engine to update the match and for the client to render its current state.

## Card System
Cards share a common structure that describes their properties and behavior. Card-specific functions allow cards to define their own play conditions and effects.
The engine handles the common gameplay flow, while individual card implementations provide the unique mechanics. This makes the game extensible without requiring every new card to be implemented directly inside the main engine.
See [Adding New Cards](./ADDING_NEW_CARDS.md) for details and examples.

## Storage and Persistence
Fast Colors does not use an external database. Session, lobby, and game data are maintained in server memory.
This keeps the application simple and avoids requiring a database setup, but the state is not persistent across server restarts. Active sessions, lobbies, and games are lost when the server process stops.

## Disconnections
Disconnected players are tracked by the server. Depending on the configured timeout and game rules, an offline player can be handled automatically so that a match does not remain stuck waiting for them.