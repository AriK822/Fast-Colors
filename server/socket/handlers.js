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


    // Authorize
    if (!socket.request.session.player_id){
        socket.request.session.player_id = randomUUID()
        await saveSession(socket.request.session)
    }

    // TEST DELAY ⚠️
    socket.use(async ([event, ...args], next) => {
        await new Promise(resolve => setTimeout(resolve, 500))
        next()
    })

    
    console.log(
        "SOCKET CONNECT:",
        socket.request.session.id,
        socket.request.session.player_id
    );


    socket.on("set_name", async (data, ack) => {
        if (data.name && data.name != ""){
            socket.request.session.name = data.name
        }
        else if (!socket.request.session.name){
            socket.request.session.name = `Guest${Math.floor(Math.random()*1000)}`
        }
        await saveSession(socket.request.session)

        ack();
    })


    socket.on("load_join_lobby", async (data, ack) => {
        const lobbies = await loadAllLobbies();
        ack({lobbies:lobbies});
    })


    socket.on("create_lobby", withSession(socket, async (data, ack) => {
        const player = socket.request.session

        if (player.state){
            if (player.state == "game"){
                ack({err:player.state})
                return
            }
            if (player.state == "lobby"){
                const lobby_ = await loadLobby(player.state_id)
                if (lobby_){
                    lobby_.renderer_id = player.player_id;
                    lobby_.player_name = player.name
                    socket.join(lobby_.id)
                    ack(lobby_)
                    return;
                }
            }
        }
        
        const lobby_id = randomUUID();
        player.state = "lobby"
        player.state_id = lobby_id
        if (!player.name){player.name=`Guest${Math.floor(Math.random() * 1000)}`}

        const lobby_ = {
            "id": lobby_id,
            "allowed_player_counts": game_options.allowed_player_counts,
            "selected_max_players": 4,
            "card_types": game_options.card_types,
            "owner_id": player.player_id,
            "players": [
                {"id":player.player_id, "name":player.name},
            ],
        }
        await saveLobby(lobby_id, lobby_)
        lobby_.player_name = player.name
        lobby_.renderer_id = player.player_id;
        socket.join(lobby_.id)
        ack(lobby_)
        return
    }));


    socket.on("join_lobby", async (data, ack) => {
        const player = socket.request.session

        if (player.state == "game"){
            ack({"err": "On going game", "id":player.state_id, state:player.state})
            return
        }

        if (player.state == "lobby"){
            ack({"err": "On going lobby", "id":player.state_id, state:player.state})
            return
        }

        const lobby_ = await loadLobby(data.lobby_id)
        if (!player.name){player.name=`Guest${Math.floor(Math.random() * 1000)}`}
        lobby_.players.push({id:player.player_id, name:player.name})
        saveLobby(lobby_.id, lobby_)

        player.save();
        socket.join(lobby_.id)
        ack();
        return
    })

    
});


}

export default attachIOHandlers
