export const PLAYER_STATE = new Map();

export function setPlayerState(player_id, online=true) {
    if (online){PLAYER_STATE.set(player_id, true);}
    else {PLAYER_STATE.delete(player_id);}
}

export function getPlayerState(player_id) {
    return PLAYER_STATE.get(player_id) ? "online" : "offline";
}


export const OFFLINE_PLAYER_TIMEOUTS = new Map();

export function setPlayerTimeout(player_id, callback, timeout=30000){
    const this_timeout = setTimeout(callback, timeout);
    OFFLINE_PLAYER_TIMEOUTS.set(player_id, this_timeout)
}

export function clearPlayerTimeout(player_id){
    const this_timeout = OFFLINE_PLAYER_TIMEOUTS.get(player_id);
    if (this_timeout){
        clearTimeout(this_timeout)
    }
}
