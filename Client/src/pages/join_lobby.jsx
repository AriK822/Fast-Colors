import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import * as SocketAPI from "../api/socket_handler"
import { useApp, AppProvider } from "../utils/context/app_provider"
import { useNotification } from "../utils/context/notification";

import ui from "../components/shared/_ui"
import Loader from "../components/loaders/_loaders";
import Skeleton from "react-loading-skeleton";
import bgLandscape from "../assets_staging/bg1.png"
import bgMobile from "../assets_staging/bg2.png"
import paintTexture from "../assets_staging/t1.jpg"


function JoinLobby() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { session, setSession } = useApp();

  const [lobbies, setLobbies] = useState(null);
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
    const result = await SocketAPI.joinLobby(lobby_id)

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

        <ui.SideBar.Btn
          onClick={() => navigate("/")}
        >Home</ui.SideBar.Btn>
        <ui.SideBar.Btn>Settings</ui.SideBar.Btn>

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
            Create Lobby
          </ui.Frame.Btn>
          
          <ui.Frame.Box
            header={
              <div className="flex flex-row 
              justify-between items-center">
                <h1 className="text-2xl">
                  Available Lobbies:
                </h1>
                <ui.Frame.Btn
                  onClick={loadJoinLobby}
                  disabled={refresh_lobbies_loading}  
                >
                  {refresh_lobbies_loading ? <Loader.Spinner /> : "Refresh"}
                </ui.Frame.Btn>
              </div>
            }
            className={`
              w-full h-full min-h-0
            `}
            insideBoxClassName={`
              flex flex-col gap-ui-md
              game-theme-scrollbar h-full
            `}
          >
            {lobbies && Object.entries(lobbies).map(([lobbyId, lobby]) => 
              <ui.Frame.JoinLobbyInfo
                key={lobbyId}
                className={`w-full`}
                onClick={() => joinLobbyFunc(lobbyId)}
                lobby={lobby}
              />
            )}
            {lobbies && Object.entries(lobbies).length == 0 &&
              <div className="text-lg">
                No lobbies found.
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
