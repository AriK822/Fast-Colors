import { game_options } from "./game_options.js"
import { randomUUID } from "node:crypto";
import * as PlayerstateHandler from "./player_states.js"

export const LOBBIES = new Map();
export const Player_To_Lobby = new Map();


let io = null;
export function hookIO(this_io){
    io = this_io;
}



export function joinPlayerToLobby(player_id, lobby_id){
    if (LOBBIES[lobby_id] != null){
        LOBBIES[lobby_id].players[player_id] = {
            get status() {return PlayerstateHandler.getPlayerState(player_id);}, 
            get name() {return PlayerstateHandler.getPlayerName(player_id);},
            get disconnect_expires_at() {return PlayerstateHandler.getPlayerTimeout(player_id);},
        };
        Player_To_Lobby[player_id] = LOBBIES[lobby_id];

        LOBBIES[lobby_id].chat.push(["server-log", 
            `${PlayerstateHandler.getPlayerName(player_id)} joined the lobby.`])
    }
    else {
        console.log("ERROR: Lobby doesnt exist")
    }
}


export function leaveLobby(player_id){
    const this_lobby = Player_To_Lobby[player_id] ?? null;

    if (!this_lobby){
        return false;
    }

    const playerCount = Object.entries(this_lobby.players).length;
    if (playerCount <= 1){
        delete LOBBIES[this_lobby.id];
        delete Player_To_Lobby[player_id];

        joinLobbyListUpdate();
        return true;
    }

    delete this_lobby.players[player_id];
    delete Player_To_Lobby[player_id];

    this_lobby.chat.push(["server-log", 
    `${PlayerstateHandler.getPlayerName(player_id)} left the lobby.`])

    updateLobbyOwnership(this_lobby.id);

    return true;
}


export function updateLobbyOwnership(lobby_id){
    const this_lobby = LOBBIES[lobby_id];
    if (!this_lobby){return}

    if ((Object.entries(this_lobby.players).length) > 0){
        if (!this_lobby.players[this_lobby.owner]){
            this_lobby.owner = Object.keys(this_lobby.players)[0];

            this_lobby.chat.push(["server-log", 
                `${PlayerstateHandler.getPlayerName(Object.keys(this_lobby.players)[0])}`+
                ` is now the lobby owner`])

            return true;
        }
    }
}


export function createNewLobby(owner_id){
    const lobby_id = randomUUID();

    const this_lobby = {
        id: lobby_id,
        game_options: game_options,
        owner:owner_id,
        players: new Map(),

        chat: [["server-log", `Lobby created by: ${PlayerstateHandler.getPlayerName(owner_id)}`]],
    }

    LOBBIES[lobby_id] = this_lobby;

    joinPlayerToLobby(owner_id, lobby_id);

    joinLobbyListUpdate();
    return this_lobby;
}


export function lobbyCleanup(player_id){
    const this_lobby = Player_To_Lobby[player_id];
    if (this_lobby){
        const playerCount = Object.entries(this_lobby.players).length;
        if (playerCount <= 1){
            delete LOBBIES[this_lobby.id];
            delete Player_To_Lobby[player_id]

            joinLobbyListUpdate();
            return null
        }
        return this_lobby;
    }
    return null
}


export function makeClientJoinLobbyList(){
    const result = {}
    Object.entries(LOBBIES).forEach(([lobby_id, lobby]) => {
        result[lobby_id] = {
            id: lobby.id,
            owner:lobby.owner,
            players: Object.entries(lobby.players).length,
            bots: lobby.game_options.bots.length,
            selected_card_objects: lobby.game_options.selected_card_objects,
        }
    })
    return result
}


export function joinLobbyListUpdate(){
    if (!io){console.log("Error hooking io.")}
    io.emit("join_lobby_list_update", makeClientJoinLobbyList())
}


export function kickPlayer(lobby_id, player_id){
    const this_lobby = LOBBIES[lobby_id];
    if (!this_lobby){return false;}

    const to_kick_player = this_lobby.players[player_id];
    if (to_kick_player){
        delete this_lobby.players[player_id];
        delete Player_To_Lobby[player_id];

        this_lobby.chat.push(["server-log", 
            `${PlayerstateHandler.getPlayerName(player_id)} was kicked from lobby`])

        return true
    }
    return false
}


export function deleteLobby(lobby){
    if (!LOBBIES[lobby.id]){return false}

    delete LOBBIES[lobby.id];
    Object.entries(lobby.players).forEach(([p_id, p_desc]) => {
        delete Player_To_Lobby[p_id]
    })

    return true;
}

