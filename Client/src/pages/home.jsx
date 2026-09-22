import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import * as SocketAPI from "../api/socket_handler"
import { useApp, AppProvider } from "../utils/context/app_provider"
import { useNotification } from "../utils/context/notification";

import mainUnoImage from "../assets/main-uno-image.png";
import Skeleton from "react-loading-skeleton";
import SpinnerLoader from "../components/loaders/inside_spinner1"


function Home() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { session, setSession } = useApp();

  const [nameInputValue, setNameInputValue] = useState(session.player_name);
  const isNameInputInitLoad = useRef(true);
  const [nameInputLoading, setNameInputLoading] = useState(false);
  const [leaveGameLoading, setLeaveGameLoading] = useState(false);
  const [leaveLobbyLoading, setLeaveLobbyLoading] = useState(false);


  useEffect(() => {
    if (isNameInputInitLoad.current){
        isNameInputInitLoad.current = false;
        return;
    }

    const timeout = setTimeout(async () => {
      setNameInputLoading(true);
      const result = await SocketAPI.setPlayerName(nameInputValue);
      setNameInputLoading(false);

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


  async function leaveGameBtn() {
    setLeaveGameLoading(true);
    const result = await SocketAPI.leaveGame();
    setLeaveGameLoading(false);

    showNotification({
        text: result.msg,
        type: result.error ? "error" : "success",
    });

    if (!result.error){
      setSession({
          ...session,
          active_position: null,
      });
    }
  }

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

    if (!result.error){
      setSession({
          ...session,
          active_position: null,
      });
    }
  }


  return (
    <div className="game-container">

      <div className="left-section">
        <h1 className="title">Fast Colors</h1>
        <p className="subtitle">open-source multiplayer UNO</p>

        <div className="input-group">
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

        </div>

        <div className="button-group">
          {!session.active_position && <>
          <button 
            className="btn btn-create" 
            onClick={() => navigate("/lobby")} 
          >
            Create Lobby
          </button>
          <button 
            className="btn btn-create" 
            onClick={() => navigate("/joinlobby")} 
          >
            Join Lobby
          </button>
          </>}

          {session.active_position == "lobby" && <>
          <button 
            className="btn btn-create" 
            onClick={() => navigate("/lobby")} 
          >
            Continue To Lobby
          </button>
          <button 
            className="btn btn-create" 
            onClick={leaveLobbyBtn} 
          >
            {leaveLobbyLoading ? <SpinnerLoader /> : "Leave Lobby"}
          </button>
          </>}

          {session.active_position == "game" && <>
          <button 
            className="btn btn-create" 
            onClick={() => navigate("/game")} 
          >
            Continue To Game
          </button>
          <button 
            className="btn btn-create" 
            onClick={leaveGameBtn} 
          >
            {leaveGameLoading ? <SpinnerLoader /> : "Leave Game"}
          </button>
          </>}

        </div>
      </div>
      
      <div className="right-section">
        <img src={mainUnoImage} alt="UNO Cards" className="hero-image" />
      </div>
      
    </div>
  );
}


export default Home;
