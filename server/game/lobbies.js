import { game_options } from "./game_options.js"
import { randomUUID } from "node:crypto";

export const LOBBIES = new Map();
export const Player_To_Lobby = new Map();


export function joinPlayerToLobby(player_id, lobby_id, player_name){
    if (LOBBIES.lobby_id !== null){
        LOBBIES[lobby_id].players[player_id] = {"status":"online", "name":player_name};
        Player_To_Lobby[player_id] = lobby_id;
    }
    else {
        console.log("ERROR: Lobby doesnt exist")
    }
}


export function removePlayerFromLobby(player_id, lobby_id){
    if (LOBBIES.lobby_id !== null){
        LOBBIES[lobby_id].players[player_id] = null;
        Player_To_Lobby[player_id] = null;
    }
    else {
        console.log("ERROR: Lobby doesnt exist")
    }
}


export function createNewLobby(owner_id, owner_name){
    const lobby_id = randomUUID();

    const this_lobby = {
        id: lobby_id,
        game_options: game_options,
        owner:owner_id,
        players: new Map(),
    }

    LOBBIES[lobby_id] = this_lobby;

    joinPlayerToLobby(owner_id, lobby_id, owner_name);

    return this_lobby;
}

