import config from "../config/config.js"


const PLAYER_STATE = {};

export function setPlayerState(player_id, online=true) {
    if (online){PLAYER_STATE[player_id] = true;}
    else {delete PLAYER_STATE[player_id];}
}

export function getPlayerState(player_id) {
    return PLAYER_STATE[player_id] ? "online" : "offline";
}



const PLAYER_NAMES = {};

export function initPlayerName(player_id){
    if (!PLAYER_NAMES[player_id]){
        PLAYER_NAMES[player_id] = `Guest-${Math.floor(Math.random()*1000)}`;
    }
}

export function setPlayerName(player_id, name){
    PLAYER_NAMES[player_id] = name;
}

export function getPlayerName(player_id){
    return PLAYER_NAMES[player_id];
}
