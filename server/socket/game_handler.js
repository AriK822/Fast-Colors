import * as GameHandler from "../game/games.js"
import * as PlayerstateHandler from "../game/player_states.js"



function hookSocket(io, socket){




async function broadCastHiddenGame(active_game){
    active_game.players.forEach(async (p_info) => {
        const this_game = GameHandler.hiddenGameForClient(p_info.id);

        const receiver_sockets = await io.in(`player-${p_info.id}`).fetchSockets();

        for (const receiver_socket of receiver_sockets) {
            receiver_socket.emit("sync_game", this_game);
        }
    })
}



socket.on("load_game", async (data, ack) => {
    const active_game = GameHandler.Player_To_Game[socket.request.session.player_id];
    if (!active_game){
        ack({
            "error":true,
            "msg": "No game found.",
            "redirect": "/",
        })
        return;
    }

    ack({
        game: GameHandler.hiddenGameForClient(socket.request.session.player_id),
    })
    socket.join(active_game.id)
    
    return
})


socket.on("send_game_chat_msg", async (data, ack) => {
    const active_game = GameHandler.Player_To_Game[socket.request.session.player_id];
    if (!active_game){
        ack({
            "error":true,
            "msg": "No game found",
            "redirect": "/",
        })
        return;
    }

    if (!String(data?.msg ?? "").trim()){
        ack({
            "error":true,
            "msg": "No message provided",
            "redirect": "/",
        })
        return;
    }

    active_game.chat.push(
        `${PlayerstateHandler.getPlayerName(socket.request.session.player_id)}: `
        + data.msg);

    ack({
        chat: active_game.chat,
    })

    socket.to(active_game.id).emit("sync_game_property", {property:"chat", value:active_game.chat})

    return
})


socket.on("leave_active_game", async (data, ack) => {
    const active_game = GameHandler.Player_To_Game[socket.request.session.player_id];
    if (!active_game){
        ack({
            "error":true,
            "msg": "No game found",
            "redirect": "/",
        })
        return;
    }

    GameHandler.leavePlayerFromGame(socket.request.session.player_id);

    broadCastHiddenGame();
    socket.leave(active_game.id);

    return
})



}


export default hookSocket
