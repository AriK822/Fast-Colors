import { randomUUID } from "node:crypto";
import * as GameEngine from "./engine.js"
import { CARD_ID_TO_GENERATE_FUNC, REGISTERED_CARDS } from "./cards.js";
import * as Engine from "./engine.js"


export const GAMES = new Map();
export const Player_To_Game = new Map();

export const DELETE_GAME_TIMEOUTS = new Map();


export function createGameFromLobby(lobby){
    const this_players = []
    Object.entries(lobby.players).forEach(([p_id, p_desc]) => {
        this_players.push({id:p_id, type:"player"})
    })
    lobby.game_options.bots.forEach((bot_name) => {
        this_players.push({id:randomUUID(), type:"bot", name:bot_name})
    })

    for (let i = this_players.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this_players[i], this_players[j]] = [this_players[j], this_players[i]];
    }

    const this_card_objects = []
    const this_base_colors = lobby.game_options.use_advanced_options
        ? lobby.game_options.base_colors
        : undefined

    if (lobby.game_options.use_advanced_options){
        lobby.game_options.advanced_card_objects.forEach(card_info => {
            if (card_info.id == "norm-custom"){
                const card_obj_arr = CARD_ID_TO_GENERATE_FUNC["norm-custom"](
                    this_base_colors,
                    card_info.nums,
                    card_info.weight,
                )
                this_card_objects.push(...card_obj_arr);
            }
            else {
                const card_obj_arr = CARD_ID_TO_GENERATE_FUNC[card_info.id](
                    this_base_colors,
                    card_info.weight,
                )
                this_card_objects.push(...card_obj_arr);
            }
        })
    }
    else{
        lobby.game_options.selected_card_objects.forEach((c_id) => {
            this_card_objects.push(...REGISTERED_CARDS[c_id]);
        });
    }

    const this_max_draws_per_turn = lobby.game_options.max_draws_per_turn == "infinite"
        ? Infinity
        : lobby.game_options.max_draws_per_turn


    const this_game = GameEngine.makeNewGame({
        id:lobby.id,
        players: this_players,
        card_objects:this_card_objects,
        base_colors:this_base_colors,
        init_deck_size:lobby.game_options.init_deck_size,
        can_draw_when_playable:lobby.game_options.can_draw_when_playable,
        max_draws_per_turn:this_max_draws_per_turn,
        allow_wild_card_stacking:lobby.game_options.allow_wild_card_stacking,
        wild_cards_must_match:lobby.game_options.wild_cards_must_match,
        turn_timer:lobby.game_options.turn_timer,
    })

    GAMES[this_game.id] = this_game;
    Object.entries(lobby.players).forEach(([p_id, p_desc]) => {
        Player_To_Game[p_id] = this_game;
    })
}


export function hiddenGameForClient(player_id){
    const this_game = Player_To_Game[player_id];
    if (!this_game){return}

    return {
        ...this_game,
        card_objects: undefined,
        players: this_game.players.map(player => ({
            ...player,
            deck: player.id == player_id ? 
            player.deck.map(card => ({
                ...card,
                allowed_to_play: card.allowed_to_play_func(this_game),
            }))
            : undefined,
            card_count: player.deck.length,
        }))
    }
}


export function leavePlayerFromGame(player_id){
    const active_game = Player_To_Game[player_id];
    if (!active_game){return}

    delete Player_To_Game[player_id];
    const left_player = active_game.players.find((p_info) => (p_info.id == player_id));
    if (left_player){
        left_player.game_status = "left";
    }
}


export function gameHasActivePlayer(game){
    if (game.players.filter(p_info => (
        p_info.type === "player" 
        && p_info.game_status === "playing"
        && p_info.connection_status === "online"
    )).length > 0) return true
    return false
}


export function deleteGame(game){
    console.log("GAME DELETED", `${Date.now()}`)
    if (GAMES[game.id]){
        game.players.forEach(p_info => {
            delete Player_To_Game[p_info.id];
        })
        delete GAMES[game.id];
        // stop game cycle here
    }
}


export function gameCleanupAfterLeave(this_game){
    if (!gameHasActivePlayer(this_game) && !DELETE_GAME_TIMEOUTS[this_game.id]){
        deleteGame(this_game);
        return true;
    }
    if(!gameHasActivePlayer(this_game))
        this_game.state = Engine.GameStateModes.PAUSED;
    return false;
}


export function mainPlayCardProcess(game, player_id, card_index, choice_data=null){
    const player_index = game.players.findIndex(player => (player.id == player_id));
    if (player_index === -1)
        return [false, "Player not found in active game."]

    if (game.turn !== player_index)
        return [false, "Not allowed. Wait for your turn to play a card."]

    const card_to_play = game.players[player_index].deck[card_index];
    if (!card_to_play)
        return [false, "Card not in deck, invalid card index."]

    if (!card_to_play.allowed_to_play_func(game))
        return [false, "Not allowed to play this card."]

    if (card_to_play.choice) {
        if (!card_to_play.choice.validate(game, choice_data))
            return [false, "Invalid card choice."];
    }

    game.players[game.turn].deck.splice(card_index, 1);
    game.current_card = card_to_play;
    Engine.updateHistoryCard(game, card_to_play)
    card_to_play.place_func(game, choice_data);
    game.cards_taken_in_this_turn = 0;

    return [true, "Card placed successfully."]
}


export function mainSkipMoveProcess(game, player_id){
    const player_index = game.players.findIndex(player => (player.id == player_id));
    if (player_index == -1)
        return [false, "Player not found in active game."]

    if (game.turn !== player_index)
        return [false, "Not allowed. Wait for your turn to play a card."]

    return Engine.skip_turn(game);
}


export function mainTakeCardProcess(game, player_id){
    const player_index = game.players.findIndex(player => (player.id == player_id));
    if (player_index == -1)
        return [false, "Player not found in active game."]

    if (game.turn !== player_index)
        return [false, "Not allowed. Wait for your turn to play a card."]

    return Engine.take_new_card(game);
}


export function handlePlayerDisconnection(game){
    clearTimeout(DELETE_GAME_TIMEOUTS[game.id]);

    const delete_timeout = setTimeout(() =>{
        if (!gameHasActivePlayer(game)) deleteGame(game);
        delete DELETE_GAME_TIMEOUTS[game.id];
    }, 2000);
    DELETE_GAME_TIMEOUTS[game.id] = delete_timeout;

    if(!gameHasActivePlayer(game))
        game.state = Engine.GameStateModes.PAUSED;
}


export function handlePlayerConnection(game){
    clearTimeout(DELETE_GAME_TIMEOUTS[game.id]);
    delete DELETE_GAME_TIMEOUTS[game.id];
    game.state = Engine.GameStateModes.ONGOING;
    // start game cycle
}

