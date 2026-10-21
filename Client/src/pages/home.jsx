import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import * as SocketAPI from "../api/socket_handler"
import { useApp, AppProvider } from "../utils/context/app_provider"
import { useNotification } from "../utils/context/notification";

import ui from "../components/shared/_ui"
import Skeleton from "react-loading-skeleton";
import Loader from "../components/loaders/_loaders";
import bgLandscape from "../assets/images/bg1.jpg"
import bgMobile from "../assets/images/bg2.jpg"
import mainLogo from "../assets/images/home-logo.png"
import paintTexture from "../assets/images/sidebar-texture.jpg"


function Home() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { session, setSession, runSyncSession } = useApp();

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
    if (nameInputValue.trim().length < 4) return

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
    if(result.error) runSyncSession();
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
    if(result.error) runSyncSession();
  }
  


  return (
    <ui.FullScreen className="flex">

      <ui.SideBar 
        style={{"--bg-paint-texture": `url(${paintTexture})`,}}
      >
        <h1 className="ui-text text-2xl truncate">
          Play as: &nbsp;
            {nameInputLoading
              ? <Skeleton inline width={90} />
              : session.player_name
            }
        </h1>
        <ui.SideBar.Input 
          className="mt-3"
          placeholder="Your name"
          onChange={(e) => setNameInputValue(e.target.value)} 
          value={nameInputValue}
        />
        <ui.SideBar.Divider />

        <ui.SideBar.Btn>
          <ui.Logo id="home" />&nbsp;
          Home
        </ui.SideBar.Btn>
        <ui.SideBar.Btn>
          <ui.Logo id="settings" />&nbsp;
          Settings
        </ui.SideBar.Btn>

      </ui.SideBar>

      <main
        className="
          relative flex min-w-0 flex-1
          items-center justify-center
          overflow-hidden
          bg-cover bg-center
          bg-[image:var(--bg-mobile)]
          md:bg-[image:var(--bg-desktop)]
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
              className="w-100 drop-shadow-img"
            />

            <h5 className="ui-text text-3xl">
              <span>Think Fast! </span>
              <span className="text-[#9acdfc]">
                Play Together.
              </span>
            </h5>
          </div>

          <div className="
            flex w-full max-w-md
            flex-col gap-ui-md
            sm:flex-row
          ">

            {!session.active_position && <>
              <ui.Button 
                className="w-full" 
                onClick={() => navigate("/lobby")} 
              >
                <ui.Logo id="create_lobby" />&nbsp;
                Create Lobby
              </ui.Button>
              <ui.Button 
                className="w-full" 
                onClick={() => navigate("/joinlobby")} 
              >
                Join Lobby &nbsp;
                <ui.Logo id="arrow_right" className="pt-[3px]" /> 
              </ui.Button>
            </>}

            {session.active_position == "lobby" && <>
              <ui.Button 
                className="w-full" 
                onClick={() => navigate("/lobby")} 
                disabled={leaveLobbyLoading}
              >
                Continue To Lobby &nbsp;
                <ui.Logo id="arrow_right" className="pt-[3px]" /> 
              </ui.Button>
              <ui.Button 
                className="w-full" 
                onClick={leaveLobbyBtn} 
                disabled={leaveLobbyLoading}
              >
                {leaveLobbyLoading 
                  ? <Loader.Spinner /> : 
                  <>
                    Leave Lobby &nbsp;
                    <ui.Logo id="leave" /> 
                  </>
                }
              </ui.Button>
            </>}

            {session.active_position == "game" && <>
              <ui.Button 
                className="w-full" 
                onClick={() => navigate("/game")} 
                disabled={leaveGameLoading}
              >
                Continue To Game &nbsp;
                <ui.Logo id="arrow_right" className="pt-[3px]" />
              </ui.Button>
              <ui.Button 
                className="w-full" 
                onClick={leaveGameBtn} 
                disabled={leaveGameLoading}
              >
                {leaveGameLoading 
                  ? <Loader.Spinner /> 
                  : <>
                    Leave Game &nbsp;
                    <ui.Logo id="leave" /> 
                  </>
                }
              </ui.Button>
            </>}

          </div>
        </div>

      </main>

    </ui.FullScreen>
  )
}


export default Home;
