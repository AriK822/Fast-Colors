import socket from "./socket_init"


export async function syncSession() {
    return new Promise((resolve, reject) => {
        socket.emit("sync_session", null, (response) => {
            resolve(response);
        });
    });
}



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

