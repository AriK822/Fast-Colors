import socket from "./socket_init"



export async function loadGame() {
    return new Promise((resolve, reject) => {
        socket.emit("load_game", null, (response) => {
            resolve(response);
        });
    });
}

