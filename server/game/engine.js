import { REGISTERED_CARDS, CardType } from "./cards.js";
import * as PlayerstateHandler from "../game/player_states.js"



export function makeNewGame({
    id,
    players=[], // [ {id:uuid4 (seesioID), type:player/bot, name:(if bot)} ]
    card_objects= [
        ...REGISTERED_CARDS.norm_base_4_colors,
    ],
    init_card_count=7, 
    base_colors=["red", "green", "blue", "yellow"],
    allowed_to_skip_move=true, // Allows players to take cards even if they have a card to play
    max_card_takes=1, // How many crads is a player allowed to take in their turn
    allow_wild_card_stacking=true,
    wild_cards_must_match = false,
    turn_timer = 20, // seconds
    chat=["Game started"]
}){
    const start_card = generate_random_card(card_objects);
    const start_base_color = get_start_base_color(start_card, base_colors);
    const players_initiated = init_players(players, init_card_count, card_objects);

    return {
        id,
        turn:0,
        direction:1, // 1 or -1: next_turn = (turn + direction) % players.length
        base_color:start_base_color,
        cards_to_take:0,
        current_card:start_card,
        players:players_initiated,
        cards_taken_in_this_turn:0,
        chat,
        
        // settings
        card_objects,
        base_colors,
        allowed_to_skip_move,
        max_card_takes,
        allow_wild_card_stacking,
        wild_cards_must_match,
        turn_timer,
        last_move_time:Date.now(),
        }
}



function get_start_base_color(start_card, base_colors){
    if (start_card.type != CardType.norm){
        return base_colors[Math.floor(Math.random() * base_colors.length)][0];
    }
    else {
        return start_card.base_color;
    }
}


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



function init_players(player_init_info, init_card_count, card_objects) {
    const players = [];
    for (const player of player_init_info){
        if (player.type == "bot"){
            players.push({
                id:player.id,
                type:player.type,
                name: player.name,

                deck: Array.from({ length: init_card_count }, () => generate_random_card(card_objects)),
            })
        }
        if (player.type == "player"){
            players.push({
                id:player.id,
                type:player.type,
                get status() {return PlayerstateHandler.getPlayerState(player.id);}, 
                get name() {return PlayerstateHandler.getPlayerName(player.id);},

                deck: Array.from({ length: init_card_count }, () => generate_random_card(card_objects)),
            })
        }
    }
    return players;
}


function possible_cards_to_play(game){
    const possible_cards = [];
    game.players[game.turn].deck.forEach((this_card)=>{
        if (this_card.allowed_to_play_func(game)){
            possible_cards.push(this_card);
        }
    })
    return possible_cards;
}


function take_new_card(game){
    if (game.cards_to_take > 0){
        return false;
    }

    if (game.allowed_to_skip_move){
        if (game.cards_taken_in_this_turn < game.max_card_takes){
            game.players[game.turn].deck.push(generate_random_card(game.card_objects));
            game.cards_taken_in_this_turn += 1;
            if (game.cards_taken_in_this_turn == game.max_card_takes){
                game.cards_taken_in_this_turn = 0;
                game.turn = (game.turn + game.direction) % game.players.length;
            }
            return true;
        }
        else {
            return false;
        }
    }
    else {
        if(possible_cards_to_play(game).length > 0){
            return false;
        }
        else{
            if (game.cards_taken_in_this_turn < game.max_card_takes){
                game.players[game.turn].deck.push(generate_random_card(game.card_objects));
                game.cards_taken_in_this_turn += 1;
                if (game.cards_taken_in_this_turn == game.max_card_takes){
                    game.cards_taken_in_this_turn = 0;
                    game.turn = (game.turn + game.direction) % game.players.length;
                }
                return true;
            }
            else {
                return false;
            }
        }
    }
}


function skip_turn(game){
    if (game.cards_to_take > 0){
        return false;
    }

    if (game.cards_taken_in_this_turn == 0){
        game.players[game.turn].deck.push(generate_random_card(game.card_objects));
        game.turn = (game.turn + game.direction) % game.players.length;
        return true;
    }
    else {
        game.cards_taken_in_this_turn = 0;
        game.turn = (game.turn + game.direction) % game.players.length;
        return true;
    }
}


function timeout_move(game){
    if (game.cards_to_take > 0){
        for (let i = 0; i < game.cards_to_take; i++){
            game.players[game.turn].deck.push(generate_random_card(game.card_objects));
        }
        game.cards_taken_in_this_turn = 0;
        game.turn = (game.turn + game.direction) % game.players.length;
        return true;
    }
    else{
        return skip_turn(game);
    }
}


function random_move(game){
    if (game.cards_to_take > 0){
        for (let i = 0; i < game.cards_to_take; i++){
            game.players[game.turn].deck.push(generate_random_card(game.card_objects));
        }
        game.cards_taken_in_this_turn = 0;
        game.turn = (game.turn + game.direction) % game.players.length;
        return true;
    }
    else{
        const allowed_cards = possible_cards_to_play(game);
        if (allowed_cards.length > 0){
            const rand_card = allowed_cards[Math.floor(Math.random() * allowed_cards.length)]
            return place_card(game, rand_card)
        }
        else{
            return skip_turn(game);
        }
    }
}


function place_card(game, card){
    if (!card.allowed_to_play_func(game)){return false;}

    const card_index = game.players[game.turn].deck.indexOf(card);
    if (card_index == -1){return false;}
    game.players[game.turn].deck.splice(card_index, 1);

    card.place_func(game)

    game.current_card = card;

    return true;
}




// const this_game = makeNewGame(1, [{id:1, type:"player"},{id:2, type:"bot", name:"ttv"}]);

// console.log(this_game)
// console.log(this_game.players[0].deck)
// console.log(possible_cards_to_play(this_game))

// console.log(random_move(this_game))
// console.log(random_move(this_game))
// console.log(random_move(this_game))

// console.log(this_game)
// console.log(this_game.players[0].deck)

// // console.log(engine.take_new_card());

// // console.log(engine.game)
// // console.log(engine.game.players[0].deck)

// // console.log(normal_cards[0].place_func(engine.game))

// // console.log(engine.game)
// // console.log(engine.game.players[0].deck)


