import { randomUUID } from "node:crypto";
import { loadLobby, saveLobby, loadAllLobbies } from "../DB/lobby.js";
import { game_options } from "../game/game_options.js";
import withPlayer from "../DB/player_data.js"



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


function withSession(socket, handler) {
    return async (...args) => {
        try {
            const result = await handler(...args);
            await saveSession(socket.request.session);
            return result;
        } catch (err) {
            throw err;
        }
    };
}



function attachIOHandlers(io){


io.on("connection", async (socket) => {   
    // TEST DELAY ⚠️
    socket.use(async ([event, ...args], next) => {
        await new Promise(resolve => setTimeout(resolve, 500))
        next()
    })


    // // Authorize
    // if (!socket.request.session.player_id){
    //     socket.request.session.player_id = randomUUID()
    //     await saveSession(socket.request.session)
    // }


    // socket.on("join_lobby", async (data, ack) => {
    //     socket.request.session
    //     ack();
    //     return
    // })



    // socket.on("create_lobby", withSession(socket, async (data, ack) => {
    //     const player = socket.request.session
    //     socket.join(lobby_.id)
    //     ack(lobby_)
    //     return
    // }));

    
});


}

export default attachIOHandlers
