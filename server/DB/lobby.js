import redis from "./redis_connection.js"


export async function loadLobby(id) {
    return JSON.parse(await redis.hGet("lobbies", id))
}

export async function saveLobby(id, lobby){
    await redis.hSet("lobbies", id, JSON.stringify(lobby))
}

export async function loadAllLobbies(){
    const lobbies = await redis.hGetAll("lobbies");
    const lobbies_ = []
    if (!lobbies){return []}

    Object.entries(lobbies).forEach((i) => {
        const lobby = JSON.parse(i[1]);
        const id = i[0];

        lobbies_.push({
            id:id,
            online_players: lobby.players.length,
            max_players: lobby.selected_max_players,
        })
    });

    return lobbies_;
}
