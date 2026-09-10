import * as GameHandler from "../game/games.js"



function hookSocket(io, socket){



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
    return
})



}


export default hookSocket
