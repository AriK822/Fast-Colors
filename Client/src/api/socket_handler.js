import socket from "./socket_init"
export * from "./socket_lobbies"


export async function syncSession() {
    return new Promise((resolve, reject) => {
        socket.emit("sync_session", null, (response) => {
            resolve(response);
        });
    });
}


