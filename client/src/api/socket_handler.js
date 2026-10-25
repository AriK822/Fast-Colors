import socket from "./socket_init"
export * from "./socket_lobbies"
export * from "./socket_games"


export async function syncSession() {
    return new Promise((resolve, reject) => {
        socket.emit("sync_session", null, (response) => {
            resolve(response);
        });
    });
}


