import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import * as SocketAPI from "../api/socket_handler"
import { useNotification } from "../helpers/context/notification";
import { useApp } from "../helpers/context/app_provider"

import SpinnerLoader from "../helpers/loaders/inside_spinner1"
import Skeleton from "react-loading-skeleton";
import { useCountdown } from "../helpers/utils/timer_hooks";


function Lobby() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { session, setSession } = useApp();

  const [lobby, setLobby] = useState(null);

  const [leave_lobby_loading, setLeaveLobbyLoading] = useState(false);
  const [kick_player_loading, setKickPlayerLoading] = useState(null);
  const [nameInputValue, setNameInputValue] = useState(session.player_name);
  const isNameInputInitLoad = useRef(true);
  const [nameInputLoading, setNameInputLoading] = useState(false);


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

  function KickTimer({target_time}){
    const time_left = useCountdown(target_time);
    return <p>Kicking in {time_left}</p>
  }


  useEffect(() => {
    if (isNameInputInitLoad.current){
        isNameInputInitLoad.current = false;
        return;
    }

    const timeout = setTimeout(async () => {
        setNameInputLoading(true)
        const result = await SocketAPI.setPlayerName(nameInputValue);
        setNameInputLoading(false)

        showNotification({
            text: result.msg,
            type: result.error ? "error" : "success"
        });

        if (!result.error){
            setSession({
                ...session,
                player_name: nameInputValue,
            });
        }

    }, 700);

    return () => {
        clearTimeout(timeout);
    };
  }, [nameInputValue]);


  if (!lobby){
    return (
      <Skeleton />
    )
  }

  return (
    <div className="card">

        <input 
            className="name-input" 
            placeholder="Enter your name" 
            onChange={(e) => setNameInputValue(e.target.value)} 
            value={nameInputValue}
        />

        <p>
        You'll appear as{" "}
        {nameInputLoading
            ? <Skeleton inline width={90} />
            : session.player_name
        }
        </p>

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

                    {desc.disconnect_expires_at ? 
                    <KickTimer target_time={desc.disconnect_expires_at} />
                    : <></>}

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
