import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import * as SocketAPI from "../api/socket_handler"
import { useNotification } from "../helpers/context/notification";

import SpinnerLoader from "../helpers/loaders/inside_spinner1"
import Skeleton from "react-loading-skeleton";


function JoinLobby() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [lobbies, setLobbies] = useState(null);

  const [refresh_lobbies_loading, setRefreshLobbiesLoading] = useState(false);


    useEffect(() => {
        loadJoinLobby();
    }, []);


  async function loadJoinLobby() {
      setRefreshLobbiesLoading(true);
      const result = await SocketAPI.loadJoinLobby();
      setRefreshLobbiesLoading(false);

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

  SocketAPI.listenForJoinLobbyListUpdate((new_list) => setLobbies(new_list));


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
    <>
    <button 
      onClick={loadJoinLobby}
      disabled={refresh_lobbies_loading}  
    >
      {refresh_lobbies_loading ? <SpinnerLoader /> : "Refresh"}
    </button>

    <div className="join-lobby-container">
      {Object.entries(lobbies).map(([lobbyId, lobby]) => (
        <div 
          key={lobby.id} 
          className="flex gap-1 card pointer" 
          onClick={() => joinLobbyFunc(lobby.id)}
        >
          <p>ID: {lobby.id}</p>
          <p>Owner: {lobby.owner}</p>
          <p>Player count: {lobby.players}</p>
          <p>Bots: {lobby.bots}</p>
          <div className="flex">
            <p>Game settings: </p>
            {lobby.selected_card_objects.map((val, i) => (
              <p key={i}>{val}</p>
            ))
          }
          </div>
        </div>
      ))
      }
    </div>

    </>
  );
}


export default JoinLobby;
