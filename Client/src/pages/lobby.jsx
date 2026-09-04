import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import * as SocketAPI from "../api/socket_handler"
import { useNotification } from "../helpers/context/notification";
import { useApp } from "../helpers/context/app_provider"

import SpinnerLoader from "../helpers/loaders/inside_spinner1"
import Skeleton from "react-loading-skeleton";


function Lobby() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { session } = useApp();

  const [lobby, setLobby] = useState(null);

  const [leave_lobby_loading, setLeaveLobbyLoading] = useState(false);
  const [kick_player_loading, setKickPlayerLoading] = useState(null);


    useEffect(() => {

        async function loadLobby() {
            const result = await SocketAPI.loadLobby();

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

            setLobby(result.lobby);
            console.log(result)
        }

        loadLobby();

    }, []);

  
  SocketAPI.listenForLobbySync((new_lobby) => {
    setLobby(new_lobby); 
    setKickPlayerLoading(null);
    console.log(new_lobby);
  })

  SocketAPI.listenForKickedFromLobby(() => {
    showNotification({
        text:"Sorry, you were kicked from the lobby.",
        type: "warning",
    })
    navigate("/joinlobby");
  })


  async function leaveLobbyBtn() {
    setLeaveLobbyLoading(true);
    const result = await SocketAPI.leaveLobby();
    setLeaveLobbyLoading(false);

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


  async function kickPlayer(player_id) {
    setKickPlayerLoading(player_id);
    const result = await SocketAPI.kickPlayerFromLobby(player_id);
    setKickPlayerLoading(null);

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


  if (!lobby){
    return (
      <Skeleton />
    )
  }

  return (
    <div className="card">

        <button onClick={leaveLobbyBtn}>
            {leave_lobby_loading ? <SpinnerLoader /> : "Leave Lobby"}
        </button>


        <p>Lobby id: {lobby.id}</p>
        <p>Owner id: {lobby.owner}</p>


        <div>
            <strong>Players:</strong>
            {Object.entries(lobby.players).map(([id, desc]) => (
                <div key={id} className="flex gap-3">
                    <p>Name: {desc.name}</p>
                    <p>Status: {desc.status}</p>
                    {session.player_id == lobby.owner && id != lobby.owner ? (
                        <button 
                        onClick={() => kickPlayer(id)}
                        disabled={kick_player_loading!=null}
                        >
                            {kick_player_loading == id ? <SpinnerLoader /> : "Kick"}
                        </button>
                    ) : <></>}
                    {id == lobby.owner ? <p>👑</p> : <></>}
                </div>
            ))}
        </div>


        <div>
            <strong>Card Types:</strong>
            {Object.entries(lobby.game_options.card_types).map(([key, value]) => (
            <span key={key}>{value}</span>
            ))}
        </div>

        <div>
            <strong>Player Counts:</strong>
            {lobby.game_options.allowed_player_counts.map((value) => (
            <span key={value}>{value}</span>
            ))}
        </div>

    </div>
  );
}


export default Lobby;
