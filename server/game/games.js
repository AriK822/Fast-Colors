import { randomUUID } from "node:crypto";
import * as GameEngine from "./engine.js"
import { CARD_ID_TO_GENERATE_FUNC, REGISTERED_CARDS } from "./cards.js";
import * as Engine from "./engine.js"
import * as GameChat from "./game_chat.js"
import config from "../config/config.js";


export const GAMES = new Map();
export const Player_To_Game = new Map();

export const DELETE_GAME_TIMEOUTS = new Map();


export function createGameFromLobby(lobby){
    const this_players = []
    Object.entries(lobby.players).forEach(([p_id, p_desc]) => {
        this_players.push({id:p_id, type:"player"})
    })
    lobby.game_options.bots.forEach((bot_info) => {
        this_players.push({id:randomUUID(), type:"bot", name:bot_info.name})
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
            if (card_info.id == "norm_base_cards"){
                const card_obj_arr = CARD_ID_TO_GENERATE_FUNC["norm_base_cards"](
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

    GameChat.addBotStartGameMsg(this_game);

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
    console.log("GAME DELETED", `${game.id}`)

    game.state = Engine.GameStateModes.ENDED;
    if (GAMES[game.id]){
        game.players.forEach(p_info => {
            if (Player_To_Game[p_info.id]?.id === game.id)
                delete Player_To_Game[p_info.id];
        })
        delete GAMES[game.id];
    }
    clearTimeout(Engine.GAME_CYCLE_TIMEOUTS[game.id]);
    clearTimeout(DELETE_GAME_TIMEOUTS[game.id]);
    delete Engine.GAME_CYCLE_TIMEOUTS[game.id];
    delete DELETE_GAME_TIMEOUTS[game.id];
}


export function gameCleanupAfterLeave(this_game){
    if (this_game.state == Engine.GameStateModes.ENDED)
        return

    if (!gameHasActivePlayer(this_game) && !DELETE_GAME_TIMEOUTS[this_game.id]){
        deleteGame(this_game);
        return true;
    }
    if(!gameHasActivePlayer(this_game))
        this_game.state = Engine.GameStateModes.PAUSED;
    return false;
}


export function handlePlayerDisconnection(game){
    if (game.state == Engine.GameStateModes.ENDED)
        return

    clearTimeout(DELETE_GAME_TIMEOUTS[game.id]);

    const delete_timeout = setTimeout(() =>{
        if (!gameHasActivePlayer(game)) deleteGame(game);
        delete DELETE_GAME_TIMEOUTS[game.id];
    }, config.game.empty_game_delete_timeout);
    DELETE_GAME_TIMEOUTS[game.id] = delete_timeout;

    if(!gameHasActivePlayer(game))
        game.state = Engine.GameStateModes.PAUSED;
}


export function handlePlayerConnection(game){
    if (game.state == Engine.GameStateModes.ENDED) return
    clearTimeout(DELETE_GAME_TIMEOUTS[game.id]);
    delete DELETE_GAME_TIMEOUTS[game.id];
    return
}

