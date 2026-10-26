import { randomUUID } from "node:crypto";
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
    "wild_spy_eye_colored": makeSpyEyeColored,
    "wild_wild_draw_4": makeWildDraw4,
    "wild_wild_joker": makeWildJoker,
    "wild_reverse_colored": makeReverseColored,
    "wild_selected_draw_1": makeWildSelectedDraw1,
    "wild_golden_rose": makeGoldenRose,
}

export const REGISTERED_CARDS = {
    // Key: card or card group id,  Value: Array([card_object])
    "norm_base_cards": makeNormalCards(),
    "wild_base_draw_2_colored": makeWildDraw2Colored(),
    "wild_choose_base_color": makeWildChooseColor(),
    "wild_skip_next_player": makeWildSkipNextPlayer(),
    "wild_block_selected_player": makeWildBlockSelectedPlayer(),
    "wild_rotate_colored": makeWildRotateColored(),
    "wild_spy_eye_colored": makeSpyEyeColored(),
    "wild_wild_draw_4": makeWildDraw4(),
    "wild_wild_joker": makeWildJoker(),
    "wild_reverse_colored": makeReverseColored(),
    "wild_selected_draw_1": makeWildSelectedDraw1(),
    "wild_golden_rose": makeGoldenRose(),
}


export const card_objects_with_desc = {
    "norm_base_cards": [
        "Base Cards",
        "Default UNO 4 color cards (Red, Green, Blue, Yellow) numbered 0-9 plus action cards"
    ],
    "wild_choose_base_color": [
        "Color Picker",
        "Wild card, Allows the player to choose a new base color for the game"
    ],
    "wild_base_draw_2_colored": [
        "Draw Two",
        "Wild card, adds +2 cards to the next person's hand"
    ],
    "wild_wild_draw_4": [
        "Draw 4",
        "Wild card, adds +4 cards to the next person's hand",
    ],
    "wild_skip_next_player": [
        "Skip",
        "Wild card, skips the next person's turn"
    ],
    "wild_rotate_colored": [
        "Rotate Direction",
        "Wild card, Inverts the current game direction to the opposite direction."
    ],
    "wild_block_selected_player": [
        "Player Blocker",
        "Wild card, Select a player to block them in their next turn"
    ],
    "wild_spy_eye_colored": [
        "Spy eye",
        "Wild card, Select a player to view their deck once. Can be placed only on the same color."
    ],
    "wild_wild_joker": [
        "Joker",
        "Wild card, swaps all player decks with their next player's deck in game direction.",
    ],
    "wild_reverse_colored": [
        "Reverse",
        "Wild card, Select a player to swap your deck with theirs.",
    ],
    "wild_selected_draw_1": [
        "Selected +1",
        "Wild card, Select a player to add 1 random card to their deck.",
    ],
    "wild_golden_rose": [
        "Golden Rose",
        "Wild card, removes 3 random cards from the deck of the player placing it."+
        "If the player has less than 3 cards, they instantly win!",
    ],
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
    overlay_image=[], 

    allowed_to_play_func, 
    place_func,

    choice=null,
    effects=[],
    middleWare=[],
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
        middleWare:[cardUuidMiddleWare, ...middleWare], // DO NOT modify shared info!
    }

}






// ---   UTILS   ---
function createGameCardInstance(card, game){
    const thisCard = {...card};
    for (const middleWareFunc of thisCard.middleWare)
        middleWareFunc(thisCard, game)
    return thisCard;
}


export function generate_random_card(card_objects, game=null) {
    const totalWeight = card_objects.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of card_objects) {
        random -= item.weight;
        if (random <= 0)
            return createGameCardInstance(item.card, game)
    }

    return createGameCardInstance(card_objects[card_objects.length - 1].card, game);
}


function add_cards_to_player(game, player_index, count=1){
    const target_player = game.players[player_index];
    if (!target_player) return false;
    for (let i = 0; i < count; i++){
        target_player.deck.push(generate_random_card(game.card_objects, game));
    }
    return true;
}





// ---   EFFECTS   ---
export function effectSkipBlockedTurns(game){
    if (!game.effects_data.skip_blocked_players) return;
    
    while ((game.effects_data.skip_blocked_players[game.turn] ?? 0) > 0){
        game.effects_data.skip_blocked_players[game.turn] -= 1;
        game.turn = (game.turn + game.direction) % game.players.length;
        game.turn = (game.turn + game.players.length) % game.players.length;
        game.cards_taken_in_this_turn = 0;
    }
    return true;
}




