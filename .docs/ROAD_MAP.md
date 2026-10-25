# Roadmap
This roadmap tracks completed work and planned features for Fast Colors. Priorities may change as development progresses.


## Features

### Higher Priority
- Add themes
- Add sfx
- Add settings (music, themes, fullscreen)
- Release

### Lower Priority and Ideas
- Make the active hand curved + custom scroll + draggable
- Place animation
- Draw animation
- Uno btn
- Quick reactions
- Chat filtering
- Rematch
- Timestamps for chat
- Reduced motion (settings)
- Realistic bot chat messages based on game
- Random state based play hints


## Completed

### General
- ✅ Refactor hard-coded values into a global game settings dict
- ✅ Post effects
- ✅ Refactor client UI
- ✅ Home UI
- ✅ Join lobby UI
- ✅ Lobby UI
- ✅ Game UI
- ✅ UI features (below)
- ✅ Add more cards
- ✅ Run tests and find bugs
- ✅ Add docs

### Card Objects
- ✅ Norm
- ✅ Wild +2
- ✅ Wild +4
- ✅ Choose new color
- ✅ Skip
- ✅ Block selected
- ✅ Rotate
- ✅ View selected players deck (spy eye)
- ✅ Joker
- ✅ Reverse deck
- ✅ Add 1 card to selected player
- ✅ Golden rose (instant win)


### UI
- ✅ Animate open choice box
- ✅ Polish timer
- ✅ Polish player strip labels (limit for rendered cards + timer + number of cards)
- ✅ PlayerStrip Badges: Uno, blocked (up right on border)
- ✅ Add a "(you)" tag in sidebar players for active player (game and lobby)
- ✅ Move the timer to around the player label
- ✅ Ping + connection quality in sidebar
- ✅ Chat icon for the phone below open sidebar, with it scaling up and down on new messages (icon hidden if chat hidden)
- ✅ Fix notifications
- ✅ Logo for sidebar
- ✅ Fix rerender in middle cards
- ✅ Fix motion in lobby
- ✅ Play hints in sidebar
- ✅ Game loading skeleton
- ✅ Remove name input from game
- ✅ Add the first card history
- ✅ Win screen animation and celebration
- ✅ Syncing indicator (disable all the action btns and run animation, run loader after 1sec if server didnt respond)
- ✅ Assets rework
- ✅ SVG icons


### Game
- ✅ Game timer
- ✅ Fix engine timer reset on reload
- ✅ Chat server-log on player leave, winner and game end
- ✅ Ended game kick timer
- ✅ Don't allow skip or take client side
- ✅ Active player blocked
- ✅ Add bot chat messages (start game, end game, uno, winner, random)
- ✅ Fix timer (independent of client timer)
- ✅ Left players play as bots after 30 seconds
- ✅ Play when player is offline and timer is infinite
- ✅ Play when player is offline and passed 30s from being offline
