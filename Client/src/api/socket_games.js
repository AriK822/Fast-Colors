import socket from "./socket_init"



export async function loadGame() {
    return new Promise((resolve, reject) => {
        socket.emit("load_game", null, (response) => {
            resolve(response);
        });
    });
}


export async function sendGameChatMessage(msg) {
    return new Promise((resolve, reject) => {
        socket.emit("send_game_chat_msg", {msg}, (response) => {
            resolve(response);
        });
    });
}


export function listenForSyncGame(callback) {
    socket.on("sync_game", callback);

    return () => {
        socket.off("sync_game", callback);
    };
}


export function listenForSyncGameProperty(callback) {
    socket.on("sync_game_property", callback);

    return () => {
        socket.off("sync_game_property", callback);
    };
}


export async function leaveGame() {
    return new Promise((resolve, reject) => {
        socket.emit("leave_active_game", null, (response) => {
            resolve(response);
        });
    });
}


export async function playCard(card_index, choice=undefined) {
    return new Promise((resolve, reject) => {
        socket.emit("play_card", {card_index, choice}, (response) => {
            resolve(response);
        });
    });
}


export async function skipMove(card_index) {
    return new Promise((resolve, reject) => {
        socket.emit("game_skip_move", null, (response) => {
            resolve(response);
        });
    });
}


export async function takeCard(card_index) {
    return new Promise((resolve, reject) => {
        socket.emit("game_take_card", null, (response) => {
            resolve(response);
        });
    });
}


