import { randomUUID } from "node:crypto";
import { game_options, validateGameOptions } from "../game/game_options.js";
import * as LobbyHandler from "../game/lobbies.js"
import * as GameHandler from "../game/games.js"
import * as PlayerstateHandler from "../game/player_states.js"



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

    const lobby_id = LobbyHandler.Player_To_Lobby[socket.request.session.player_id];
    if (lobby_id){
        const active_lobby = LobbyHandler.LOBBIES[lobby_id];
        socket.to(active_lobby.id).emit("sync_lobby", active_lobby)
    }

    }


    socket.on("sync_session", async (data, ack) => {
        ack({
            player_id: socket.request.session.player_id,
            player_name: PlayerstateHandler.getPlayerName(socket.request.session.player_id),
        });
    });


    socket.on("load_lobby", async (data, ack) => {
        const game_id = GameHandler.Player_To_Game[socket.request.session.player_id];
        if (game_id){
            ack({
                "error":true,
                "msg": "An ongoing game is still in progress.",
                "redirect": "/game",
            })
            return;
        }

        const lobby_id = LobbyHandler.Player_To_Lobby[socket.request.session.player_id];
        if (lobby_id){
            socket.join(lobby_id);
            ack({
                "msg": "Loaded the connected lobby. IF you want to create a new lobby, leave this lobby first.",
                "lobby": LobbyHandler.LOBBIES[lobby_id],
            })
            return;
        }

        const this_lobby = LobbyHandler.createNewLobby(
            socket.request.session.player_id, socket.request.session.player_name
        );
        socket.join(this_lobby.id);
        ack({
            "msg": "Successfully created a new lobby.",
            "lobby":this_lobby,
        });
        return
    })


    socket.on("load_join_lobby", async (data, ack) => {
        const game_id = GameHandler.Player_To_Game[socket.request.session.player_id];
        if (game_id){
            ack({
                "error":true,
                "msg": "An ongoing game is still in progress.",
                "redirect": "/game",
            })
            return;
        }

        const lobby_id = LobbyHandler.Player_To_Lobby[socket.request.session.player_id];
        if (lobby_id){
            ack({
                "error":true,
                "msg": "Already joined a lobby.",
                "redirect": "/lobby",
            })
            return;
        }

        ack({
            "lobbies": LobbyHandler.LOBBIES,
        });
        return
    })
    
    
    socket.on("join_lobby", async (data, ack) => {
        const game_id = GameHandler.Player_To_Game[socket.request.session.player_id];
        if (game_id){
            ack({
                "error":true,
                "msg": "An ongoing game is still in progress.",
                "redirect": "/game",
            })
            return;
        }

        const previous_joined_lobby_id = LobbyHandler.Player_To_Lobby[socket.request.session.player_id];
        if (previous_joined_lobby_id){
            ack({
                "error":true,
                "msg": "Already joined a lobby.",
                "redirect": "/lobby",
            })
            return;
        }

        if (LobbyHandler.LOBBIES[data.lobby_id] == null){
            ack({
                "error":true,
                "msg": "Lobby doesnt exist",
            })
            return;
        }

        LobbyHandler.joinPlayerToLobby(
            socket.request.session.player_id, 
            data.lobby_id,
            socket.request.session.player_name,
        );

        ack({
            "msg": "Successfully joined the lobby.",
            "redirect": "/lobby",
        });
        socket.to(data.lobby_id).emit("sync_lobby", LobbyHandler.LOBBIES[data.lobby_id])
        return
    })


    socket.on("change_game_options", async (data, ack) => {
        const lobby_id = LobbyHandler.Player_To_Lobby[socket.request.session.player_id];
        if (!lobby_id){
            ack({
                "error":true,
                "msg": "Lobby doesnt exist",
            })
            return;
        }

        if (LobbyHandler.LOBBIES[lobby_id].owner != socket.request.session.player_id){
            ack({
                "error":true,
                "msg": "Access denied. Settings can be changed only by the owner of the lobby.",
            })
            return;
        }

        const new_options = data.game_options;

        if (!validateGameOptions(new_options)){
            ack({
                "error":true,
                "msg": "Lobby validation failed",
            })
            return;
        }

        const this_lobby = LobbyHandler.LOBBIES[lobby_id];
        this_lobby.game_options = new_options;
        this_lobby.game_options.card_objects = game_options.card_objects
        
        socket.to(lobby_id).emit("sync_lobby", LobbyHandler.LOBBIES[lobby_id])

        ack({
            "msg": "Successfully updated the settings",
        });

        return
    })


    socket.on("leave_lobby", async (data, ack) => {
        const lobby_id = LobbyHandler.Player_To_Lobby[socket.request.session.player_id];
        if (!lobby_id){
            ack({
                "error":true,
                "msg": "No active lobby to leave from.",
            })
            return;
        }

        LobbyHandler.leaveLobby(socket.request.session.player_id);

        ack({
            "msg": "Successfully left the lobby.",
            "redirect": "/",
        });

        const active_lobby = LobbyHandler.LOBBIES[lobby_id];
        if (active_lobby){
            socket.to(active_lobby.id).emit("sync_lobby", active_lobby)
        }
        socket.leave(lobby_id)

        return
    })


    socket.on("kick_player_from_lobby", async (data, ack) => {
        const lobby_id = LobbyHandler.Player_To_Lobby[socket.request.session.player_id];
        if (!lobby_id){
            ack({
                "error":true,
                "msg": "No active lobby.",
            })
            return;
        }

        const this_lobby = LobbyHandler.LOBBIES[lobby_id];
        if (this_lobby.owner != socket.request.session.player_id){
            ack({
                "error":true,
                "msg": "Action not allowed. You are not the lobby owner.",
            })
            return;
        }

        if (!data.player_id){
            ack({
                "error":true,
                "msg": "No id provided.",
            })
            return;
        }

        if (this_lobby.owner == data.player_id){
            ack({
                "error":true,
                "msg": "Cannot kick lobby owner.",
            })
            return;
        }

        const kicked = LobbyHandler.kickPlayer(this_lobby.id, data.player_id);

        if (!kicked){
            ack({
                "error":true,
                "msg": "Player doesnt exist",
            });
            return
        }

        ack({
            "msg": "Successfully kicked player.",
        });

        const kciked_sockets = await io.in(`player-${data.player_id}`).fetchSockets();

        for (const kicked_socket of kciked_sockets) {
            kicked_socket.leave(this_lobby.id);
            kicked_socket.emit("kicked_from_lobby");
        }

        io.to(this_lobby.id).emit("sync_lobby", this_lobby)

        return
    })


    socket.on("set_player_name", async (data, ack) => {
        if (String(data.name ?? "").trim().length < 4){
            ack({
                "error":true,
                "msg": "Name cannot be less than 4 characters",
            })
            return;
        }

        PlayerstateHandler.setPlayerName(socket.request.session.player_id, data.name)

        const lobby_id = LobbyHandler.Player_To_Lobby[socket.request.session.player_id];
        if (lobby_id){
            io.to(lobby_id).emit("sync_lobby", LobbyHandler.LOBBIES[lobby_id])
        }

        ack({
            "msg": "name updated successfully",
        })
        return
    })


    socket.on("start_game", async (data, ack) => {
        const lobby_id = LobbyHandler.Player_To_Lobby[socket.request.session.player_id];
        if (!lobby_id){
            ack({
                "error": true,
                "msg": "No lobby assigned to this player",
            })
            return
        }

        const this_lobby = LobbyHandler.LOBBIES[lobby_id];

        if (this_lobby.owner != socket.request.session.player_id){
            ack({
                "error": true,
                "msg": "Only the lobby owner is allowed to start game",
            })
            return
        }

        ack({
            "msg": "name updated successfully",
        })
        return
    })



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
