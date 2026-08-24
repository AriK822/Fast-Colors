import socket from "./socket_init"


export function setName(userName) {
    return new Promise((resolve, reject) => {
        socket.emit("set_name", {name:userName}, (response) => {
            resolve(response);
        });
    });
}

export function loadCreateLobby() {
    return new Promise((resolve, reject) => {
        socket.emit("create_lobby", {}, (response) => {
            resolve(response);
        });
    });
}

export function loadJoinLobby() {
    return new Promise((resolve, reject) => {
        socket.emit("load_join_lobby", {}, (response) => {
            resolve(response);
        });
    });
}

export function joinLobby(lobby_id) {
    return new Promise((resolve, reject) => {
        socket.emit("join_lobby", {lobby_id:lobby_id}, (response) => {
            resolve(response);
        });
    });
}
