import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import * as SocketAPI from "../api/socket_handler"
import { useNotification } from "../helpers/context/notification";
import { useApp } from "../helpers/context/app_provider"

import SpinnerLoader from "../helpers/loaders/inside_spinner1"
import FullScreenLoader from "../helpers/loaders/fullscreen1";
import Skeleton from "react-loading-skeleton";


function Game(){
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { session, setSession } = useApp();

  const [game, setGame] = useState(null);



  async function loadGame(show_notifications=true) {
      setGame(null);
      const result = await SocketAPI.loadGame();

      if (show_notifications && result.msg) {
          showNotification({
            text: result.msg,
            type: result.error ? "error" : "success"
          });
      }

      if (result.redirect) {
        navigate(result.redirect, {replace:true});
        return;
      }

      setGame(result.game);
      console.log(result)
  }

  useEffect(() => {
      loadGame();
  }, []);



  if (!game){
    return <FullScreenLoader />
  }

  return (
    <div className="card">
        <p>The game</p>
    </div>
  )
}


export default Game
