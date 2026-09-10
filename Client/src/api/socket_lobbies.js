import socket from "./socket_init"



export async function loadLobby() {
    return new Promise((resolve, reject) => {
        socket.emit("load_lobby", null, (response) => {
            resolve(response);
        });
    });
}


export async function loadJoinLobby() {
    return new Promise((resolve, reject) => {
        socket.emit("load_join_lobby", null, (response) => {
            resolve(response);
        });
    });
}


export function listenForJoinLobbyListUpdate(callback) {
    socket.on("join_lobby_list_update", callback);

    return () => {
        socket.off("join_lobby_list_update", callback);
    };
}


export async function joinLobby(lobby_id) {
    return new Promise((resolve, reject) => {
        socket.emit("join_lobby", {lobby_id:lobby_id}, (response) => {
            resolve(response);
        });
    });
}


export async function changeLobbySettings(new_options) {
    return new Promise((resolve, reject) => {
        socket.emit("change_lobby_settings", {game_options:new_options}, (response) => {
            resolve(response);
        });
    });
}


export function listenForLobbySync(callback) {
    socket.on("sync_lobby", callback);

    return () => {
        socket.off("sync_lobby", callback);
    };
}


export async function leaveLobby(new_options) {
    return new Promise((resolve, reject) => {
        socket.emit("leave_lobby", {game_options:new_options}, (response) => {
            resolve(response);
        });
    });
}


export async function kickPlayerFromLobby(player_id) {
    return new Promise((resolve, reject) => {
        socket.emit("kick_player_from_lobby", {player_id:player_id}, (response) => {
            resolve(response);
        });
    });
}


export function listenForKickedFromLobby(callback) {
    socket.on("kicked_from_lobby", callback);

    return () => {
        socket.off("kicked_from_lobby", callback);
    };
}


export async function setPlayerName(name) {
    return new Promise((resolve, reject) => {
        socket.emit("set_player_name", {name}, (response) => {
            resolve(response);
        });
    });
}


export async function changeGameOptions(game_options) {
    return new Promise((resolve, reject) => {
        socket.emit("change_game_options", {game_options}, (response) => {
            resolve(response);
        });
    });
}


export async function addLobbyChatMessage(msg) {
    return new Promise((resolve, reject) => {
        socket.emit("add_lobby_chat_message", {msg}, (response) => {
            resolve(response);
        });
    });
}


export async function startGameFromLobby() {
    return new Promise((resolve, reject) => {
        socket.emit("start_game_from_lobby", {}, (response) => {
            resolve(response);
        });
    });
}


export function listenForGameStart(callback) {
    socket.on("game_started_from_lobby", callback);

    return () => {
        socket.off("game_started_from_lobby", callback);
    };
}
