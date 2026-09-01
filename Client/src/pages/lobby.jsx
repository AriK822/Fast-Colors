import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../helpers/base.css";

import * as SocketAPI from "../api/socket_handler"
import { useNotification } from "../helpers/context/notification";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";


function Lobby() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [lobby, setLobby] = useState(null);


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
                navigate(result.redirect);
                return;
            }

            setLobby(result.lobby);
            console.log(result)
        }

        loadLobby();

    }, []);


  async function createLobbyBtn(){
    navigate("/lobby");
  }
  async function joinLobbyBtn(){
    navigate("/joinlobby");
  }

  if (!lobby){
    return (
      <Skeleton />
    )
  }

  return (
    <div className="lobby-container">
        <p>{lobby.id}</p>
        <p>{lobby.owner}</p>


        <div>
            <strong>Players:</strong>
            {Object.entries(lobby.players).map(([id, desc]) => (
            <span key={id}>{desc.name}, {desc.status}</span>
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
