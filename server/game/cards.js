import config from "../config/config.js"


export const CardType = Object.freeze({
    norm: "norm",
    wild: "wild",
})


export const CARD_ID_TO_GENERATE_FUNC = {
    "norm_base_cards": makeNormalCards,
    "wild_base_draw_2_colored": makeWildDraw2Colored,
    "wild_choose_base_color": makeWildChooseColor,
    "wild_skip_next_player": makeWildSkipNextPlayer,
    "wild_block_selected_player": makeWildBlockSelectedPlayer,
    "wild_rotate_colored": makeWildRotateColored,
}

export const REGISTERED_CARDS = {
    // Key: card or card group id,  Value: Array([card_object])
    "norm_base_cards": makeNormalCards(),
    "wild_base_draw_2_colored": makeWildDraw2Colored(),
    "wild_choose_base_color": makeWildChooseColor(),
    "wild_skip_next_player": makeWildSkipNextPlayer(),
    "wild_block_selected_player": makeWildBlockSelectedPlayer(),
    "wild_rotate_colored": makeWildRotateColored(),
}


export const card_objects_with_desc = {
    "norm_base_cards": [
        "Base Cards",
        "Default UNO 4 color cards (Red, Green, Blue, Yellow) numbered 0-9 plus action cards"
    ],
    "wild_base_draw_2_colored": [
        "Draw Two",
        "Wild card, adds +2 cards to the next person's hand"
    ],
    "wild_choose_base_color": [
        "Color Picker",
        "Wild card, Allows the player to choose a new base color for the game"
    ],
    "wild_skip_next_player": [
        "Skip",
        "Wild card, skips the next person's turn"
    ],
    "wild_block_selected_player": [
        "Player Blocker",
        "Wild card, Select a player to block them in their next turn"
    ],
    "wild_rotate_colored" :[
        "Rotate Direction",
        "Inverts the current game direction to the opposite direction."
    ]
};

export const extended_advanced_card_objects_with_desc = {
}


export const EFFECTS = {
    "skip_blocked_players": effectSkipBlockedTurns,
}



export function MakeCard({
    id, 
    type,

    rednered_text=null, 
    base_color=null, 
    overlay_image=null, 

    allowed_to_play_func, 
    place_func,

    choice=null,
    effects=[],
}){
    return {
        id, // Ids should follow: type-uniqueID, For CardType.norm: norm-{color}&{number}
        type,

        rednered_text,
        base_color, // null if allowed on any color, else color_id
        overlay_image,
        // Redner order: Base color -> Overlay -> Text

        allowed_to_play_func,
        place_func,

        choice, // {ui_id:"pick_color/pick_player/...", validate:(game, data)=>(bool)}
        effects, // Array([string...]) of ids of effects
    }

}






// ---   UTILS   ---
function generate_random_card(card_objects) {
    const totalWeight = card_objects.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of card_objects) {
        random -= item.weight;
        if (random <= 0) {
            return item.card;
        }
    }

    return card_objects[card_objects.length - 1].card;
}


function add_cards_to_player(game, player_index, count=1){
    const target_player = game.players[player_index];
    if (!target_player) return false;
    for (let i = 0; i < count; i++){
        target_player.deck.push(generate_random_card(game.card_objects));
    }
    return true;
}





// ---   EFFECTS   ---
export function effectSkipBlockedTurns(game){
    if (!game.effects_data.skip_blocked_players) return;
    console.log("Start: ",game.effects_data.skip_blocked_players)
    
    while ((game.effects_data.skip_blocked_players[game.turn] ?? 0) > 0){
        console.log("For: ", game.turn, game.players[game.turn].name)
        game.effects_data.skip_blocked_players[game.turn] -= 1;
        game.turn = (game.turn + game.direction) % game.players.length;
        game.turn = (game.turn + game.players.length) % game.players.length;
        game.cards_taken_in_this_turn = 0;
    }
    console.log("End: ",game.effects_data.skip_blocked_players)
    return true;
}





// ---   Card generating funcitons   ---
export function makeNormalCards(
    norm_colors = config.cards.default_base_colors,
    norm_nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    weight = 4,
){
    const normal_cards = [];

    norm_colors.forEach((this_base_color) => {
        norm_nums.forEach((nn) => {

            const allowed_to_play_func = (game) => {
                if (game.cards_to_take > 0){
                    return false;
                }
                if (game.base_color == this_base_color){
                    return true;
                }
                if(game.current_card.type === CardType.norm && 
                    game.current_card.rednered_text === nn){
                    return true;
                }
                
                return false;
            }

            const place_func = (game) => {
                game.base_color = this_base_color;
                game.turn = (game.turn + game.direction) % game.players.length;
                game.turn = (game.turn + game.players.length) % game.players.length;
            }

            const this_card = MakeCard({
                id:`${CardType.norm}-${this_base_color}&${nn}`,
                type:CardType.norm,
                rednered_text:nn,
                base_color:this_base_color, // RGB or CSS rendered color value
                overlay_image:"default_overlay.png",
                allowed_to_play_func: allowed_to_play_func,
                place_func: place_func,
                choice:null,
            })

            normal_cards.push(
                {
                    card: this_card,
                    weight: weight,
                }
            )

        })
    })

    return normal_cards;
}