// ---   MiddleWares   ---
// card is copied from game_objects, game is null at game init
function cardUuidMiddleWare(card, game){
    card.uuid = randomUUID();
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
                overlay_image:["default_overlay"],
                allowed_to_play_func,
                place_func,
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
        const id = `${CardType.wild}-${card_base_color}-draw+2-colored`;

        const allowed_to_play_func = (game) => {
            if (!game.allow_wild_card_stacking && game.cards_to_take > 0) return false;
            if (game.cards_to_take > 0 && game.wild_cards_must_match)
                if (game.current_card.id != id)
                    return false
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
            id,
            type:CardType.wild,
            rednered_text:"+2",
            base_color:card_base_color,
            overlay_image:["wild_plus2_colored"],
            allowed_to_play_func,
            place_func,
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
        game.base_color = choice.base_color;
        game.turn = (game.turn + game.direction) % game.players.length;
        game.turn = (game.turn + game.players.length) % game.players.length;
    }

    const choice = {
        ui_id:"pick_color",
        validate: (game, data)=>(data.random || game.base_colors.includes(data?.base_color ?? "")),
        random: (game)=>({base_color: game.base_colors[Math.floor(Math.random() * game.base_colors.length)]}),
    }

    const this_card = MakeCard({
        id:`${CardType.wild}-chooseBaseColor`,
        type:CardType.wild,
        rednered_text:null,
        base_color:null,
        overlay_image:["choose_base_color"],
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
        game.base_color = choice.base_color;
        game.turn = (game.turn + game.direction*2) % game.players.length;
        game.turn = (game.turn + game.players.length) % game.players.length;
    }

    const choice = {
        ui_id:"pick_color",
        validate: (game, data)=>(data.random || game.base_colors.includes(data?.base_color ?? "")),
        random: (game)=>({base_color: game.base_colors[Math.floor(Math.random() * game.base_colors.length)]}),
    }

    const this_card = MakeCard({
        id:`${CardType.wild}-skipNextPlayer`,
        type:CardType.wild,
        rednered_text:null,
        base_color:null,
        overlay_image:["skip_next_player"],
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
        ),
        random: (game)=>{
            let i = Math.floor(Math.random() * (game.players.length - 1));
            if (i >= game.turn) i += 1;
            return {player_index: i}
        },
    }

    const effects = ["skip_blocked_players"]

    const this_card = MakeCard({
        id:`${CardType.wild}-blockSelectedPlayer`,
        type:CardType.wild,
        rednered_text:null,
        base_color:null,
        overlay_image:["block_selected_player"],
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
            overlay_image:["wild_rotate_colored"],
            allowed_to_play_func,
            place_func,
            choice:null,
        })

        result.push({
            card: this_card,
            weight,
        })
    })

    return result;
}


export function makeSpyEyeColored(
    base_colors = config.cards.default_base_colors,
    weight = 2,
){
    const result = [];

    base_colors.forEach(card_base_color => {

        const allowed_to_play_func = (game) => {
            if (game.cards_to_take > 0) return false;
            if (game.base_color == card_base_color) return true;
            return false;
        }

        const place_func = (game, choice) => {
            (async () => {
                const receiver_sockets =
                    await game.io
                        .in(`player-${game.players[game.turn].id}`)
                        .fetchSockets();

                for (const receiver_socket of receiver_sockets) {
                    receiver_socket.emit("game-popup", {
                        id: "spy-eye-result",
                        spied_player_index: choice.player_index,
                        spied_deck: game.players[choice.player_index].deck,
                    });
                }
            })();

            game.base_color = card_base_color;
            game.turn = (game.turn + game.direction) % game.players.length;
            game.turn = (game.turn + game.players.length) % game.players.length;
        }

        const choice = {
            ui_id:"pick_player",
            validate: (game, data)=>(
                data.random || 
                (game.players[data?.player_index] && game.turn !== data?.player_index)
            ),
            random: (game)=>{
                let i = Math.floor(Math.random() * (game.players.length - 1));
                if (i >= game.turn) i += 1;
                return {player_index: i}
            },
        }

        const this_card = MakeCard({
            id:`${CardType.wild}-${card_base_color}-spy-eye-colored`,
            type:CardType.wild,
            rednered_text:null,
            base_color:card_base_color,
            overlay_image:["spy_eye_colored"],
            allowed_to_play_func,
            place_func,
            choice,
        })

        result.push({
            card: this_card,
            weight,
        })
    })

    return result;
}


export function makeWildDraw4(
    base_colors = config.cards.default_base_colors,
    weight = 16,
){
    const id = `${CardType.wild}-draw+4`;

    const allowed_to_play_func = (game) => {
        if (!game.allow_wild_card_stacking && game.cards_to_take > 0) return false;
        if (game.cards_to_take > 0 && game.wild_cards_must_match)
            if (game.current_card.id != id) return false
        return true;
    }

    const place_func = (game, choice) => {
        game.base_color = choice.base_color;
        game.turn = (game.turn + game.direction) % game.players.length;
        game.turn = (game.turn + game.players.length) % game.players.length;
        game.cards_to_take += 4;
    }

    const choice = {
        ui_id:"pick_color",
        validate: (game, data)=>(data.random || game.base_colors.includes(data?.base_color ?? "")),
        random: (game)=>({base_color: game.base_colors[Math.floor(Math.random() * game.base_colors.length)]}),
    }

    const this_card = MakeCard({
        id,
        type:CardType.wild,
        rednered_text:"+4",
        base_color:null,
        overlay_image:["wild_plus4"],
        allowed_to_play_func,
        place_func,
        choice,
    })

    return [{card:this_card, weight}];
}


