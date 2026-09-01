import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import * as SocketAPI from "../api/socket_handler"
import { useNotification } from "../helpers/context/notification";

import Skeleton from "react-loading-skeleton";


function JoinLobby() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [lobbies, setLobbies] = useState(null);


    useEffect(() => {

        async function loadJoinLobby() {
            const result = await SocketAPI.loadJoinLobby();

            if (result.msg) {
                showNotification({
                    text: result.msg,
                    type: result.error ? "error" : "success"
                });
            }

            if (result.redirect) {
                navigate(result.redirect, {replace:true});
                return;
            }

            setLobbies(result.lobbies);
            console.log(result)
        }

        loadJoinLobby();

    }, []);


  async function joinLobbyFunc(lobby_id) {
    const result = await SocketAPI.joinLobby(lobby_id)

    if (result.msg) {
        showNotification({
            text: result.msg,
            type: result.error ? "error" : "success"
        });
    }

    if (result.redirect) {
        navigate(result.redirect, {replace:true});
        return;
    }
  }


  if (!lobbies){
    return (
      <Skeleton />
    )
  }

  return (
    <div className="join-lobby-container">
      {Object.entries(lobbies).map(([lobbyId, lobby]) => (
        <div key={lobby.id} className="flex gap-3 card pointer" onClick={() => joinLobbyFunc(lobby.id)}>
          <p>ID: {lobby.id}</p>
          <p>Owner: {lobby.players[lobby.owner].name}</p>
          <p>Player count: {Object.entries(lobby.players).length}</p>
          <p>Max players: {lobby.game_options.selected_player_count}</p>
          <p>Game settings: {lobby.game_options.selected_card_types}</p>
        </div>
      ))
      }
    </div>
  );
}


export default JoinLobby;
