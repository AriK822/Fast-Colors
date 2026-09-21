import config from "../config/config.js";
import {
    card_objects_with_desc,
    extended_advanced_card_objects_with_desc,
} from "./cards.js"



export const game_options = {
    card_objects: card_objects_with_desc,
    selected_card_objects:[
        "norm_base_cards",
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
    base_colors: config.cards.default_base_colors,
    allowed_advanced_card_objects: {
        ...card_objects_with_desc,
        ...extended_advanced_card_objects_with_desc,
    },
    advanced_card_objects: [
        {id:"norm_base_cards", weight:4, nums:Array.from({length:10}).map((_, i) => i+1)},
    ],
    
    // limits (for UI)
    limits: config.game_options_validation,
}



export function validateGameOptions(new_options) {
    const limits = config.game_options_validation;

    if (!new_options) return false;

    if (new_options.init_deck_size < limits.min_init_deck_size || 
        new_options.init_deck_size > limits.max_init_deck_size
    ) return false;

    if (
        new_options.max_draws_per_turn !== "infinite" &&
        new_options.max_draws_per_turn < limits.min_max_draws_per_turn || 
        new_options.max_draws_per_turn > limits.max_max_draws_per_turn
    ) return false;

    if (
        new_options.turn_timer !== "infinite" &&
        !limits.turn_timers.includes(new_options.turn_timer)
    ) return false;

    if (
        typeof new_options.can_draw_when_playable !== "boolean" ||
        typeof new_options.allow_wild_card_stacking !== "boolean" ||
        typeof new_options.wild_cards_must_match !== "boolean"
    ) return false;

    if (!Array.isArray(new_options.selected_card_objects)) return false;
    if (!Array.isArray(new_options.bots)) return false;
    
    if (new_options.bots.length > limits.max_bots) return false;

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
                card_obj.weight < limits.min_weight ||
                card_obj.weight > limits.max_weight
            ) return false;

            if (card_obj.id === "norm_base_cards") {
                if (!Array.isArray(card_obj.nums)) return false;
                for (const num of card_obj.nums) {
                    if (
                        typeof num !== "number" ||
                        num < limits.min_norm_num ||
                        num > limits.max_norm_num
                    ) return false;
                }
            }
        }
    }

    return true;
}


export function startGameValidation(lobby){
    const limits = config.game_options_validation;

    if (Object.entries(lobby.players).length + lobby.game_options.bots.length < limits.min_total_game_players)
        return [false, 
            `At least ${limits.min_total_game_players} players in required to start the game.`]

    if (Object.entries(lobby.players).length + lobby.game_options.bots.length > limits.max_total_game_players)
        return [false, 
            `Maximum ${limits.max_total_game_players} players and bots are allowed`]

    if (!lobby.game_options.use_advanced_options &&
         lobby.game_options.selected_card_objects.length == 0)
        return [false, "Please select at least one card type to start the game"]

    if (lobby.game_options.use_advanced_options){
        if (lobby.game_options.base_colors.length == 0)
            return [false, "Please select at least one base color to continue"]
        if (lobby.game_options.advanced_card_objects.length == 0)
            return [false, "Please select at least one card object to continue"]
        
        let norm_custom_exists = false;
        for (const card_obj of lobby.game_options.advanced_card_objects) {
            if (card_obj.id === "norm_base_cards") {
                norm_custom_exists = true;
                if (card_obj.nums.length == 0){
                    return [false, 
                        "Advanced card object of type Nomral Cards must contains at least on number"]
                }
            }
        }
        if (!norm_custom_exists)
            return [false, "Advanced card objects must contain at least one Normal Cards type"]
    }
    
    return [true, ""];
}

