# Adding New Cards

All cards are registered server-side in `/server/game/cards.js`.

Each card is a plain JavaScript object created by a function that the game engine runs automatically.

Read [Example](#example) for a quick start.

- [Card Object](#card-object)
- [ID and Type](#id-and-type)
- [Rendering System](#rendering-system)
- [Allowed to Play Function](#allowed-to-play-function)
- [Place Function](#place-function)
- [Middleware](#middleware)
- [Choice](#choice)
- [Effects](#effects)
- [IO and Popups](#io-and-popups)
- [Registering Your Card](#registering-your-card)
- [Example](#example)

## Card Object

Each card can contain the following properties:

- `id` !
- `type` !
- `rednered_text`
- `base_color`
- `overlay_image`
- `allowed_to_play_func` !
- `place_func` !
- `choice`
- `effects`
- `middleWare`

> Properties marked with `!` cannot be `null`.

A card-generating function returns an array of plain card objects.

## ID and Type

**`id`:**

A unique identifier for a specific card. Useful for checking whether the previously placed card is a specific card.

**`type`:**

- **`CardType.norm`**: Normal card type. Can only contain a base color and a number. Has no special powers or effects.
- **`CardType.wild`**: Wild card type. Includes any card type that isn't `norm`.

## Rendering System

By defining `rednered_text`, `base_color`, and `overlay_image`, Fast Colors automatically renders the card on the client side.

The rendering order in Fast Colors is:

`base_color` → `overlay_image` → `rednered_text`

**`rednered_text`:**

The text rendered on top of your card in the same color as `base_color`. Should be a **string**.

**`base_color`:**

The hex color code for the card's base color. It is the lowest layer. The base color is passed from the engine to the card-generating function.

**`overlay_image`:**

A **list of strings** containing image IDs. The client-side card renderer renders the images in the specified order.

You also need to add your images to the `client/assets/cards` directory and register them in the client-side card renderer.

Read [Example](#example) for an implementation.

## Allowed to Play Function

Validates server-side whether the player is allowed to place this card during their turn, given the current game state.

## Place Function

The core of the card. If validation succeeds, `place_func` runs.

The place function has **full access** to the game object and IO, and can **modify anything** inside the game object!

## Middleware

When a game starts, all card objects are generated or copied into the game object.

When a player draws a new card, the engine uses the game's card objects to select a random card.

The card's middleware function runs during this process. It should add properties to the copied card object. For example, a UUID v4 is automatically added through middleware for client-side keys.

## Choice

A choice is where a player needs to make a decision after placing a card.

A choice object contains `ui_id`, `validate()`, and `random()`.

**`ui_id`** is a string that tells the client which UI component to render and instructs it to pass the result to the server.

**`validate()`** runs on the server and validates the player's choice, passed through `data`, against the current game state.

**`random()`** generates a random choice if a bot places the card. The engine calls this function automatically and passes its result to `place_func`.

## Effects

Some cards have special powers that require tracking or saving data for later use. The `effects` system provides flexibility for this.

When a game is created, all effects associated with the game's cards are collected and saved. After each turn, the effect function runs.

Please note that an effect is an engine-level function, not a card-specific property. It runs after each engine cycle.

An `effects` property is added to the game object specifically for tracking effects.

Read the `blockSelectedPlayer` card for an implementation.

## IO and Popups

Some cards need direct access to the server's IO object to send updates to clients. Therefore, the IO object is attached to the game object and is accessible in `place_func`.

Popups are client-side components that can work together with IO to provide live updates for specific events.

Read the `spyEye` card for an implementation.

## Registering Your Card

After creating your card, you need to register it.

Choose an ID string for your card type and register it in `CARD_ID_TO_GENERATE_FUNC`, `REGISTERED_CARDS`, and `card_objects_with_desc`.

You can also register your card in `extended_advanced_card_objects_with_desc` instead of `card_objects_with_desc` so that it is only accessible through advanced lobby options and isn't included among the default cards.

Fast Colors creates `REGISTERED_CARDS` on startup and stores it in memory for performance.

`CARD_ID_TO_GENERATE_FUNC` is used to generate cards for advanced lobby settings, such as custom base colors and weights.

`card_objects_with_desc` is used to display the card's title and description in the lobby on the client side.

For an implementation, see [Example](#example).

## Example

Let's create a card that:
- Is a wild card.
- Must match the game's base color.
- Lets you choose a player to receive one of your hand cards.

Start by copying the code of an existing card:

```js
export function makeSelectedPlus1FromHand(
    base_colors = config.cards.default_base_colors,
    weight = 2, // Choose your card's weight.
) {
    const result = [];

    base_colors.forEach(card_base_color => {
        const allowed_to_play_func = (game) => {}; // Returns a boolean.
        const place_func = (game, choice) => {}; // Modifies the game object.

        const choice = {
            ui_id: "pick_player",
            validate: (game, data) => (
                data.random ||
                (game.players[data?.player_index] && game.turn !== data?.player_index)
            ),
            random: (game) => {
                let i = Math.floor(Math.random() * (game.players.length - 1));
                if (i >= game.turn) i += 1;
                return { player_index: i };
            },
        };

        // Opens the pick_player UI on the client, validates the choice,
        // and selects a random player if a bot places the card.

        const this_card = MakeCard({
            id: `${CardType.wild}-${card_base_color}-slected+1-from-hand`,
            type: CardType.wild,
            rednered_text: null,
            base_color: card_base_color,
            overlay_image: ["plus1_sleceted_from_hand"],
            allowed_to_play_func,
            place_func,
            choice,
        });

        result.push({
            card: this_card,
            weight,
        });
    });

    return result;
}
```

> Note that the card is removed from the player's deck before `place_func` executes.

### Allowed to Play and Place Functions

```js
const allowed_to_play_func = (game) => {
    if (game.cards_to_take > 0) return false; // Danger mode.
    if (game.base_color == card_base_color) return true; // Base colors match.
    return false;
};

const place_func = (game, choice) => {
    const this_player = game.players[game.turn];
    const this_deck = this_player.deck;
    const random_card_index = Math.floor(Math.random() * this_deck.length);
    const random_card = this_deck[random_card_index];

    this_deck.splice(random_card_index, 1);
    game.players[choice.player_index].deck.push(random_card);

    game.base_color = card_base_color;
    game.turn = (game.turn + game.direction) % game.players.length;
    game.turn = (game.turn + game.players.length) % game.players.length;
};
```

### Register

```js
export const CARD_ID_TO_GENERATE_FUNC = {
    ...
    "selected_plus1_from_hand": makeSelectedPlus1FromHand,
    ...
};

export const REGISTERED_CARDS = {
    ...
    "selected_plus1_from_hand": makeSelectedPlus1FromHand(),
    ...
};

export const card_objects_with_desc = {
    ...
    "selected_plus1_from_hand": [
        "How about a gift?",
        "Wild card, when placed, adds one of your hand cards to your selected player.",
    ],
    ...
};
```

Finally, put your card artwork in `/client/assets/cards/your_card_artwork.png`.

Then register it in `render_cards.jsx` on the client:

```js
import SelectedPlus1FromHandArtwork from "../../assets/cards/your_card_artwork.png";

const ovrelayMap = {
    "plus1_sleceted_from_hand": SelectedPlus1FromHandArtwork,
    ...
};
```

Your card is ready. Have fun!

Feel free to ask questions in **GitHub Issues**!