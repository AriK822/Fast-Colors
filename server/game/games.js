import { randomUUID } from "node:crypto";
import * as GameEngine from "./engine.js"
import { REGISTERED_CARDS } from "./cards.js";

export const GAMES = new Map();
export const Player_To_Game = new Map();



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
    lobby.game_options.selected_card_objects.forEach((c_id) => {
        this_card_objects.push(...REGISTERED_CARDS[c_id]);
    });

    const this_game = GameEngine.makeNewGame({
        id:lobby.id,
        players: this_players,
        card_objects:this_card_objects,
        init_card_count:lobby.game_options.init_card_count,
        allowed_to_skip_move:lobby.game_options.allowed_to_skip_move,
        max_card_takes:lobby.game_options.max_card_takes,
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

