import { game_options } from "./game_options.js"
import { randomUUID } from "node:crypto";
import * as PlayerstateHandler from "./player_states.js"

export const LOBBIES = new Map();
export const Player_To_Lobby = new Map();


let io = null;
export function hookIO(this_io){
    io = this_io;
}



export function joinPlayerToLobby(player_id, lobby_id, player_name){
    if (LOBBIES[lobby_id] != null){
        LOBBIES[lobby_id].players[player_id] = {
            get status() {return PlayerstateHandler.getPlayerState(player_id);}, 
            "name":player_name,
            get disconnect_expires_at() {return PlayerstateHandler.getPlayerTimeout(player_id);}
        };
        Player_To_Lobby[player_id] = lobby_id;
    }
    else {
        console.log("ERROR: Lobby doesnt exist")
    }
}


export function leaveLobby(player_id){
    const lobby_id = Player_To_Lobby[player_id] ?? null;

    if (!lobby_id){
        return false;
    }

    const playerCount = Object.entries(LOBBIES[lobby_id].players).length;
    if (playerCount <= 1){
        delete LOBBIES[lobby_id];
        delete Player_To_Lobby[player_id];

        joinLobbyListUpdate();
        return true;
    }

    delete LOBBIES[lobby_id].players[player_id];
    delete Player_To_Lobby[player_id];

    updateLobbyOwnership(lobby_id);

    return true;
}


export function updateLobbyOwnership(lobby_id){
    const this_lobby = LOBBIES[lobby_id];
    if (!this_lobby){return}

    if ((Object.entries(this_lobby.players).length) > 0){
        if (!this_lobby.players[this_lobby.owner]){
            this_lobby.owner = Object.keys(this_lobby.players)[0];
            return true;
        }
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

    joinLobbyListUpdate();
    return this_lobby;
}


export function lobbyCleanup(player_id){
    const lobby_id = Player_To_Lobby[player_id];
    if (lobby_id){
        const playerCount = Object.entries(LOBBIES[lobby_id].players).length;
        if (playerCount <= 1){
            delete LOBBIES[lobby_id];
            delete Player_To_Lobby[player_id]

            joinLobbyListUpdate();
            return null
        }
        return LOBBIES[lobby_id];
    }
    return null
}


export function joinLobbyListUpdate(){
    if (!io){console.log("Error hooking io.")}
    io.emit("join_lobby_list_update", LOBBIES)
}


export function kickPlayer(lobby_id, player_id){
    const this_lobby = LOBBIES[lobby_id];
    if (!this_lobby){return false;}

    const to_kick_player = this_lobby.players[player_id];
    if (to_kick_player){
        delete this_lobby.players[player_id];
        delete Player_To_Lobby[player_id];
        return true
    }
    return false
}

