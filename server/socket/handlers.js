import { randomUUID } from "node:crypto";
import * as LobbyHandler from "../game/lobbies.js"
import * as PlayerstateHandler from "../game/player_states.js"

import LobbySocketHook from "./lobby_handler.js"
import GameSocketHook from "./game_handler.js"



function saveSession(session) {
    return new Promise((resolve, reject) => {
        session.save((err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}


// function withSession(socket, handler) {
//     return async (...args) => {
//         try {
//             const result = await handler(...args);
//             await saveSession(socket.request.session);
//             return result;
//         } catch (err) {
//             throw err;
//         }
//     };
// }



function attachIOHandlers(io){

LobbyHandler.hookIO(io);



io.on("connection", async (socket) => {   
    // TEST DELAY ⚠️
    socket.use(async ([event, ...args], next) => {
        await new Promise(resolve => setTimeout(resolve, 500))
        next()
    })

    {

    if (!socket.request.session.player_id){
        socket.request.session.player_id = randomUUID()
        await saveSession(socket.request.session)
    }

    PlayerstateHandler.initPlayerName(socket.request.session.player_id);

    socket.join(`player-${socket.request.session.player_id}`)

    PlayerstateHandler.setPlayerState(socket.request.session.player_id, true)
    PlayerstateHandler.clearPlayerTimeout(socket.request.session.player_id);

    const this_lobby = LobbyHandler.Player_To_Lobby[socket.request.session.player_id];
    if (this_lobby){
        socket.to(this_lobby.id).emit("sync_lobby", this_lobby)
    }

    }


    socket.on("sync_session", async (data, ack) => {
        ack({
            player_id: socket.request.session.player_id,
            player_name: PlayerstateHandler.getPlayerName(socket.request.session.player_id),
        });
    });


    // --------   HOOKS   ---------
    LobbySocketHook(io, socket);
    GameSocketHook(io, socket);


    socket.on("disconnecting", () => {

        PlayerstateHandler.setPlayerState(socket.request.session.player_id, false)

        // update lobbies
        const active_lobby = LobbyHandler.lobbyCleanup(socket.request.session.player_id);
        if (active_lobby){
            PlayerstateHandler.setPlayerTimeout(socket.request.session.player_id, () => {
                LobbyHandler.leaveLobby(socket.request.session.player_id)
                io.to(active_lobby.id).emit("sync_lobby", active_lobby)
            })

            socket.to(active_lobby.id).emit("sync_lobby", active_lobby)
        }

    });

    
});


}



export default attachIOHandlers
