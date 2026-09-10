import {  game_options,  validateGameOptions, startGameValidation  } from "../game/game_options.js";
import * as LobbyHandler from "../game/lobbies.js"
import * as GameHandler from "../game/games.js"
import * as PlayerstateHandler from "../game/player_states.js"





function hookSocket(io, socket){



socket.on("load_lobby", async (data, ack) => {
    const active_game = GameHandler.Player_To_Game[socket.request.session.player_id];
    if (active_game){
        ack({
            "error":true,
            "msg": "An ongoing game is still in progress.",
            "redirect": "/game",
        })
        return;
    }

    const active_lobby = LobbyHandler.Player_To_Lobby[socket.request.session.player_id];
    if (active_lobby){
        socket.join(active_lobby.id);
        ack({
            "msg": "Loaded the connected lobby. IF you want to create a new lobby, leave this lobby first.",
            "lobby": active_lobby,
        })
        return;
    }

    const this_lobby = LobbyHandler.createNewLobby(socket.request.session.player_id);

    socket.join(this_lobby.id);
    ack({
        "msg": "Successfully created a new lobby.",
        "lobby":this_lobby,
    });
    return
})


socket.on("load_join_lobby", async (data, ack) => {
    const active_game = GameHandler.Player_To_Game[socket.request.session.player_id];
    if (active_game){
        ack({
            "error":true,
            "msg": "An ongoing game is still in progress.",
            "redirect": "/game",
        })
        return;
    }

    const this_lobby = LobbyHandler.Player_To_Lobby[socket.request.session.player_id];
    if (this_lobby){
        ack({
            "error":true,
            "msg": "Already joined a lobby.",
            "redirect": "/lobby",
        })
        return;
    }

    ack({
        "lobbies": LobbyHandler.makeClientJoinLobbyList(),
    });
    return
})


socket.on("join_lobby", async (data, ack) => {
    const active_game = GameHandler.Player_To_Game[socket.request.session.player_id];
    if (active_game){
        ack({
            "error":true,
            "msg": "An ongoing game is still in progress.",
            "redirect": "/game",
        })
        return;
    }

    const previous_joined_lobby = LobbyHandler.Player_To_Lobby[socket.request.session.player_id];
    if (previous_joined_lobby){
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
    );

    ack({
        "msg": "Successfully joined the lobby.",
        "redirect": "/lobby",
    });
    socket.to(data.lobby_id).emit("sync_lobby", LobbyHandler.LOBBIES[data.lobby_id])
    return
})


socket.on("change_game_options", async (data, ack) => {
    const this_lobby = LobbyHandler.Player_To_Lobby[socket.request.session.player_id];

    if (!this_lobby){
        ack({
            "error":true,
            "msg": "Lobby doesnt exist",
        })
        return;
    }

    if (this_lobby.owner != socket.request.session.player_id){
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

    this_lobby.game_options = new_options;
    this_lobby.game_options.card_objects = game_options.card_objects
    
    socket.to(this_lobby.id).emit("sync_lobby", this_lobby)

    ack({
        "msg": "Successfully updated the settings",
    });

    return
})


socket.on("leave_lobby", async (data, ack) => {
    const active_lobby = LobbyHandler.Player_To_Lobby[socket.request.session.player_id];
    if (!active_lobby){
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

    socket.to(active_lobby.id).emit("sync_lobby", active_lobby)
    socket.leave(active_lobby.id)

    return
})


socket.on("kick_player_from_lobby", async (data, ack) => {
    const this_lobby = LobbyHandler.Player_To_Lobby[socket.request.session.player_id];
    if (!this_lobby){
        ack({
            "error":true,
            "msg": "No active lobby.",
        })
        return;
    }

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

    const this_lobby = LobbyHandler.Player_To_Lobby[socket.request.session.player_id];
    if (this_lobby){
        io.to(this_lobby.id).emit("sync_lobby", this_lobby)
    }

    ack({
        "msg": "name updated successfully",
    })
    return
})


socket.on("start_game_from_lobby", async (data, ack) => {
    const this_lobby = LobbyHandler.Player_To_Lobby[socket.request.session.player_id];
    if (!this_lobby){
        ack({
            "error": true,
            "msg": "No lobby assigned to this player",
        })
        return
    }

    if (this_lobby.owner != socket.request.session.player_id){
        ack({
            "error": true,
            "msg": "Only the lobby owner is allowed to start game",
        })
        return
    }

    const [success, msg] = startGameValidation(this_lobby);
    if (!success){
        ack({
            "error": true,
            "msg": msg,
        })
        return            
    }

    ack({
        "msg": "Starting game...",
    })

    LobbyHandler.deleteLobby(this_lobby);

    // Create the game object from lobby

    io.to(this_lobby.id).emit("game_started_from_lobby")

    return
})


socket.on("add_lobby_chat_message", async (data, ack) => {
    const this_lobby = LobbyHandler.Player_To_Lobby[socket.request.session.player_id];
    if (!this_lobby){
        ack({
            "error":true,
            "msg": "No active lobby.",
        })
        return;
    }

    if (String(data.msg).trim() == ""){
        ack({
            "error":true,
            "msg": "No message provided.",
        })
        return;            
    }

    this_lobby.chat.push(["player-msg", 
        `${PlayerstateHandler.getPlayerName(socket.request.session.player_id)}: ` +
        `${data.msg}`
    ])

    ack({
        "msg": "msg added.",
    })

    io.to(this_lobby.id).emit("sync_lobby", this_lobby)
})



}


export default hookSocket
