import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import mainUnoImage from "../assets/main-uno-image.png";
import "./css/Home.css";

import Skeleton from "react-loading-skeleton";

import * as SocketAPI from "../api/socket_handler"
import { useApp, AppProvider } from "../helpers/context/app_provider"
import { useNotification } from "../helpers/context/notification";



function Home() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { session, setSession } = useApp();

  const [nameInputValue, setNameInputValue] = useState(session.player_name);
  const isNameInputInitLoad = useRef(true);
  const [nameInputLoading, setNameInputLoading] = useState(false);

  async function createLobbyBtn(){
    navigate("/lobby");
  }
  async function joinLobbyBtn(){
    navigate("/joinlobby");
  }

    
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
          <button 
            className="btn btn-create" 
            onClick={createLobbyBtn} 
          >
            Create Lobby
          </button>
          <button 
            className="btn btn-create" 
            onClick={joinLobbyBtn} 
          >
            Join Lobby
          </button>
        </div>
      </div>
      
      <div className="right-section">
        <img src={mainUnoImage} alt="UNO Cards" className="hero-image" />
      </div>
      
    </div>
  );
}


export default Home;
