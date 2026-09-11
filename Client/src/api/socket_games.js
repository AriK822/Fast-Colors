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


