import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, easeInOut, easeOut } from "motion/react";

import * as SocketAPI from "../api/socket_handler"
import { useNotification } from "../utils/context/notification";
import { useApp } from "../utils/context/app_provider"

import ui from "../components/shared/_ui"
import lobby_ui from "../components/lobby/lobby_ui"
import Loader from "../components/loaders/_loaders";
import Skeleton from "react-loading-skeleton";

import bgLandscape from "../assets_staging/bg1.png"
import bgMobile from "../assets_staging/bg2.png"
import paintTexture from "../assets_staging/t1.jpg"


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
  const [bot_name_input, setBotNameInput] = useState("");
  const chat_container = useRef(null);
  const [lobby_chat_input, setLobbyChatInput] = useState("");
  const [lobby_chat_sending, setLobbyChatSending] = useState(false);
  const [start_game_btn_loading, setStartGameBtnLoading] = useState(false);
  const [openNumsIndex, setOpenNumsIndex] = useState(null);
  const baseColorIds = useRef([]);
  const advCardObjIds = useRef([]);


  async function loadLobby(show_notifications=true) {
    setLobby(null);
    const result = await SocketAPI.loadLobby();

    if (show_notifications && result.msg) {
      showNotification({
        text: result.msg,
        type: result.error ? "error" : "success"
      });
    }

    if (!result.error){
      setSession({
        ...session,
        active_position: "lobby",
      });
    }

    if (result.redirect) {
      navigate(result.redirect, {replace:true});
      return;
    }

    setLobby(result.lobby);
    console.log(result)
  }

  useEffect(() => {
    loadLobby();

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

    SocketAPI.listenForGameStart(() => {
      showNotification({
        text: "Game Started. Redirecting to game...",
        type: "success"
      })

      navigate("/game");
    })
    
  }, []);


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


  async function setGameOptions(option, value) {
    const newGameOptions = {
      ...lobby.game_options,
      [option]: value,
    };

    setLobby(prevLobby => ({
      ...prevLobby,
      game_options: newGameOptions,
    }));

    const result = await SocketAPI.changeGameOptions(newGameOptions);
    
    if (result.error){
      console.log(result);

      showNotification({
        text: `Error changing settings: ${result.msg}. Syncing lobby...`,
        type: "error",
      });
      
      loadLobby(false);
    }

  }


  async function startGame(){
    setStartGameBtnLoading(true);
    const result = await SocketAPI.startGameFromLobby();
    setStartGameBtnLoading(false);

    showNotification({
      text: result.msg,
      type: result.error ? "error" : "success"
    });
  }


  function startGameValidation(){
    const limits = lobby.game_options.limits;

    if (Object.entries(lobby.players).length + lobby.game_options.bots.length < limits.min_total_game_players)
      return [false, 
        `At least ${limits.min_total_game_players} players in required to start the game.`]

    if (Object.entries(lobby.players).length + lobby.game_options.bots.length > limits.max_total_game_players)
      return [false, 
        `Maximum ${limits.max_total_game_players} players and bots are allowed`]

    if (!lobby.game_options.use_advanced_options &&
      lobby.game_options.selected_card_objects.length == 0)
      return [false, "Please select at least one card type to start the game"]

    if (lobby.game_options.use_advanced_options){
      if (lobby.game_options.base_colors.length == 0)
        return [false, "Please select at least one base color to continue"]
      if (lobby.game_options.advanced_card_objects.length == 0)
        return [false, "Please select at least one card object to continue"]
      
      let norm_custom_exists = false;
      for (const card_obj of lobby.game_options.advanced_card_objects) {
        if (card_obj.id === "norm_base_cards") {
          norm_custom_exists = true;
          if (card_obj.nums.length == 0){
            return [false, 
              "Advanced card object of type Nomral Cards must contains at least on number"]
          }
        }
      }
      if (!norm_custom_exists)
        return [false, "Advanced card objects must contain at least one Normal Cards type"]
    }
    
    return [true, ""];
  }


  useEffect(() => {
    if (chat_container.current) {
      chat_container.current.scrollTo({
        top: chat_container.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [lobby?.chat]);


  async function addLobbyMsg(){
    setLobbyChatInput("")
    setLobbyChatSending(true)
    const result = await SocketAPI.addLobbyChatMessage(lobby_chat_input)
    setLobbyChatSending(false)

    if (result.error){
      showNotification({
        text: result.msg,
        type: "error",
      });
    }
  }


  function generateId() {
    if (crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }


  Object.assign(ui, {Lobby:lobby_ui})
  
  
  if (!lobby){
    return (
    <ui.FullScreen className="flex">

      <ui.SideBar 
        style={{"--bg-paint-texture": `url(${paintTexture})`,}}
      >
        <h1 className="ui-text text-2xl truncate shrink-0">
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

        <div className="hidden md:flex flex-col gap-ui-xs">
          <ui.SideBar.Divider className="!mb-ui-xxs" />

          <div className="flex flex-col 
            game-theme-scrollbar max-h-80">

              <Skeleton height={30} />
              <Skeleton height={30} />
              <Skeleton height={30} />
          
          </div>

        </div>

        <ui.SideBar.Divider />

        <ui.SideBar.Btn 
          onClick={() => {navigate("/")}}
          className="shrink-0"
        >
          Home
        </ui.SideBar.Btn>
        <ui.SideBar.Btn
          className="shrink-0"
        >
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
        <ui.Frame
          className={`
            flex flex-col w-[92%] h-[92%]
            lg:w-[85%] lg:h-[85%]
            items-center justify-center
            gap-ui-md game-theme-scrollbar
          `}
        >
          <div className="
            flex flex-col lg:flex-row
            w-full h-full gap-ui-sm
          ">
            <div className="flex flex-col 
              flex-2 lg:flex-1 gap-ui-sm min-w-0"
            >

            <ui.Frame.Box
              header="Players"
              className="md:flex-1 min-h-auto lg:min-h-0
                md:hidden"
              insideBoxClassName="h-full game-theme-scrollbar 
              grid grid-cols-1 sm:grid-cols-2 gap-ui-sm"
            >
              <Skeleton height={30} />
              <Skeleton height={30} />
              <Skeleton height={30} />
            </ui.Frame.Box>

            <ui.Frame.Box
              header="Chat"
              className="flex-1 min-h-auto lg:min-h-0
                lg:max-h-[100%] max-h-100 relative"
              insideBoxClassName="h-full game-theme-scrollbar
                !pb-18"
              insideBoxProps={{
                ref:chat_container
              }}
            >
              <Skeleton height={30} />
              <Skeleton height={30} />
              <Skeleton height={30} />
            </ui.Frame.Box>
            
            </div>

            <ui.Frame.Box
              header="Settings"
              className="flex-2 min-h-auto lg:min-h-0 lg:min-w-0"
              insideBoxClassName="h-full game-theme-scrollbar
                flex flex-col gap-ui-xs"
            >
              <Skeleton height={30} />
              <Skeleton height={30} />
              <Skeleton height={30} />
            </ui.Frame.Box>
            
          </div>
        </ui.Frame>

      </main>
    </ui.FullScreen>
    )
  }
  
  
  const limits = lobby.game_options.limits;


  return (
    <ui.FullScreen className="flex">

      <ui.SideBar 
        style={{"--bg-paint-texture": `url(${paintTexture})`,}}
      >
        <h1 className="ui-text text-2xl truncate shrink-0">
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

        <div className="hidden md:flex flex-col gap-ui-xs">
          <ui.SideBar.Divider className="!mb-ui-xxs" />

          <div className="flex flex-col 
          game-theme-scrollbar max-h-80">
          
          <AnimatePresence mode="popLayout">
          {Object.entries(lobby.players).map(([id, p_info]) => (
              <ui.Lobby.PlayerLabel 
                key={id}
                player={p_info}
                owner={id == lobby.owner}
                hasKick={session.player_id == lobby.owner && id != lobby.owner}
                kickFunc={() => kickPlayer(id)}
                kickContent={kick_player_loading == id ? <Loader.Spinner /> : "Kick"}
                kickDisabled={kick_player_loading == id}

                layout
                initial={{opacity:0,scale:0.7,}}
                animate={{opacity:1,scale:[0.85,1,0.97,1]}}
                transition={{ease:easeInOut, duration:0.4}}
                exit={{opacity:0,scale:0.5,}}
              />
          ))}
          </AnimatePresence>

          <ui.Frame.hr className="my-ui-xxs" />

          <AnimatePresence mode="popLayout">
          {lobby.game_options.bots.map((bot_info, i) => {
            let botKick = false;
            if (lobby.owner == session.player_id){
              botKick = () => {
                const new_bot_names = [...lobby.game_options.bots];
                new_bot_names.splice(i, 1);
                setGameOptions("bots", new_bot_names)
              }
            }
            return (
              <ui.Lobby.PlayerLabel
                key={bot_info.id}
                botName={bot_info.name}
                botKick={botKick}

                layout
                initial={{opacity:0,scale:0.7,}}
                animate={{opacity:1,scale:[0.99, 0.98, 1]}}
                exit={{opacity:0,scale:0.5,}}
              />
            )
          })}
          </AnimatePresence>

          </div>

          {lobby.owner == session.player_id && <>
          <ui.Lobby.Start
            className="!mt-ui-sm"
            onClick={startGame}
            disabled={!startGameValidation()[0] || start_game_btn_loading}
          >
            {start_game_btn_loading ? <Loader.Spinner/> : "Start Game"}
          </ui.Lobby.Start>
  
          {
            !startGameValidation()[0] &&
            <p className="ui-text !text-theme-error">
              {startGameValidation()[1]}
            </p>
          }

          {
          Object.entries(lobby.players).some(([p_id, p_info]) => p_info.connection_status == "offline") &&
            <p className="ui-text !text-theme-warning">
              Warning: some players appear to be offline. 
              You wont be able to kick them after starting the game
            </p>
          }
          </>}
          {lobby.owner !== session.player_id &&
          <p
            className="ui-text text-center
              text-lg opacity-70 hidden md:block truncate"
          >
            Waiting for owner to start the game
          </p>
          }

        </div>

        <ui.SideBar.Divider />

        <ui.SideBar.Btn 
          onClick={() => {navigate("/")}}
          className="shrink-0"
        >
          Home
        </ui.SideBar.Btn>
        <ui.SideBar.Btn
          className="shrink-0"
        >
          Settings
        </ui.SideBar.Btn>
        <ui.SideBar.Btn 
          onClick={leaveLobbyBtn}
          disabled={leave_lobby_loading}
          className="shrink-0"
        >
          {leave_lobby_loading ? <Loader.Spinner /> : "Leave Lobby"}
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
        <ui.Frame
          className={`
            flex flex-col w-[92%] h-[92%]
            lg:w-[85%] lg:h-[85%]
            items-center justify-center
            gap-ui-md game-theme-scrollbar
            relative
          `}
        >
          <div className="
            flex flex-col lg:flex-row
            w-full h-full gap-ui-sm
          ">
            <div className="flex flex-col 
              flex-2 lg:flex-1 gap-ui-sm min-w-0"
            >

            <ui.Frame.Box
              header="Players"
              className="md:flex-1 min-h-auto lg:min-h-0
                md:hidden"
              insideBoxClassName="h-full game-theme-scrollbar 
              grid grid-cols-1 sm:grid-cols-2 gap-ui-sm"
            >

            <AnimatePresence mode="popLayout">
            {Object.entries(lobby.players).map(([id, p_info]) => (
                <ui.Lobby.PlayerLabel 
                  key={id}
                  player={p_info}
                  owner={id == lobby.owner}
                  hasKick={session.player_id == lobby.owner && id != lobby.owner}
                  kickFunc={() => kickPlayer(id)}
                  kickContent={kick_player_loading == id ? <Loader.Spinner /> : "Kick"}
                  kickDisabled={kick_player_loading == id}

                  layout
                  initial={{opacity:0,scale:0.7,}}
                  animate={{opacity:1,scale:[0.85,1,0.97,1]}}
                  transition={{ease:easeInOut, duration:0.4}}
                  exit={{opacity:0,scale:0.5,}}
                />
            ))}
            </AnimatePresence>

            <ui.Frame.hr className="col-span-1 sm:col-span-2" />

            <AnimatePresence mode="popLayout">
            {lobby.game_options.bots.map((bot_info, i) => {
              let botKick = false;
              if (lobby.owner == session.player_id){
                botKick = () => {
                  const new_bot_names = [...lobby.game_options.bots];
                  new_bot_names.splice(i, 1);
                  setGameOptions("bots", new_bot_names)
                }
              }
              return (
                <ui.Lobby.PlayerLabel
                  key={bot_info.id}
                  botName={bot_info.name}
                  botKick={botKick}

                  layout
                  initial={{opacity:0,scale:0.7,}}
                  animate={{opacity:1,scale:[0.85,1,0.97,1]}}
                  transition={{ease:easeInOut, duration:0.4}}
                  exit={{opacity:0,scale:0.5,}}
                />
              )
            })}
            </AnimatePresence>

            </ui.Frame.Box>

            <ui.Frame.Box
              header="Chat"
              className="flex-1 min-h-auto lg:min-h-0
                lg:max-h-[100%] max-h-100 relative"
              insideBoxClassName="h-full game-theme-scrollbar
                !pb-18"
              insideBoxProps={{
                ref:chat_container
              }}
            >
              {lobby.chat.map((msg, i) => (
                <ui.Lobby.ChatMsg key={i} msg={msg} />
              ))}

              <div className="flex flex-row
                gap-ui-xs items-center absolute bottom-ui-md
                left-0 right-0 px-ui-md">
                <ui.Frame.Input 
                  className="w-full mt-ui-xs"
                  placeholder="Say something..." 
                  value={lobby_chat_input} 
                  onChange={(e)=>{setLobbyChatInput(e.target.value)}}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && lobby_chat_input.trim() != "" && !lobby_chat_sending){
                      addLobbyMsg();
                    }
                  }}
                />
                <ui.Frame.Btn
                  onClick={addLobbyMsg} 
                  disabled={lobby_chat_sending || lobby_chat_input.trim() == ""}                
                >
                  {lobby_chat_sending ? <Loader.Spinner/> : "Send"}
                </ui.Frame.Btn>
              </div>

            </ui.Frame.Box>
            
            </div>

            <ui.Frame.Box
              header="Settings"
              className="flex-2 min-h-auto lg:min-h-0 lg:min-w-0"
              insideBoxClassName="h-full game-theme-scrollbar
                flex flex-col gap-ui-xs"
            >
              <ui.Frame.SubBox>
                <h1 className="text-lg p-ui-xxs">Bots:</h1>
                <ui.Frame.hr className="mb-ui-xs" />

                <div className="flex flex-col gap-ui-xxs">

                <AnimatePresence mode="popLayout">
                {lobby.game_options.bots.map((bot_info, i) => {
                  let botKick = false;
                  if (lobby.owner == session.player_id){
                    botKick = () => {
                      const new_bot_names = [...lobby.game_options.bots];
                      new_bot_names.splice(i, 1);
                      setGameOptions("bots", new_bot_names)
                    }
                  }
                  return (
                    <ui.Lobby.PlayerLabel
                      key={bot_info.id}
                      botName={bot_info.name}
                      botKick={botKick}

                      layout
                      initial={{opacity:0,scale:0.7,}}
                      animate={{opacity:1,scale:[0.85,1,0.97,1]}}
                      transition={{ease:easeInOut, duration:0.4}}
                      exit={{opacity:0,scale:0.5,}}
                    />
                  )
                })}
                </AnimatePresence>

                </div>

                {lobby.game_options.bots.length == 0 &&
                  <p className="px-ui-md">Empty!</p>
                }

                {lobby.owner == session.player_id && <>

                <ui.Frame.hr className="mt-ui-xs" />

                <h1 className="text-lg p-ui-xxs">Add bot:</h1>
                
                <div className="flex flex-row">
                <ui.Frame.ContrastInput
                  placeholder="bot name"
                  value={bot_name_input}
                  onChange={(e) => {setBotNameInput(e.target.value)}}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && 
                      !(
                        bot_name_input.trim() == "" ||
                        lobby.game_options.bots.length + 
                        Object.entries(lobby.players).length 
                        >= limits.max_total_game_players
                      )
                    ){
                      const this_bot = {name:bot_name_input, id:generateId()};
                      setBotNameInput("");
                      const new_bot_names = [...lobby.game_options.bots];
                      new_bot_names.push(this_bot);
                      setGameOptions("bots", new_bot_names);
                    }
                  }}
                />

                <ui.Frame.ContrastBtn
                  className="shrink-0"
                  onClick={() => {
                    const this_bot = {name:bot_name_input, id:generateId()};
                    setBotNameInput("");
                    const new_bot_names = [...lobby.game_options.bots];
                    new_bot_names.push(this_bot);
                    setGameOptions("bots", new_bot_names);
                  }}
                  disabled={
                    bot_name_input.trim() == "" ||
                    lobby.game_options.bots.length + 
                    Object.entries(lobby.players).length 
                    >= limits.max_total_game_players
                  }
                >
                Add Bot
                </ui.Frame.ContrastBtn>
                </div>

                {lobby.game_options.bots.length + 
                    Object.entries(lobby.players).length 
                    >= limits.max_total_game_players &&
                  <p className="text-theme-warning p-ui-xs">
                    Maximum number of bots reached!
                  </p>    
                }

                </>}
               
              </ui.Frame.SubBox>

              <ui.Frame.SubBox
                className="!p-ui-xs"
              >

                <h1 className="text-lg">Game options:</h1>
                <ui.Frame.hr className="mb-ui-xs" />

                {/* --- BASIC SETTINGS   --- */}
                <>

                {!lobby.game_options.use_advanced_options && 
                  <p className="text-lg m-ui-md">Selected Cards (Qick Play):</p>
                }

                <div
                  className="flex flex-col gap-ui-xxs
                    sm:grid grid-cols-2"
                >

                {!lobby.game_options.use_advanced_options && 
                  Object.entries(lobby.game_options.card_objects).map(([card_id, [card_title, card_desc]]) => {
                    const selected =lobby.game_options.selected_card_objects.includes(card_id);

                    return (
                      <ui.Lobby.BasicCardObj
                        key={card_id}
                        className="flex"
                        card_title={card_title}
                        card_desc={card_desc}
                        selected={selected}
                        onClick={() => {
                          if (lobby.owner !== session.player_id) return;
                          const selectedCards = [...lobby.game_options.selected_card_objects];

                          if (selected) {
                            selectedCards.splice(selectedCards.indexOf(card_id), 1);
                          } else {
                            selectedCards.push(card_id);
                          }

                          setGameOptions(
                            "selected_card_objects",
                            selectedCards
                          );
                        }}
                      />
                    );
                  }
                )}
                </div>

                {session.player_id == lobby.owner && !lobby.game_options.use_advanced_options && 
                  lobby.game_options.selected_card_objects.length == 0 &&
                  <p className="text-theme-warning p-ui-xs">
                    Please select at least one card type
                  </p>
                }

                </>
                {/* --- END BASIC SETTINGS   --- */}



                {/* -------- Advanced Card Objescts -------- */}
                {lobby.game_options.use_advanced_options &&
                <div className="flex flex-col p-ui-xxs !gap-ui-xs">
                  
                
                {/* OWNER OPTIONS */}
                {session.player_id == lobby.owner && <>
                <ui.Frame.SubBox className="gap-ui-xs !p-ui-sm 
                  flex flex-col">

                  <p className="text-lg">Base colors:</p>
                  <ui.Frame.hr />

                  {lobby.game_options.base_colors.length == 0 &&
                    <p className="px-ui-md">Empty!</p>
                  }

                  <div className="grid grid-cols-2 gap-ui-xs
                    xl:grid-cols-3">
                  <AnimatePresence  mode="popLayout">
                  {lobby.game_options.base_colors.map((b_color, i) => {
                    let thisId = null;
                    if (baseColorIds.current.length != lobby.game_options.base_colors.length){
                      thisId = generateId();
                      baseColorIds.current.push(thisId);
                    } 
                    else {
                      thisId = baseColorIds.current[i];
                    }
                    
                    return (
                      <motion.div 
                        className="lobby-basecolor-holder flex flex-row gap-ui-xs flex-1 justify-between" 
                        key={baseColorIds.current[i]}

                        layout
                        initial={{opacity:0,scale:0.7,}}
                        animate={{opacity:1,scale:[0.85,1,0.97,1]}}
                        transition={{ease:easeOut, duration:0.2}}
                        exit={{opacity:0,scale:0.5,}}
                      >
                        <input
                          className="lobby-basecolor-input shrink-0"
                          type={"color"} 
                          value={b_color} 
                          disabled={session.player_id !== lobby.owner}
                          onChange={(e) => {
                            const new_colors = [...lobby.game_options.base_colors];
                            new_colors[i] = e.target.value;

                            setLobby(prevLobby => ({
                              ...prevLobby,
                              game_options: {
                                ...prevLobby.game_options,
                                base_colors: new_colors,
                              },
                            }));
                          }}
                          onBlur={() => {
                            setGameOptions("base_colors", lobby.game_options.base_colors);
                          }}
                        />
                        <button
                          className="px-ui-sm !text-xs 
                            lobby-remove-base-color"
                          onClick={() => {
                            baseColorIds.current.splice(i, 1)
                            const new_colors = [...lobby.game_options.base_colors];
                            new_colors.splice(i, 1);
                            setGameOptions("base_colors", new_colors);
                          }}
                        >
                          Remove
                        </button>
                      </motion.div>
                    )
                  })}
                  </AnimatePresence>
                  </div>

                  <div className="flex flex-col gap-ui-xs">
                  <ui.Frame.ContrastBtn 
                    onClick={() => {
                      const new_colors = [...lobby.game_options.base_colors];
                      new_colors.push(
                        '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')
                      )
                      setGameOptions("base_colors", new_colors);
                    }}
                    disabled={
                      lobby.game_options.base_colors.length >= limits.max_base_colors
                    }
                  >
                    Add base color +
                  </ui.Frame.ContrastBtn>

                  {lobby.game_options.base_colors.length >= limits.max_base_colors &&
                    <p className="text-theme-warning">
                      Maximum number of advanced card objects reached!
                    </p>
                  }
                  </div>

                </ui.Frame.SubBox>


                <ui.Frame.SubBox 
                  className="gap-ui-xs !p-ui-sm flex flex-col"
                >

                  <p className="text-lg">
                    Card objects:
                  </p>

                  <ui.Frame.hr />

                  {lobby.game_options.advanced_card_objects.length == 0 &&
                    <p className="px-ui-md">Empty!</p>
                  }

                  <div className="flex flex-col gap-ui-xs">

                  <AnimatePresence mode="popLayout">
                  {lobby.game_options.advanced_card_objects.map((card_obj, i) => {
                    let thisId = null;
                    if (advCardObjIds.current.length != lobby.game_options.advanced_card_objects.length){
                      thisId = generateId();
                      advCardObjIds.current.push(thisId);
                    }
                    else{
                      thisId = advCardObjIds.current[i];
                    }

                    return (
                    <ui.Frame.SubBox 
                      key={advCardObjIds.current[i]} 
                      className="relative flex flex-col gap-ui-xs"

                      layout
                      initial={{opacity:0,scale:0.7,}}
                      animate={{opacity:1,scale:[0.85,1,0.97,1]}}
                      transition={{ease:easeOut, duration:.4}}
                      exit={{opacity:0,scale:0.5,}}
                    >
                      <div className="flex flex-row gap-ui-xs items-center">
                        <label>Type:</label>
                        <ui.Frame.Select
                          className="lobby-card-type-select"
                          value={card_obj.id}
                          onChange={(e) => {
                            const new_objects = [
                              ...lobby.game_options.advanced_card_objects
                            ];
                            const new_id = e.target.value;
                            new_objects[i] = {
                              ...new_objects[i],
                              id: new_id,
                              ...(new_id === "norm_base_cards" && {
                                nums: Array.from({ length: 10 }, (_, i) => i + 1),
                              }),
                            };
                            setGameOptions(
                              "advanced_card_objects",
                              new_objects
                            );
                          }}
                        >
                          {Object.entries(
                            lobby.game_options.allowed_advanced_card_objects
                          ).map(([c_id, c_desc]) => (
                            <option key={c_id} value={c_id}>
                              {c_desc[0]}
                            </option>
                          ))}
                        </ui.Frame.Select>
                      </div>


                      <div className="flex flex-row gap-ui-xs items-center">
                        <label>
                          Weight:
                        </label>

                        <ui.Frame.Slider
                          type="range"
                          min={`${limits.min_weight}`}
                          max={`${limits.max_weight}`}
                          value={card_obj.weight}
                          onChange={(e) => {
                            const new_objects = [
                              ...lobby.game_options.advanced_card_objects
                            ];

                            new_objects[i] = {
                              ...new_objects[i],
                              weight: Number(e.target.value),
                            };

                            setLobby(prevLobby => ({
                              ...prevLobby,
                              game_options: {
                                ...prevLobby.game_options,
                                advanced_card_objects: new_objects,
                              },
                            }));
                          }}
                          onBlur={() => {
                            setGameOptions(
                              "advanced_card_objects",
                              lobby.game_options.advanced_card_objects
                            );
                          }}
                        />
                        <p> {card_obj.weight} </p>
                      </div>


                      {card_obj.id === "norm_base_cards" && (
                        <div className="flex flex-col gap-ui-xs">
                          <p className="truncate">
                            Numbers: {String(card_obj.nums)}
                          </p>
                          <button
                            className="lobby-basecolor-holder cursor-pointer"
                            onClick={() => {
                              setOpenNumsIndex(
                                openNumsIndex === i ? null : i
                              );
                            }}
                          >
                            Modify numbers
                          </button>

                          {openNumsIndex === i && (
                            <div className="flex flex-col gap-ui-xs">

                              <button
                                className="lobby-basecolor-holder cursor-pointer"
                                onClick={() => {
                                  const allSelected =
                                    card_obj.nums.length===limits.max_norm_num-limits.min_norm_num+1;

                                  const new_objects = [
                                    ...lobby.game_options.advanced_card_objects
                                  ];

                                  new_objects[i] = {
                                    ...new_objects[i],
                                    nums: allSelected
                                      ? []
                                      : Array.from(
                                        { length: limits.max_norm_num - limits.min_norm_num + 1 },
                                        (_, index) => index + limits.min_norm_num
                                      ),
                                  };

                                  setGameOptions(
                                    "advanced_card_objects",
                                    new_objects
                                  );
                                }}
                              >
                                {card_obj.nums.length===limits.max_norm_num-limits.min_norm_num+1
                                  ? "Deselect all"
                                  : "Select all"}
                              </button>


                              <div className="flex flex-row flex-wrap p-ui-xs gap-ui-xxs">
                                {Array.from(
                                  { length: limits.max_norm_num-limits.min_norm_num+1 },
                                  (_, index) => index + limits.min_norm_num
                                ).map((num) => {

                                  const isSelected =
                                    card_obj.nums.includes(num);

                                  return (
                                    <button
                                      key={num}
                                      className="lobby-moify-numbers-btn
                                        flex justify-center items-center"
                                      style={{background: isSelected ? "green" : ""}}
                                      onClick={() => {
                                        const new_nums =
                                          isSelected
                                            ? card_obj.nums.filter(
                                              n => n !== num
                                            )
                                            : [
                                              ...card_obj.nums,
                                              num
                                            ].sort(
                                              (a, b) => a - b
                                            );

                                        const new_objects = [
                                          ...lobby.game_options.advanced_card_objects
                                        ];

                                        new_objects[i] = {
                                          ...new_objects[i],
                                          nums: new_nums,
                                        };

                                        setGameOptions(
                                          "advanced_card_objects",
                                          new_objects
                                        );
                                      }}
                                    >
                                      {num}
                                    </button>
                                  );
                                })}
                              </div>

                            </div>
                          )}

                        </div>
                      )}


                      <ui.Frame.ContrastBtn
                        className="!p-0"
                        onClick={() => {
                          advCardObjIds.current.splice(i, 1);

                          const new_objects = [
                            ...lobby.game_options.advanced_card_objects
                          ];

                          new_objects.splice(i, 1);

                          setGameOptions(
                            "advanced_card_objects",
                            new_objects
                          );
                        }}
                      >
                        Remove
                      </ui.Frame.ContrastBtn>

                    </ui.Frame.SubBox>
                  )})}
                  </AnimatePresence>

                  <div className="flex">
                  <ui.Frame.ContrastBtn
                    className="w-full"
                    onClick={() => {
                      const to_add_index = 
                        lobby.game_options.advanced_card_objects.length %
                        Object.entries(lobby.game_options.allowed_advanced_card_objects).length;
                      const toAddCardObjID = Object.keys(
                      lobby.game_options.allowed_advanced_card_objects
                      )[to_add_index];

                      const new_object = {
                      id: toAddCardObjID,
                      weight: 4,
                      ...(toAddCardObjID === "norm_base_cards" && {
                        nums: Array.from({ length: 10 }, (_, i) => i + 1),
                      }),
                      };

                      setGameOptions(
                      "advanced_card_objects",
                      [...lobby.game_options.advanced_card_objects, new_object]
                      );
                    }}
                    disabled={
                      lobby.game_options.advanced_card_objects.length >=
                        limits.max_advanced_card_objects
                    }
                  >
                  Add new object +
                  </ui.Frame.ContrastBtn>

                  </div>

                  {lobby.game_options.advanced_card_objects.length >=
                        limits.max_advanced_card_objects &&
                    <p className="text-theme-warning">
                      Maximum number of advanced card objects reached!
                    </p>
                  }


                  </div>

                </ui.Frame.SubBox>

                </>}
                {/* END OWNER OPTIONS */}


                {/* NON-OWNER OPTIONS */}
                {session.player_id !== lobby.owner && <>
                <div className="flex flex-col p-ui-xxs !gap-ui-xs">

                  {/* -------- Base Colors -------- */}
                  <ui.Frame.SubBox className="gap-ui-xs !p-ui-sm flex flex-col">

                    <p className="text-lg">Base colors:</p>
                    <ui.Frame.hr />

                    {lobby.game_options.base_colors.length == 0 &&
                      <p className="px-ui-md">Empty!</p>
                    }

                    <div className="grid grid-cols-2 gap-ui-xs xl:grid-cols-3">
                      <AnimatePresence mode="popLayout">
                      {lobby.game_options.base_colors.map((color, i) => (
                        <motion.div
                          key={i}
                          className="
                            lobby-basecolor-holder
                            flex flex-row gap-ui-xs
                            flex-1 justify-between
                            items-center
                          "
                          initial={{opacity:0,scale:0.7,}}
                          animate={{opacity:1,scale:[0.85,1,0.97,1]}}
                          transition={{ease:easeOut, duration:0.2}}
                          exit={{opacity:0,scale:0.5,}}
                        >
                          <div
                            className="lobby-basecolor-input shrink-0"
                            style={{ backgroundColor: color }}
                          />

                          <p className="truncate">{color}</p>
                        </motion.div>
                      ))}
                      </AnimatePresence>
                    </div>
                  </ui.Frame.SubBox>


                  {/* -------- Card Objects -------- */}
                  <ui.Frame.SubBox className="gap-ui-xs !p-ui-sm flex flex-col">

                    <p className="text-lg">
                      Card objects:
                    </p>
                    <ui.Frame.hr />

                    {lobby.game_options.advanced_card_objects.length == 0 &&
                      <p className="px-ui-md">Empty!</p>
                    }

                    <div className="flex flex-col gap-ui-xs">
                      <AnimatePresence mode="popLayout">
                      {lobby.game_options.advanced_card_objects.map((card_obj, i) => (
                        <ui.Frame.SubBox
                          key={i}
                          className="flex flex-col gap-ui-xs"

                          layout
                          initial={{opacity:0,scale:0.7,}}
                          animate={{opacity:1,scale:[0.85,1,0.97,1]}}
                          transition={{ease:easeOut, duration:.4}}
                          exit={{opacity:0,scale:0.5,}}
                        >
                          <div className="flex flex-row gap-ui-md truncate">
                            <label>Type:</label>
                            <p>
                              {
                                lobby.game_options.allowed_advanced_card_objects[
                                  card_obj.id
                                ]?.[0] ?? card_obj.id
                              }
                            </p>
                          </div>

                          <div className="flex flex-row gap-ui-md truncate">
                            <label>
                              Weight:
                            </label>

                            <p>
                              {card_obj.weight}
                            </p>
                          </div>


                          {card_obj.id === "norm_base_cards" && (
                            <div className="flex flex-row gap-ui-md truncate">
                              <p>
                                Numbers:
                              </p>

                              <p className="truncate">
                                {String(card_obj.nums)}
                              </p>
                            </div>
                          )}

                        </ui.Frame.SubBox>
                      ))}
                      </AnimatePresence>
                    </div>
                  </ui.Frame.SubBox>

                </div>

                </>}


                </div>}
                {/* -------- END Advanced Card Objescts -------- */}



                <ui.Frame.hr className="mt-ui-xs" />

                {session.player_id == lobby.owner &&
                <div className="flex">
                  <ui.Frame.ContrastBtn
                    className="w-full cursor-pointer !p-ui-xxs
                      !text-md mt-ui-xs"
                    onClick={() => {
                      setGameOptions("use_advanced_options", !lobby.game_options.use_advanced_options )
                    }}
                  >
                    {lobby.game_options.use_advanced_options 
                      ? "Disable advanced options" 
                      : "Enable advanced options"
                    }
                  </ui.Frame.ContrastBtn>
                </div>
                }

              </ui.Frame.SubBox>

              <ui.Frame.SubBox 
                className="!p-ui-xs"
              >
                <h1 className="text-lg">Game Rules:</h1>
                <ui.Frame.hr className="mb-ui-xs" />


                {/* -----------   OWNER  ------------- */}

                {lobby.owner == session.player_id && <>


                <div className="flex flex-col gap-ui-xxs truncate">
                  <ui.Frame.Label 
                    className="w-full flex flex-row 
                      justify-between !p-ui-xs !px-ui-lg"
                  >
                    Initial deck size:
                  
                    <ui.Frame.Select
                      value={lobby.game_options.init_deck_size}
                      onChange={(e) =>
                        setGameOptions(
                          "init_deck_size",
                          Number(e.target.value)
                        )
                      }
                    >
                      {Array.from({ length: limits.max_init_deck_size - limits.min_init_deck_size + 1}, 
                        (_, i) => i + limits.min_init_deck_size).map(count => (
                          <option key={count} value={count}>
                            {count} Cards
                          </option>
                        ))
                      }
                    </ui.Frame.Select>
                  </ui.Frame.Label>


                  <ui.Frame.Label 
                    className="w-full flex flex-row 
                      justify-between !p-ui-xs !px-ui-lg"
                  >
                    Can draw when playable:

                    <ui.Frame.CheckBox
                      checked={lobby.game_options.can_draw_when_playable}
                      onChange={(e) =>
                        setGameOptions(
                          "can_draw_when_playable",
                          e.target.checked
                        )
                      }
                    />
                  </ui.Frame.Label>


                  <ui.Frame.Label 
                    className="w-full flex flex-row 
                      justify-between !p-ui-xs !px-ui-lg"
                  >
                    Max draw per turn:

                    <ui.Frame.Select
                      value={lobby.game_options.max_draws_per_turn}
                      onChange={(e) =>{
                        const value = e.target.value;
                        setGameOptions(
                          "max_draws_per_turn",
                          value === "infinite" ? "infinite" : Number(value)
                        )
                      }}
                    >
                      <option value={"infinite"}>Infinite</option>
                      {Array.from(
                        { length: 
                          limits.max_max_draws_per_turn - limits.min_max_draws_per_turn + 1
                        }, 
                        (_, i) => i+limits.min_max_draws_per_turn).map(count => (
                          <option key={count} value={count}>
                            {count} Draws
                          </option>
                        ))
                      }
                    </ui.Frame.Select>
                  </ui.Frame.Label>


                  <ui.Frame.Label 
                    className="w-full flex flex-row 
                      justify-between !p-ui-xs !px-ui-lg"
                  >
                    Allow wild card stacking:

                    <ui.Frame.CheckBox
                      checked={lobby.game_options.allow_wild_card_stacking}
                      onChange={(e) =>
                        setGameOptions(
                          "allow_wild_card_stacking",
                          e.target.checked
                        )
                      }
                    />
                  </ui.Frame.Label>


                  <ui.Frame.Label 
                    className="w-full flex flex-row 
                      justify-between !p-ui-xs !px-ui-lg"
                  >
                    Wild cards must match:

                    <ui.Frame.CheckBox
                      checked={lobby.game_options.wild_cards_must_match}
                      onChange={(e) =>
                        setGameOptions(
                          "wild_cards_must_match",
                          e.target.checked
                        )
                      }
                    />
                  </ui.Frame.Label>


                  <ui.Frame.Label 
                    className="w-full flex flex-row 
                      justify-between !p-ui-xs !px-ui-lg"
                  >
                    Turn timer:

                    <ui.Frame.Select
                      value={lobby.game_options.turn_timer}
                      onChange={(e) => {
                        const value = e.target.value;

                        setGameOptions(
                          "turn_timer",
                          value === "infinite" ? "infinite" : Number(value)
                        );
                      }}
                    >
                      <option value="infinite">Infinite</option>
                      {limits.turn_timers.map(seconds => (
                        <option key={seconds} value={seconds}>
                          {seconds} Seconds
                        </option>
                      ))}
                    </ui.Frame.Select>
                  </ui.Frame.Label>

                </div>
                
                </>}

                {/* -----------   END OWNER  ------------- */}



                {/* -----------   NON-OWNER  ------------- */}

                {lobby.owner !== session.player_id && <>


                <div className="flex flex-col gap-ui-xxs">
                  <ui.Frame.Label 
                    className="w-full flex flex-row 
                      justify-between !p-ui-xs !px-ui-lg"
                  >
                    <p>Initial deck size:</p>
                    <p>{lobby.game_options.init_deck_size} Cards</p>
                  </ui.Frame.Label>


                  <ui.Frame.Label 
                    className="w-full flex flex-row 
                      justify-between !p-ui-xs !px-ui-lg"
                  >
                    Can draw when playable:
                    <ui.Frame.CheckBox
                      checked={lobby.game_options.can_draw_when_playable}
                      disabled={true}
                    />
                  </ui.Frame.Label>


                  <ui.Frame.Label 
                    className="w-full flex flex-row 
                      justify-between !p-ui-xs !px-ui-lg"
                  >
                    <p>Max draw per turn:</p>
                    <p>{lobby.game_options.max_draws_per_turn} Draws</p>
                  </ui.Frame.Label>


                  <ui.Frame.Label 
                    className="w-full flex flex-row 
                      justify-between !p-ui-xs !px-ui-lg"
                  >
                    Allow wild card stacking:
                    <ui.Frame.CheckBox
                      checked={lobby.game_options.allow_wild_card_stacking}
                      disabled={true}
                    />
                  </ui.Frame.Label>


                  <ui.Frame.Label 
                    className="w-full flex flex-row 
                      justify-between !p-ui-xs !px-ui-lg"
                  >
                    Wild cards must match:
                    <ui.Frame.CheckBox
                      checked={lobby.game_options.wild_cards_must_match}
                      disabled={true}
                    />
                  </ui.Frame.Label>


                  <ui.Frame.Label 
                    className="w-full flex flex-row 
                      justify-between !p-ui-xs !px-ui-lg"
                  >
                    <p>Turn timer:</p>
                    <p>{lobby.game_options.turn_timer} Seconds</p>
                  </ui.Frame.Label>

                </div>
                
                </>}

                {/* -----------   END NON-OWNER  ------------- */}

              </ui.Frame.SubBox>

            </ui.Frame.Box>
            
            <>
            {lobby.owner == session.player_id &&
            <div className="w-full flex flex-col pb-ui-lg
              md:hidden">
              <ui.Lobby.Start 
                className="m-ui-sm"
                onClick={startGame}
                disabled={!startGameValidation()[0] || start_game_btn_loading}
              >
                {start_game_btn_loading ? <Loader.Spinner/> : "Start Game"}
              </ui.Lobby.Start>

              {
                !startGameValidation()[0] &&
                <p className="ui-text !text-theme-error m-ui-sm">
                  {startGameValidation()[1]}
                </p>
              }
              {
              Object.entries(lobby.players).some(([p_id, p_info]) => p_info.connection_status == "offline") &&
                <p className="ui-text !text-theme-warning m-ui-sm">
                  Warning: some players appear to be offline. 
                  You wont be able to kick them after starting the game
                </p>
              }
              
            </div>
            }
            {lobby.owner !== session.player_id &&
            <p
              className="ui-text text-center
               text-lg opacity-70 md:hidden"
            >
              Waiting for owner to start the game
            </p>
            }
            </>
            
            

          </div>
        </ui.Frame>

      </main>
    </ui.FullScreen>
  )
}


export default Lobby;

