import { randomUUID } from "node:crypto";
import config from "../config/config.js";
import * as LobbyHandler from "../game/lobbies.js"
import * as PlayerstateHandler from "../game/player_states.js"
import * as GameHandler from "../game/games.js"

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




function attachIOHandlers(io){

LobbyHandler.hookIO(io);



io.on("connection", async (socket) => {

    // TEST DELAY ⚠️
    if (config.app.debug){
        socket.use(async ([event, ...args], next) => {
            await new Promise(resolve => setTimeout(resolve, 500))
            next()
        })
    }

    // ON CONNECT
    {

    if (!socket.request.session.player_id){
        socket.request.session.player_id = randomUUID()
        await saveSession(socket.request.session)
    }

    PlayerstateHandler.initPlayerName(socket.request.session.player_id);
    PlayerstateHandler.setPlayerState(socket.request.session.player_id, true)

    socket.join(`player-${socket.request.session.player_id}`)

    }


    socket.on("sync_session", async (data, ack) => {
        const player_id = socket.request.session.player_id;
        let active_position = null;
        if (LobbyHandler.Player_To_Lobby[player_id]) active_position = "lobby";
        if (GameHandler.Player_To_Game[player_id]) active_position = "game";

        ack({
            player_id,
            player_name: PlayerstateHandler.getPlayerName(player_id),
            active_position,
        });
    });



    socket.on("disconnecting", () => {
        PlayerstateHandler.setPlayerState(socket.request.session.player_id, false);
    })



    // --------   HOOKS   ---------
    LobbySocketHook(io, socket);
    GameSocketHook(io, socket);

    
});


}



export default attachIOHandlers
