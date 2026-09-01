import socket from "./socket_init"


export function listenForSessionSync(callback) {
    socket.on("sync_session", callback);

    return () => {
        socket.off("sync_session", callback);
    };
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

