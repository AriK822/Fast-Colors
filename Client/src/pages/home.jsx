import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import * as SocketAPI from "../api/socket_handler"
import { useApp, AppProvider } from "../utils/context/app_provider"
import { useNotification } from "../utils/context/notification";

import * as ui from "../components/global"
import bgLandscape from "../assets_staging/bg1.png"
import bgMobile from "../assets_staging/bg2.png"
import mainLogo from "../assets_staging/logo1.1.png"
import paintTexture from "../assets_staging/t1.jpg"
import mainUnoImage from "../assets_staging/main-uno-image.png";
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


  // return (
  //   <div className="game-container">

  //     <div className="left-section">
  //       <h1 className="title">Fast Colors</h1>
  //       <p className="subtitle">open-source multiplayer UNO</p>

  //       <div className="input-group">
  //         <input 
  //           className="name-input" 
  //           placeholder="Enter your name" 
  //           onChange={(e) => setNameInputValue(e.target.value)} 
  //           value={nameInputValue}
  //         />

  //         <p>
  //           You'll appear as{" "}
  //           {nameInputLoading
  //             ? <Skeleton inline width={90} />
  //             : session.player_name
  //           }
  //         </p>

  //       </div>

  //       <div className="button-group">
  //         {!session.active_position && <>
  //         <button 
  //           className="btn btn-create" 
  //           onClick={() => navigate("/lobby")} 
  //         >
  //           Create Lobby
  //         </button>
  //         <button 
  //           className="btn btn-create" 
  //           onClick={() => navigate("/joinlobby")} 
  //         >
  //           Join Lobby
  //         </button>
  //         </>}

  //         {session.active_position == "lobby" && <>
  //         <button 
  //           className="btn btn-create" 
  //           onClick={() => navigate("/lobby")} 
  //         >
  //           Continue To Lobby
  //         </button>
  //         <button 
  //           className="btn btn-create" 
  //           onClick={leaveLobbyBtn} 
  //         >
  //           {leaveLobbyLoading ? <SpinnerLoader /> : "Leave Lobby"}
  //         </button>
  //         </>}

  //         {session.active_position == "game" && <>
  //         <button 
  //           className="btn btn-create" 
  //           onClick={() => navigate("/game")} 
  //         >
  //           Continue To Game
  //         </button>
  //         <button 
  //           className="btn btn-create" 
  //           onClick={leaveGameBtn} 
  //         >
  //           {leaveGameLoading ? <SpinnerLoader /> : "Leave Game"}
  //         </button>
  //         </>}

  //       </div>
  //     </div>
      
  //     <div className="right-section">
  //       <img src={mainUnoImage} alt="UNO Cards" className="hero-image" />
  //     </div>
      
  //   </div>
  // );


  return (
    <ui.FullScreen className="flex">

      <ui.SideBar 
        className="game-side-bar"
        style={{"--bg-paint-texture": `url(${paintTexture})`,}}
      >
        <h1 className="game-default-text text-3xl">
          Your name: {" "}
            {nameInputLoading
              ? <Skeleton inline width={90} />
              : session.player_name
            }
        </h1>
        <ui.Input 
          className="mt-3"
          placeholder="Your name"
          onChange={(e) => setNameInputValue(e.target.value)} 
          value={nameInputValue}
        />
        <ui.Divider />

        <ui.Button variant="sidebar">Home</ui.Button>
        <ui.Button variant="sidebar">Settings</ui.Button>

      </ui.SideBar>

      <main
        className="
          relative flex min-w-0 flex-1
          items-center justify-center
          overflow-hidden
          bg-cover bg-center
          bg-[image:var(--bg-mobile)]
          xl:bg-[image:var(--bg-desktop)]
        "
        style={{
          "--bg-mobile": `url(${bgMobile})`,
          "--bg-desktop": `url(${bgLandscape})`,
        }}
      >
        <div className="
          relative z-10
          flex flex-col
          items-center
          gap-6
          px-6
        ">
          <div className="flex flex-col items-center">
        <img
          src={mainLogo}
          alt="Fast Colors"
          className="w-100 img-shadow"
        />

        <h5 className="game-default-text text-3xl">
          <span>Think Fast! </span>
          <span className="text-[#a3ffe8]">
            Play Together.
          </span>
        </h5>
          </div>

          <div className="
            flex w-full max-w-md
            flex-col gap-3
            sm:flex-row
          ">

            {!session.active_position && <>
              <ui.Button 
                className="w-full p-3" 
                onClick={() => navigate("/lobby")} 
              >
                Create Lobby
              </ui.Button>
              <ui.Button 
                className="w-full p-3" 
                onClick={() => navigate("/joinlobby")} 
              >
                Join Lobby
              </ui.Button>
            </>}

            {session.active_position == "lobby" && <>
              <ui.Button 
                className="w-full p-3" 
                onClick={() => navigate("/lobby")} 
              >
                Continue To Lobby
              </ui.Button>
              <ui.Button 
                className="w-full p-3" 
                onClick={leaveLobbyBtn} 
              >
                {leaveLobbyLoading ? <SpinnerLoader /> : "Leave Lobby"}
              </ui.Button>
            </>}

            {session.active_position == "game" && <>
              <ui.Button 
                className="w-full p-3" 
                onClick={() => navigate("/game")} 
              >
                Continue To Game
              </ui.Button>
              <ui.Button 
                className="w-full p-3" 
                onClick={leaveGameBtn} 
              >
                {leaveGameLoading ? <SpinnerLoader /> : "Leave Game"}
              </ui.Button>
            </>}

          </div>
        </div>

      </main>

    </ui.FullScreen>
  )
}


export default Home;
