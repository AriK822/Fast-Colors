// Quick start settings:
export const game_options = {
    card_objects: {
        "norm_base_4_colors": "Default UNO 4 color cards",
    },
    selected_card_objects:[
        "norm_base_4_colors",
    ],
    bots: [],
    init_card_count:7, 
    allowed_to_skip_move:true, // Allows players to take cards even if they have a card to play
    max_card_takes:1, // How many crads is a player allowed to take in their turn
    allow_wild_card_stacking:true,
    wild_cards_must_match: false,
    turn_timer: 20, // seconds
}



export function validateGameOptions(new_options) {
    if (!new_options) return false;

    if (new_options.init_card_count < 3 || new_options.init_card_count > 15)
        return false;

    if (new_options.max_card_takes < 0 || new_options.max_card_takes > 10)
        return false;

    if (
        new_options.turn_timer !== "infinite" &&
        ![5, 10, 15, 20, 25, 30, 45, 60].includes(new_options.turn_timer)
    ) return false;

    if (
        typeof new_options.allowed_to_skip_move !== "boolean" ||
        typeof new_options.allow_wild_card_stacking !== "boolean" ||
        typeof new_options.wild_cards_must_match !== "boolean"
    ) return false;

    if (!Array.isArray(new_options.selected_card_objects)) return false;
    if (!Array.isArray(new_options.bots)) return false;
    
    if (new_options.bots.length > 10) return false;

    for (const card_id of new_options.selected_card_objects) {
        if (!(card_id in game_options.card_objects)) return false;
    }

    return true;
}


export function startGameValidation(lobby){
    if (Object.entries(lobby.players).length < 2)
        return [false, "At least 2 players in required to start the game."]

    if (Object.entries(lobby.players).length + lobby.game_options.bots.length > 10)
        return [false, "Maximum 10 players and bots are allowed"]

    if (lobby.game_options.selected_card_objects.length == 0)
        return [false, "Please select at least one card type to start the game"]
    
    return [true, ""];
}

