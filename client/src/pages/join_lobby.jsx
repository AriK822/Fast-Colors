import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "motion/react"

import * as SocketAPI from "../api/socket_handler"
import { useApp, AppProvider } from "../utils/context/app_provider"
import { useNotification } from "../utils/context/notification";

import ui from "../components/shared/_ui"
import lobby_ui from "../components/lobby/lobby_ui";
import Loader from "../components/loaders/_loaders";
import Skeleton from "react-loading-skeleton";


Object.assign(ui, {Lobby:lobby_ui})


function JoinLobby() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { session, setSession } = useApp();
  const assets = ui.Assets();

  const [showSettings, setShowSettings] = useState(false);
  const [lobbies, setLobbies] = useState(null);
  const [joiningLoading, setJoiningLoading] = useState(false);
  const [refresh_lobbies_loading, setRefreshLobbiesLoading] = useState(false);
  const [nameInputValue, setNameInputValue] = useState(session.player_name);
  const isNameInputInitLoad = useRef(true);
  const [nameInputLoading, setNameInputLoading] = useState(false);


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
    setJoiningLoading(lobby_id);
    const result = await SocketAPI.joinLobby(lobby_id)
    setJoiningLoading(null);

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
  

  return (
    <ui.FullScreen className="flex">

      <ui.SideBar 
        style={{"--bg-paint-texture": `url(${assets.sideBarTexture})`,}}
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

        <ui.SideBar.Btn
          onClick={() => navigate("/")}
        >
          <ui.Logo id="home" />&nbsp;
          Home
        </ui.SideBar.Btn>
        <ui.SideBar.Btn
          onClick={() => setShowSettings(true)}
        >
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
          "--bg-mobile": `url(${assets.bgMobile})`,
          "--bg-desktop": `url(${assets.bgLandscape})`,
        }}
      >

        {showSettings &&
        <ui.Settings onClose={() => setShowSettings(false)} />
        }

        <div
          className="
            flex flex-col w-[80%] h-[80%]
            items-center justify-center
            gap-ui-md
          "
        >
          <ui.Frame.Btn 
            className="w-full"
            onClick={() => navigate("/lobby", {replace:true})}
          >
            <ui.Logo id="players" />&nbsp;
            Create Lobby
          </ui.Frame.Btn>
          
          <ui.Frame.Box
            header={
              <div className="flex flex-row 
              justify-between items-center">
                <h1 className="text-xl">
                  <ui.Logo id="door" />&nbsp;
                  Available Lobbies:
                </h1>
                <ui.Frame.Btn
                  onClick={loadJoinLobby}
                  disabled={refresh_lobbies_loading}  
                >
                  {refresh_lobbies_loading 
                    ? <Loader.Spinner /> 
                    : <>
                      <ui.Logo id="syncing" />&nbsp;
                      Refresh
                    </>
                  }
                </ui.Frame.Btn>
              </div>
            }
            className={`
              w-full h-full min-h-0
            `}
            insideBoxClassName={`
              flex flex-col gap-ui-md
              game-theme-scrollbar h-full
              !overflow-x-hidden
            `}
          >
            
            <AnimatePresence  mode="popLayout">
            {lobbies && Object.entries(lobbies).map(([lobbyId, lobby]) => 
              <ui.Lobby.JoinLobbyInfo
                key={lobbyId}
                className={`w-full`}
                onClick={() => joinLobbyFunc(lobbyId)}
                lobby={lobby}
                disabled={joiningLoading}
                loadingAnimation={joiningLoading == lobbyId}

                layout
                initial={{opacity:0,scale:0.7,}}
                animate={{opacity:1,scale:1,y:[-5,5,-2,2,0]}}
                transition={{type:"spring",stiffness:400,damping:20}}
                exit={{opacity:0,scale:0.5,}}
              />
            )}
            </AnimatePresence>

            {lobbies && Object.entries(lobbies).length == 0 &&
              <div className="text-lg opacity-70">
                <ui.Logo id="empty" />&nbsp;
                No lobbies found!
              </div>
            }
            {!lobbies &&
              <>
                <Skeleton height={20} />
                <Skeleton height={20} />
                <Skeleton height={20} />
              </>
            }
          </ui.Frame.Box>
        </div>
      </main>

    </ui.FullScreen>
  )
}


export default JoinLobby;
