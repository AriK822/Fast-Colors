import redis from "./redis_connection.js"


export async function loadPlayerData(id){
    const data = await redis.hGet("player_data", String(id));
    return data ? JSON.parse(data) : {}
}


export async function  savePlayerData(id, data) {
    await redis.hSet("player_data", String(id), JSON.stringify(data))
}


async function withPlayer(id, fn) {
    const d = await loadPlayerData(id);

    try {
        return await fn(d);
    } finally {
        await savePlayerData(id, d);
    }
}

export default withPlayer
