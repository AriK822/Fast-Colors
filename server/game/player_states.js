const PLAYER_STATE = new Map();

export function setPlayerState(player_id, online=true) {
    if (online){PLAYER_STATE.set(player_id, true);}
    else {PLAYER_STATE.delete(player_id);}
}

export function getPlayerState(player_id) {
    return PLAYER_STATE.get(player_id) ? "online" : "offline";
}



const PLAYER_TO_TIMEOUT = new Map();

export function setPlayerTimeout(player_id, callback, timeout = 30000) {
    clearPlayerTimeout(player_id);

    const start_time = Date.now();

    const this_timeout = setTimeout(() => {
        PLAYER_TO_TIMEOUT.delete(player_id);
        callback();
    }, timeout);

    PLAYER_TO_TIMEOUT.set(player_id, {
        timeout: this_timeout,
        start_time,
        duration: timeout
    });
}

export function clearPlayerTimeout(player_id) {
    const player_timeout = PLAYER_TO_TIMEOUT.get(player_id);

    if (player_timeout) {
        clearTimeout(player_timeout.timeout);
        PLAYER_TO_TIMEOUT.delete(player_id);
    }
}

export function getPlayerTimeout(player_id) {
    const player_timeout = PLAYER_TO_TIMEOUT.get(player_id);

    if (!player_timeout) {
        return null;
    }

    return player_timeout.start_time + player_timeout.duration;
}




const PLAYER_NAMES = new Map();

export function initPlayerName(player_id){
    if (!PLAYER_NAMES.get(player_id)){
        PLAYER_NAMES.set(player_id, `Guest-${Math.floor(Math.random()*1000)}`);
    }
}

export function setPlayerName(player_id, name){
    PLAYER_NAMES.set(player_id, name);
}

export function getPlayerName(player_id){
    return PLAYER_NAMES.get(player_id);
}