export function makeWildDraw2Colored(
    base_colors = config.cards.default_base_colors,
    weight = 4,
){
    const result = [];

    base_colors.forEach(card_base_color => {

        const allowed_to_play_func = (game) => {
            if (!game.allow_wild_card_stacking && game.cards_to_take > 0) return false;
            if (game.base_color == card_base_color) return true;
            return false;
        }

        const place_func = (game) => {
            game.base_color = card_base_color;
            game.turn = (game.turn + game.direction) % game.players.length;
            game.turn = (game.turn + game.players.length) % game.players.length;
            game.cards_to_take += 2;
        }

        const this_card = MakeCard({
            id:`${CardType.wild}-${card_base_color}-draw+2-colored`,
            type:CardType.wild,
            rednered_text:"+2",
            base_color:card_base_color,
            overlay_image:"wild_plus2_colored.png",
            allowed_to_play_func: allowed_to_play_func,
            place_func: place_func,
            choice:null,
        })

        result.push({
            card: this_card,
            weight,
        })
    })

    return result;
}


export function makeWildChooseColor(
    base_colors = config.cards.default_base_colors,
    weight = 16,
){
    const allowed_to_play_func = (game) => {
        if (game.cards_to_take > 0) return false;
        return true;
    }

    const place_func = (game, choice) => {
        if (choice.random)
            choice.base_color = game.base_colors[Math.floor(Math.random() * game.base_colors.length)]
        
        game.base_color = choice.base_color;
        game.turn = (game.turn + game.direction) % game.players.length;
        game.turn = (game.turn + game.players.length) % game.players.length;
    }

    const choice = {
        ui_id:"pick_color",
        validate: (game, data)=>(data.random || game.base_colors.includes(data?.base_color ?? ""))
    }

    const this_card = MakeCard({
        id:`${CardType.wild}-chooseBaseColor`,
        type:CardType.wild,
        rednered_text:null,
        base_color:null,
        overlay_image:"choose_base_color.png",
        allowed_to_play_func,
        place_func,
        choice,
    })

    return [{card:this_card, weight}];
}


export function makeWildSkipNextPlayer(
    base_colors = config.cards.default_base_colors,
    weight = 16,
){
    const allowed_to_play_func = (game) => {
        if (game.cards_to_take > 0) return false;
        return true;
    }

    const place_func = (game, choice) => {
        if (choice.random)
            choice.base_color = game.base_colors[Math.floor(Math.random() * game.base_colors.length)]
        
        game.base_color = choice.base_color;
        game.turn = (game.turn + game.direction*2) % game.players.length;
        game.turn = (game.turn + game.players.length) % game.players.length;
    }

    const choice = {
        ui_id:"pick_color",
        validate: (game, data)=>(data.random || game.base_colors.includes(data?.base_color ?? ""))
    }

    const this_card = MakeCard({
        id:`${CardType.wild}-skipNextPlayer`,
        type:CardType.wild,
        rednered_text:null,
        base_color:null,
        overlay_image:"skip_next_player.png",
        allowed_to_play_func,
        place_func,
        choice,
    })

    return [{card:this_card, weight}];
}


export function makeWildBlockSelectedPlayer(
    base_colors = config.cards.default_base_colors,
    weight = 4,
){
    const allowed_to_play_func = (game) => {
        if (game.cards_to_take > 0) return false;
        return true;
    }

    const place_func = (game, choice) => {
        if (choice.random){
            let i = Math.floor(Math.random() * (game.players.length - 1));
            if (i >= game.turn) i += 1;
            choice.player_index = i;
        }

        game.effects_data.skip_blocked_players ??= {};
        game.effects_data.skip_blocked_players[choice.player_index] ??= 0;
        game.effects_data.skip_blocked_players[choice.player_index] += 1;
        
        game.turn = (game.turn + game.direction) % game.players.length;
        game.turn = (game.turn + game.players.length) % game.players.length;
    }

    const choice = {
        ui_id:"pick_player",
        validate: (game, data)=>(
            data.random || 
            (game.players[data?.player_index] && game.turn !== data?.player_index)
        )
    }

    const effects = ["skip_blocked_players"]

    const this_card = MakeCard({
        id:`${CardType.wild}-blockSelectedPlayer`,
        type:CardType.wild,
        rednered_text:null,
        base_color:null,
        overlay_image:"block_selected_player.png",
        allowed_to_play_func,
        place_func,
        choice,
        effects,
    })

    return [{card:this_card, weight}];
}


export function makeWildRotateColored(
    base_colors = config.cards.default_base_colors,
    weight = 4,
){
    const result = [];

    base_colors.forEach(card_base_color => {

        const allowed_to_play_func = (game) => {
            if (game.cards_to_take > 0) return false;
            if (game.base_color == card_base_color) return true;
            return false;
        }

        const place_func = (game) => {
            game.base_color = card_base_color;
            game.direction = game.direction * -1;
            game.turn = (game.turn + game.direction) % game.players.length;
            game.turn = (game.turn + game.players.length) % game.players.length;
        }

        const this_card = MakeCard({
            id:`${CardType.wild}-${card_base_color}-rotate-colored`,
            type:CardType.wild,
            rednered_text:null,
            base_color:card_base_color,
            overlay_image:"wild_rotate_colored.png",
            allowed_to_play_func: allowed_to_play_func,
            place_func: place_func,
            choice:null,
        })

        result.push({
            card: this_card,
            weight,
        })
    })

    return result;
}


// To DO:
// Wild: +2, +4
// Magic: Choose new color, skip, rotate
