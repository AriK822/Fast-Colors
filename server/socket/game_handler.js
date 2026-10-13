import * as GameHandler from "../game/games.js"
import * as PlayerstateHandler from "../game/player_states.js"
import * as Engine from "../game/engine.js"



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

async function gameEndedKick(active_game) {
    io.in(active_game.id).emit("game_ended_kick");
    io.in(active_game.id).socketsLeave(active_game.id);
}

const EngineServices = {
    broadCastHiddenGame, 
    deleteGame:GameHandler.deleteGame,
    gameEndedKick,
};



// Run on connect
{

const this_game = GameHandler.Player_To_Game[socket.request.session.player_id];
if (this_game){
    GameHandler.handlePlayerConnection(this_game);
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

    socket.join(active_game.id)

    if (active_game.state == Engine.GameStateModes.INITIALIZING ||
        active_game.state == Engine.GameStateModes.PAUSED
    ){
        active_game.state = Engine.GameStateModes.ONGOING;
        Engine.mainGameCycle(
            active_game,
            Engine.GameCycleReasonMode.START_CYCLE,
            {},
            EngineServices,
        )
    }

    ack({
        game: GameHandler.hiddenGameForClient(socket.request.session.player_id),
    })
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

    active_game.chat.push([
        "player",
        `${PlayerstateHandler.getPlayerName(socket.request.session.player_id)}`,
        data.msg,
    ]);

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
    active_game.chat.push(["server-log", `${
        PlayerstateHandler.getPlayerName(socket.request.session.player_id)
    } left the game`])
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
    broadCastHiddenGame(active_game)
    socket.leave(active_game.id);

    return
})


socket.on("play_card", async (data, ack) => {
    const active_game = GameHandler.Player_To_Game[socket.request.session.player_id];
    if (!active_game){
        ack({
            "error":true,
            "msg": "No game found",
            "redirect": "/",
        })
        return;
    }
    
    if (!(typeof data.card_index == "number")){
        ack({
            "error":true,
            "msg": "Invalid card index",
        })
        return;
    }

    const [success, msg] = Engine.mainGameCycle(
        active_game,
        Engine.GameCycleReasonMode.PLACE_CARD,
        {
            player_id:socket.request.session.player_id,
            card_index:data.card_index,
            choice:data.choice,
        },
        EngineServices,
    )

    ack({
        "error":!success,
        "msg": msg,
    })
})


socket.on("game_skip_move", async (data, ack) => {
    const active_game = GameHandler.Player_To_Game[socket.request.session.player_id];
    if (!active_game){
        ack({
            "error":true,
            "msg": "No game found",
            "redirect": "/",
        })
        return;
    }

    const [success, msg] = Engine.mainGameCycle(
        active_game,
        Engine.GameCycleReasonMode.SKIP_TURN,
        {player_id:socket.request.session.player_id},
        EngineServices,
    )

    ack({
        "error":!success,
        "msg": msg,
    })
})


socket.on("game_take_card", async (data, ack) => {
    const active_game = GameHandler.Player_To_Game[socket.request.session.player_id];
    if (!active_game){
        ack({
            "error":true,
            "msg": "No game found",
            "redirect": "/",
        })
        return;
    }

    const [success, msg] = Engine.mainGameCycle(
        active_game,
        Engine.GameCycleReasonMode.TAKE_CARD,
        {player_id:socket.request.session.player_id},
        EngineServices,
    )

    ack({
        "error":!success,
        "msg": msg,
    })
})



socket.on("disconnecting", () => {
    const active_game = GameHandler.Player_To_Game[socket.request.session.player_id]
    if (active_game){
        GameHandler.handlePlayerDisconnection(active_game);
        broadCastHiddenGame(active_game, "players")
    }
});



}


export default hookSocket
