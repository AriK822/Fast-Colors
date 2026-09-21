import config from "../config/config.js"


const PLAYER_STATE = new Map();

export function setPlayerState(player_id, online=true) {
    if (online){PLAYER_STATE.set(player_id, true);}
    else {PLAYER_STATE.delete(player_id);}
}

export function getPlayerState(player_id) {
    return PLAYER_STATE.get(player_id) ? "online" : "offline";
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
