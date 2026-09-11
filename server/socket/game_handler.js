import * as GameHandler from "../game/games.js"
import * as PlayerstateHandler from "../game/player_states.js"



function hookSocket(io, socket){



// Utils
async function broadCastHiddenGame(active_game, property = null) {
    for (const p_info of active_game.players) {
        if (p_info.game_status === "left") continue;

        const this_game = GameHandler.hiddenGameForClient(p_info.id);
        const receiver_sockets =
            await io.in(`player-${p_info.id}`).fetchSockets();

        for (const receiver_socket of receiver_sockets) {
            if (property === null) {
                receiver_socket.emit("sync_game", this_game);
            } else {
                receiver_socket.emit("sync_game_property", {
                    property,
                    value: this_game[property]
                });
            }
        }
    }
}



// Run on connect
{

const this_game = GameHandler.Player_To_Game[socket.request.session.player_id];
if (this_game){
    broadCastHiddenGame(this_game, "players")
}

}



// Events
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
    const removed_game = GameHandler.gameCleanupAfterLeave(active_game);

    if (removed_game){
        ack({
            "msg": "Game successfully left",
            "redirect": "/",
        })

        return
    }

    ack({
        "msg": "Game successfully left",
        "redirect": "/",
    })
    broadCastHiddenGame(active_game, "players")
    socket.leave(active_game.id);

    return
})



socket.on("disconnecting", () => {
    const active_game = GameHandler.Player_To_Game[socket.request.session.player_id]
    if (active_game){
        broadCastHiddenGame(active_game, "players")
    }
});



}


export default hookSocket