export function makeWildJoker(
    base_colors = config.cards.default_base_colors,
    weight = 1,
){
    const allowed_to_play_func = (game) => {
        if (game.cards_to_take > 0) return false;
        return true;
    }

    const place_func = (game) => {
        const f_this_deck = game.players[0].deck;
        const l_this_deck = game.players[game.players.length-1].deck;
        if (game.direction == -1)
            for (let i=0; i<game.players.length; i++){
                game.players[i].deck = 
                    game.players[i+1]?.deck ?? f_this_deck;
            }
        if (game.direction == 1)
            for (let i=game.players.length-1; i>=0; i--){
                game.players[i].deck = 
                    game.players[i-1]?.deck ?? l_this_deck;
            }
        
        game.turn = (game.turn + game.direction) % game.players.length;
        game.turn = (game.turn + game.players.length) % game.players.length;
    }

    const this_card = MakeCard({
        id:`${CardType.wild}-Joker`,
        type:CardType.wild,
        rednered_text:null,
        base_color:null,
        overlay_image:["joker"],
        allowed_to_play_func,
        place_func,
        choice:null,
    })

    return [{card:this_card, weight}];
}


export function makeReverseColored(
    base_colors = config.cards.default_base_colors,
    weight = 2,
){
    const result = [];

    base_colors.forEach(card_base_color => {

        const allowed_to_play_func = (game) => {
            if (game.cards_to_take > 0) return false;
            if (game.base_color == card_base_color) return true;
            return false;
        }

        const place_func = (game, choice) => {
            const this_deck = game.players[game.turn].deck;
            game.players[game.turn].deck = game.players[choice.player_index].deck;
            game.players[choice.player_index].deck = this_deck;

            game.base_color = card_base_color;
            game.turn = (game.turn + game.direction) % game.players.length;
            game.turn = (game.turn + game.players.length) % game.players.length;
        }

        const choice = {
            ui_id:"pick_player",
            validate: (game, data)=>(
                data.random || 
                (game.players[data?.player_index] && game.turn !== data?.player_index)
            ),
            random: (game)=>{
                let i = Math.floor(Math.random() * (game.players.length - 1));
                if (i >= game.turn) i += 1;
                return {player_index: i}
            },
        }

        const this_card = MakeCard({
            id:`${CardType.wild}-${card_base_color}-reverse-colored`,
            type:CardType.wild,
            rednered_text:null,
            base_color:card_base_color,
            overlay_image:["reverse"],
            allowed_to_play_func,
            place_func,
            choice,
        })

        result.push({
            card: this_card,
            weight,
        })
    })

    return result;
}


export function makeWildSelectedDraw1(
    base_colors = config.cards.default_base_colors,
    weight = 2,
){
    const result = [];

    base_colors.forEach(card_base_color => {

        const allowed_to_play_func = (game) => {
            if (game.cards_to_take > 0) return false;
            if (game.base_color == card_base_color) return true;
            return false;
        }

        const place_func = (game, choice) => {
            add_cards_to_player(game, choice.player_index, 1);

            game.base_color = card_base_color;
            game.turn = (game.turn + game.direction) % game.players.length;
            game.turn = (game.turn + game.players.length) % game.players.length;
        }

        const choice = {
            ui_id:"pick_player",
            validate: (game, data)=>(
                data.random || 
                (game.players[data?.player_index] && game.turn !== data?.player_index)
            ),
            random: (game)=>{
                let i = Math.floor(Math.random() * (game.players.length - 1));
                if (i >= game.turn) i += 1;
                return {player_index: i}
            },
        }

        const this_card = MakeCard({
            id:`${CardType.wild}-${card_base_color}-selected-player+1`,
            type:CardType.wild,
            rednered_text:"+1",
            base_color:card_base_color,
            overlay_image:["selected_draw_1"],
            allowed_to_play_func,
            place_func,
            choice,
        })

        result.push({
            card: this_card,
            weight,
        })
    })

    return result;
}


export function makeGoldenRose(
    base_colors = config.cards.default_base_colors,
    weight = 2,
){
    const result = [];

    base_colors.forEach(card_base_color => {

        const allowed_to_play_func = (game) => {
            if (game.cards_to_take > 0) return false;
            if (game.base_color == card_base_color) return true;
            return false;
        }

        const place_func = (game) => {
            const thisDeck = game.players[game.turn].deck
            if(thisDeck.length < 3) game.players[game.turn].deck = [];
            else 
                for (let i=0; i<3; i++)
                    thisDeck.splice(Math.floor(Math.random() * thisDeck.length), 1)
    
            game.base_color = card_base_color;
            game.turn = (game.turn + game.direction) % game.players.length;
            game.turn = (game.turn + game.players.length) % game.players.length;
        }

        const this_card = MakeCard({
            id:`${CardType.wild}-${card_base_color}-golden-rose`,
            type:CardType.wild,
            rednered_text:null,
            base_color:card_base_color,
            overlay_image:["golden_rose"],
            allowed_to_play_func,
            place_func,
        })

        result.push({
            card: this_card,
            weight,
        })
    })

    return result;
}

