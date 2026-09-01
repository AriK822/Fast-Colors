import { game_options } from "./game_options.js"
import { randomUUID } from "node:crypto";

export const GAMES = new Map();
export const Player_To_Game = new Map();


export function joinPlayerToGame(player_id, game_id){
    if (GAMES.game_id !== null){
        GAMES.game_id.players.player_id = {"status":"online"};
        Player_To_Game.player_id = game_id;
    }
    else {
        console.log("ERROR: Game doesnt exist")
    }
}


export function removePlayerFromGame(player_id, game_id){
    if (GAMES.game_id !== null){
        GAMES.game_id.players.player_id = null;
        Player_To_Game.player_id = null;
    }
    else {
        console.log("ERROR: Game doesnt exist")
    }
}



