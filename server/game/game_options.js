// Quick start settings:
export const game_options = {
    card_objects: {
        "norm_base_4_colors": "Default UNO 4 color cards",
    },
    selected_card_objects:[
        "norm_base_4_colors",
    ],
    bots: [],
    init_deck_size:7, 
    can_draw_when_playable:true, // Allows players to take cards even if they have a card to play
    max_draws_per_turn:1, // How many crads is a player allowed to take in their turn
    allow_wild_card_stacking:true, // wild cards can be placed on top of eachother
    wild_cards_must_match: false, // wild cards can stack only if their type is the same
    turn_timer: 20, // seconds

    // advanced_options
    use_advanced_options: false,
    base_colors: ["#f76c57", "#58ed80", "#34a8eb", "#ede158"],
    allowed_advanced_card_objects: {
        "norm-custom": "Normal type cards",
    },
    advanced_card_objects: [
        {id:"norm-custom", weight:1, nums:Array.from({length:10}).map((_, i) => i+1)},
    ],
    
}



export function validateGameOptions(new_options) {
    if (!new_options) return false;

    if (new_options.init_deck_size < 3 || new_options.init_deck_size > 15)
        return false;

    if (
        new_options.max_draws_per_turn !== "infinite" &&
        new_options.max_draws_per_turn < 1 || 
        new_options.max_draws_per_turn > 10
    ) return false;

    if (
        new_options.turn_timer !== "infinite" &&
        ![5, 10, 15, 20, 25, 30, 45, 60].includes(new_options.turn_timer)
    ) return false;

    if (
        typeof new_options.can_draw_when_playable !== "boolean" ||
        typeof new_options.allow_wild_card_stacking !== "boolean" ||
        typeof new_options.wild_cards_must_match !== "boolean"
    ) return false;

    if (!Array.isArray(new_options.selected_card_objects)) return false;
    if (!Array.isArray(new_options.bots)) return false;
    
    if (new_options.bots.length > 10) return false;

    for (const card_id of new_options.selected_card_objects) {
        if (!(card_id in game_options.card_objects)) return false;
    }

    if (new_options.use_advanced_options) {
        if (!Array.isArray(new_options.base_colors)) return false;

        for (const color of new_options.base_colors) {
            if (
                typeof color !== "string" ||
                !/^#[0-9a-fA-F]{6}$/.test(color)
            ) return false;
        }

        if (!Array.isArray(new_options.advanced_card_objects)) return false;

        for (const card_obj of new_options.advanced_card_objects) {
            if (
                typeof card_obj !== "object" ||
                card_obj === null ||
                typeof card_obj.id !== "string"
            ) return false;

            if (!(card_obj.id in game_options.allowed_advanced_card_objects)) {
                return false;
            }

            if (
                typeof card_obj.weight !== "number" ||
                card_obj.weight < 1 ||
                card_obj.weight > 100
            ) return false;

            if (card_obj.id === "norm-custom") {
                if (!Array.isArray(card_obj.nums)) return false;
                for (const num of card_obj.nums) {
                    if (
                        typeof num !== "number" ||
                        num < 1 ||
                        num > 100
                    ) return false;
                }
            }
        }
    }

    return true;
}


export function startGameValidation(lobby){
    if (Object.entries(lobby.players).length + lobby.game_options.bots.length < 2)
        return [false, "At least 2 players in required to start the game."]

    if (Object.entries(lobby.players).length + lobby.game_options.bots.length > 10)
        return [false, "Maximum 10 players and bots are allowed"]

    if (!lobby.game_options.use_advanced_options &&
         lobby.game_options.selected_card_objects.length == 0)
        return [false, "Please select at least one card type to start the game"]

    if (lobby.game_options.use_advanced_options){
        if (lobby.game_options.base_colors.length == 0)
            return [false, "Please select at least one base color to continue"]
        if (lobby.game_options.advanced_card_objects.length == 0)
            return [false, "Please select at least one card object to continue"]
        
        for (const card_obj of lobby.game_options.advanced_card_objects) {
            if (card_obj.id === "norm-custom") {
                if (card_obj.nums.length == 0){
                    return [false, 
                        "Advanced card object of type Nomral Cards must contains at least on number"]
                }
            }
        }
    }
    
    return [true, ""];
}

