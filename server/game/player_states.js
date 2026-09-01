export const PLAYER_STATE = new Map();

export function setPlayerState(player_id, state) {
    PLAYER_STATE.set(player_id, state);
}

export function getPlayerState(player_id) {
    return PLAYER_STATE.get(player_id) ?? "offline";
}