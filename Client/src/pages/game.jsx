import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import * as SocketAPI from "../api/socket_handler"
import { useNotification } from "../helpers/context/notification";
import { useApp } from "../helpers/context/app_provider"

import SpinnerLoader from "../helpers/loaders/inside_spinner1"
import Skeleton from "react-loading-skeleton";


function Game(){

  return (
    <div className="card">
        <p>The game</p>
    </div>
  )
}


export default Game
