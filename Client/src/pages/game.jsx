import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import * as SocketAPI from "../api/socket_handler"
import { useNotification } from "../utils/context/notification";
import { useApp } from "../utils/context/app_provider"

import { motion, AnimatePresence } from "motion/react";
import ui from "../components/shared/_ui"
import game_ui from "../components/game/game_ui"
import RenderCard from "../components/game/render_card"
import Loader from "../components/loaders/_loaders"
import Skeleton from "react-loading-skeleton";
import UiIdMapper from "../components/game/ui_choices/map_ui_id"

import bgLandscape from "../assets_staging/bg1.png"
import bgMobile from "../assets_staging/bg2.png"
import paintTexture from "../assets_staging/t1.jpg"



function PlayersStrip({game, sideLength=2}){
  const labels = []
  for (let i=-sideLength; i<=sideLength; i++){
    const thisPlayer = game.players[
      ((game.turn + game.direction * i) % game.players.length
      + game.players.length) % game.players.length
    ];

    labels.push(
      <ui.Game.PlayerStripLabel
        key={thisPlayer.id}
        player={thisPlayer}
        distance={i}
        className="
          w-[150px] lg:w-[250px] xl:w-[350px] shrink-0"
        thisTurn={i==0}

        layout
        initial={{opacity:0,scale:0.7,}}
        animate={{
          opacity:1 - Math.abs(i)*0.1,
          scale:1 - Math.abs(i)*0.1,
        }}
        exit={{opacity:0,scale:0.5,}}
      />
    )
  }
  return(
  <div className="flex justify-center gap-ui-sm relative">
    <AnimatePresence mode="popLayout">
      {labels}
    </AnimatePresence>
  </div>
  )
}


function PlayersCircle({game, thisPlayer}){
  const thisIdx = game.players.indexOf(thisPlayer);
  const playersLen = game.players.length;

  if (game.players.length == 2)
    return (<>
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+1)%playersLen]}
        thisTurn={(thisIdx+1)%playersLen == game.turn}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute left-[50%] top-[7%] -translate-x-1/2"
      />
    </>)
  if (game.players.length == 3)
    return (<>
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+1)%playersLen]}
        thisTurn={(thisIdx+1)%playersLen == game.turn}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute left-[5%] top-[12%]"
      />
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+2)%playersLen]}
        thisTurn={(thisIdx+2)%playersLen == game.turn}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute right-[5%] top-[12%]"
      />
    </>)
  if (game.players.length == 4)
    return (<>
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+1)%playersLen]}
        thisTurn={(thisIdx+1)%playersLen == game.turn}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute left-[5%] top-[15%]"
      />
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+2)%playersLen]}
        thisTurn={(thisIdx+2)%playersLen == game.turn}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute left-[50%] top-[7%] -translate-x-1/2"
      />
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+3)%playersLen]}
        thisTurn={(thisIdx+3)%playersLen == game.turn}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute right-[5%] top-[15%]"
      />
    </>)
  if (game.players.length == 5)
    return (<>
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+1)%playersLen]}
        thisTurn={(thisIdx+1)%playersLen == game.turn}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute left-[5%] top-[22%]"
      />
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+2)%playersLen]}
        thisTurn={(thisIdx+2)%playersLen == game.turn}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute left-[33%] top-[7%] -translate-x-1/2"
      />
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+3)%playersLen]}
        thisTurn={(thisIdx+3)%playersLen == game.turn}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute left-[66%] top-[7%] -translate-x-1/2"
      />
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+4)%playersLen]}
        thisTurn={(thisIdx+4)%playersLen == game.turn}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute right-[5%] top-[22%]"
      />
    </>)
  if (game.players.length == 6)
    return (<>
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+1)%playersLen]}
        thisTurn={(thisIdx+1)%playersLen == game.turn}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute left-[5%] top-[66%]"
      />
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+2)%playersLen]}
        thisTurn={(thisIdx+2)%playersLen == game.turn}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute left-[8%] top-[24%]"
      />
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+3)%playersLen]}
        thisTurn={(thisIdx+3)%playersLen == game.turn}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute left-[50%] top-[7%] -translate-x-1/2"
      />
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+4)%playersLen]}
        thisTurn={(thisIdx+4)%playersLen == game.turn}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute right-[8%] top-[24%]"
      />
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+5)%playersLen]}
        thisTurn={(thisIdx+5)%playersLen == game.turn}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute right-[5%] top-[66%]"
      />
    </>)
}


function GameDirectionIndicator({game}){
  return (
    <div className="direction">
      <div className="arc arc-one"></div>
      <div className="arc arc-two"></div>
    </div>
  )
}



function Game(){
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { session, setSession } = useApp();

  const [game, setGame] = useState(null);

  const [game_chat_input, setGameChatInput] = useState("");
  const [game_chat_sending, setGameChatSending] = useState(false);
  const chat_container = useRef(null);
  const [leave_game_loading, setLeaveGameLoading] = useState(false);
  const [choiceComponent, setChoiceComponent] = useState(null);
  const [remainingPercent, setRemainingPercent] = useState(100);
  const handCardIds = useRef([]);
  const holdTimer = useRef(null);
  const isScrolling = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const timerRef = useRef(null);



  async function loadGame(show_notifications=true) {
      setGame(null);
      const result = await SocketAPI.loadGame();

      if (show_notifications && result.msg) {
          showNotification({
            text: result.msg,
            type: result.error ? "error" : "success"
          });
      }

      if (!result.error){
        setSession({
            ...session,
            active_position: "game",
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


  async function sendGameChatMassage() {
    setGameChatInput("")
    setGameChatSending(true)
    const result = await SocketAPI.sendGameChatMessage(game_chat_input)
    setGameChatSending(false)

    if (result.error){
      showNotification({
          text: result.msg,
          type: "error",
      });
      return
    }

    setGame(prevGame => ({
      ...prevGame,
      chat: result.chat,
    }));
  }

  SocketAPI.listenForSyncGame((data) => {
    console.log(data)
    setGame(data);
  })

  SocketAPI.listenForSyncGameProperty((data) => {
    console.log(data)
    setGame(prevGame => ({
      ...prevGame,
      [data.property]: data.value,
    }));
  })

  SocketAPI.listenForGameEndedKick(() => {
    showNotification({
        text: "Game ended. Redirecting to Home page...",
        type: "success",
    });

    setSession({
      ...session,
      active_position: null,
    });

    navigate("/");
  })


  useEffect(() => {
      if (chat_container.current) {
          chat_container.current.scrollTop = chat_container.current.scrollHeight;
      }
  }, [game?.chat]);


  async function leaveGame() {
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

    if (result.redirect){
      navigate(result.redirect);
    }
  }


  async function playCard(card_index, choice=undefined) {
    const result = await SocketAPI.playCard(card_index, choice);

    if (result.error)
      showNotification({
          text: result.msg,
          type: result.error ? "error" : "success",
      });
    else
      handCardIds.current.splice(card_index, 1)
  }

  async function skipMove() {
    const result = await SocketAPI.skipMove();

    if (result.error)
    showNotification({
        text: result.msg,
        type: result.error ? "error" : "success",
    });
  }

  async function takeCard() {
    const result = await SocketAPI.takeCard();

    if (result.error)
    showNotification({
        text: result.msg,
        type: result.error ? "error" : "success",
    });
  }

  function generateId() {
    if (crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function openChoiceUI(choice_ui_id, card_index){
    const ChoiceComponent = UiIdMapper[choice_ui_id];
    const onSelect = (choice_data) => {
      playCard(card_index, choice_data);
      setChoiceComponent(null);
    };
    setChoiceComponent(
    <ChoiceComponent 
      game={game} 
      onSelect={onSelect} 
      onClose={() => setChoiceComponent(null)}
      />
    )
  }

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--game-base-color",
      game?.base_color
    );
  }, [game?.base_color]);


  useEffect(() => {
    if (!game || game.turn_timer === "infinite") return;

    const duration = game.turn_timer * 1000;
    const elapsed = Date.now() - game.last_move_time;
    const remaining = Math.max(0, duration - elapsed);

    if (timerRef.current) {
      timerRef.current.style.animation = "none";
      void timerRef.current.offsetWidth;
      timerRef.current.style.animation = "";
    }

    timerRef.current?.style.setProperty(
      "--timer-duration",
      `${remaining}ms`
    );

    timerRef.current?.style.setProperty(
      "--timer-progress",
      `${(remaining / duration) * 100}%`
    );
  }, [game?.last_move_time, game?.turn_timer]);


  useEffect(() => {
    document.documentElement.style.setProperty(
      "--game-direction",
      game?.direction
    );
  }, [game?.direction]);


  Object.assign(ui, {Game: game_ui})


  if (!game){
    return <Loader.FullScreen />
  }

  // return (
  //   <div className="card">

  //     <button
  //       onClick={leaveGame}
  //       disabled={leave_game_loading}
  //     >
  //       {leave_game_loading ? <Loader.Spinner /> : "Leave game"}
  //     </button>

  //     {game.state === "ended" &&
  //     <div className="game-over-overlay">
  //         <div className="game-over-content">
  //             <h1>Game Over</h1>

  //             <p>Winner:</p>

  //             <h2>{game.winner?.name}</h2>

  //             <p>ID: {game.winner?.id}</p>
  //         </div>
  //     </div>
  //     }


  //     <div className="card">
  //       <strong>Current card:</strong>
  //       <p>id: {game.current_card.id}</p>
  //       <p>type: {game.current_card.type}</p>
  //       <p>rednered_text: {game.current_card.rednered_text}</p>
  //       <p>base_color: {game.current_card.base_color}</p>
  //       <p>overlay_image: {game.current_card.overlay_image}</p>
  //       <p>choice: {game.current_card.choice?.ui_id ?? "No choice"}</p>

  //       <RenderCard 
  //         base_color={game.current_card.base_color} 
  //         overlay_image={game.current_card.overlay_image} 
  //         rednered_text={game.current_card.rednered_text} 
  //       />
  //     </div>


  //     <div className="timer-container">
  //         <div
  //             className="timer-bar"
  //             style={{
  //                 width: `${remainingPercent}%`
  //             }}
  //         />
  //     </div>


  //     <div className="card">
  //       <strong>Players:</strong>
  //       {game.players.map((player, p_index) => (
  //         <div 
  //           className="card"
  //           style={{
  //             border:session.player_id == player.id ? "1px solid lime" : "",
  //             outline:p_index == game.turn ? "1px solid orange" : "",
  //           }}
  //           key={player.id}
  //         >
  //           <p>id: {player.id}</p>
  //           <p>type: {player.type}</p>
  //           <p>name: {player.name}</p>
  //           <p>connection_status: {player.connection_status}</p>
  //           <p>game_status: {player.game_status}</p>
  //           <p>card_count: {player.card_count}</p>

  //           {player.deck && <>

  //           {game.cards_to_take > 0 &&
  //           <p style={{color:"red"}}>Danger, cards to take: {game.cards_to_take}</p>
  //           }

  //           {choiceComponent}

  //           <div className="flex">
  //             {player.deck.map((card, i) => (
  //               <RenderCard 
  //                 key={i}
  //                 base_color={card.base_color} 
  //                 overlay_image={card.overlay_image} 
  //                 rednered_text={card.rednered_text} 
  //                 width={80}
  //                 grayscale={card.allowed_to_play ? false : true}
  //                 onclick_enabled={true}
  //                 onclikc_callback={() => {
  //                   card.choice?.ui_id 
  //                     ? openChoiceUI(card.choice.ui_id, i)
  //                     : playCard(i)
  //                 }}
  //               />
  //             ))}
  //           </div>

  //           <button onClick={takeCard}>Take card</button>
  //           <button onClick={skipMove}>Skip turn</button>
  //           </>}

  //           {!player.deck &&
  //             <div className="flex">
  //               {Array.from({length:player.card_count}).map((_, i) => (
  //                 <RenderCard 
  //                   key={i}
  //                   overlay_image={"card_back_side.png"} 
  //                   width={80}
  //                 />
  //               ))}
  //             </div>
  //           }

  //         </div>
  //       ))}
  //     </div>

  //     <div className="card">
  //       <strong>Game info</strong>
  //       <div>
  //         <p>Game id: {game.id}</p>
  //         <p>Turn: {game.turn}</p>
  //         <p>Direction: {game.direction}</p>
  //         <p>Base color: {game.base_color}</p>
  //         <p>Cards to take: {game.cards_to_take}</p>
  //         <p>cards taken in this turn: {game.cards_taken_in_this_turn}</p>
  //       </div>
  //     </div>


  //     <div className="card">
  //       <strong>Game settings:</strong>
  //       <div>
  //         <p>Base colors: {game.base_colors.join(" - ")}</p>
  //         <p>Can draw when playable: {game.can_draw_when_playable}</p>
  //         <p>Max draw per turn: {game.max_draws_per_turn}</p>
  //         <p>Allow wild card stacking: {game.allow_wild_card_stacking}</p>
  //         <p>Wild cards must match: {game.wild_cards_must_match}</p>
  //         <p>Turn timer: {game.turn_timer}</p>
  //         <p>Last move time: {game.last_move_time}</p>
  //       </div>
  //     </div>


  //     <div className="card">
  //         <strong>Chat:</strong>
  //         <div 
  //             className="card" 
  //             style={{height:"200px", overflowY:"scroll"}}
  //             ref={chat_container}
  //         >
  //         {game.chat.map((msg, i) => (
  //           <p key={i} style={{color:"white"}}>{msg}</p>
  //         ))}
  //         </div>
          
  //         <div className="flex">
  //             <input 
  //                 placeholder="Chat" 
  //                 value={game_chat_input} 
  //                 onChange={(e)=>{setGameChatInput(e.target.value)}}
  //                 onKeyDown={(e) => {
  //                     if (e.key === 'Enter' && game_chat_input.trim() != "" && !game_chat_sending){
  //                         sendGameChatMassage();
  //                     }
  //                 }}
  //             ></input>
  //             <button 
  //                 onClick={sendGameChatMassage} 
  //                 disabled={game_chat_sending || game_chat_input.trim() == ""}
  //             >
  //                 {game_chat_sending ? <Loader.Spinner/> : "Send"}
  //             </button>
  //         </div>
  //     </div>

  //   </div>
  // )

  const thisPlayer = game.players.find((p) => p.id === session.player_id);
  const thisIdx = game.players.indexOf(thisPlayer);
  const thisTurn = game.turn == game.players.indexOf(thisPlayer);

  console.log("Rerendering.")
  console.log(handCardIds)

  return (
  <ui.FullScreen className="flex">

    <ui.SideBar 
      style={{"--bg-paint-texture": `url(${paintTexture})`,}}
    >
      {/* <h1 className="ui-text text-2xl truncate shrink-0">
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
      /> */}

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
        className="shrink-0"
        onClick={leaveGame}
      >
        Leave Game
      </ui.SideBar.Btn>
    </ui.SideBar>

    <main
      className="
        relative flex min-w-0 flex-1 flex-col
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

      {game.winner &&
        <ui.FullScreen 
          className="!absolute z-99 !bg-overlay
            ui-text flex justify-center items-center">
          <ui.Frame.SubBox
            className="!p-ui-lg flex flex-col gap-ui-md"
          >
            <p className="text-3xl">
              {game.winner?.name} WON!
            </p>
            <p>
              Game ended!<br/>
              This game will be automatically deleted after a short time.
            </p>
            <ui.Frame.ContrastBtn>
              View Game info
            </ui.Frame.ContrastBtn>
            <ui.Frame.ContrastBtn
              onClick={leaveGame}
            >
              {leave_game_loading
              ? <Loader.Spinner />
              : "Leave Game"
              }
            </ui.Frame.ContrastBtn>
          </ui.Frame.SubBox>
        </ui.FullScreen>
      }

      {choiceComponent}

      {game.players.length > 6 &&
      <div
        className="w-full flex-2 flex 
        flex-row justify-center items-center gap-ui-sm
        overflow-visible"
      >
          <PlayersStrip game={game} />
      </div>
      }

      <div
        className="relative
        w-full flex-12 flex flex-row justify-center items-center
        gap-[10px]"
      >

        <GameDirectionIndicator game={game} />

        {game.players.length <= 6 &&
          <PlayersCircle game={game} thisPlayer={thisPlayer} />
        }

        <AnimatePresence>
          {thisTurn &&
          <ui.Game.PlayerStripLabel
            player={game.players[thisIdx]}
            thisTurn={true}
            className="w-[150px] lg:w-[250px] shrink-0
              !absolute right-[5%] bottom-[7%]"

            initial={{x:200}}
            animate={{x:0}}
            exit={{x:200}}
          />
          }
        </AnimatePresence>

        <div
          className="w-[70px] aspect-9/16 relative 
            mx-ui-md cursor-pointer !z-1"
          onClick={takeCard}
        >
          <RenderCard
            width="100%"
            className="!absolute"
            overlay_image={"card_back_side.png"}
            animate={{rotate:6, x:3, y:2}}
          />
          <RenderCard
            width="100%"
            className="!absolute"
            overlay_image={"card_back_side.png"}
            animate={{rotate:-4, x:-5, y:5}}
          />
          <RenderCard
            width="100%"
            overlay_image={"card_back_side.png"}
          />
        </div>

        <div
          className="w-[120px] aspect-9/16 relative mx-ui-md !z-2"
        >
          <AnimatePresence mode="popLayout">

          {game.history.played_cards.slice(0, -1).map(([card, c_id], i) => (
            <RenderCard 
              key={c_id}
              className="!absolute"
              width="100%"
              base_color={card.base_color} 
              overlay_image={card.overlay_image} 
              rednered_text={card.rednered_text}
              style={{zIndex:i}}

              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: ((i - 2) * 4) % 10,
                  y: (-(i + 2) * 4) % 10,
                  x: (-(i) * 4) % 10,
              }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            drag
            dragSnapToOrigin
            />
          ))}
          <RenderCard
            key={game.history.total_placed_cards}
            width={"100%"}
            base_color={game.current_card.base_color} 
            overlay_image={game.current_card.overlay_image} 
            rednered_text={game.current_card.rednered_text} 
            style={{zIndex:game.history.total_placed_cards}}

            drag
            dragSnapToOrigin
            layout
            initial={{opacity:0.8, scale:0.8}}
            animate={{opacity:1, scale:1}}
          />
          
          </AnimatePresence>
        </div>

        <div
          className="w-[65px] aspect-1/1 mx-ui-sm !z-1"
        >
          <ui.Frame.Btn 
            className="w-full h-full cursor-pointer !rounded-[100%]"
            onClick={skipMove}
          >
            Skip
          </ui.Frame.Btn>
        </div>

        <div className="absolute left-0 bottom-[10px]
          flex flex-col gap-ui-xs ui-text">
            <AnimatePresence>
            {game.cards_to_take > 1 &&
              <motion.div
                className="game-side-pannel-info !px-ui-sm"

                initial={{x:-100}}
                animate={{x:0}}
                exit={{x:-100}}
              >
                <p style={{color:"#d04040"}}>Danger!</p>
                Cards to take: &nbsp; {game.cards_to_take}
              </motion.div>
            }
            {game.max_draws_per_turn > 0 &&
              game.cards_taken_in_this_turn > 0 &&
              <motion.div
                className="game-side-pannel-info"

                initial={{x:-200}}
                animate={{x:0}}
                exit={{x:-200}}
              >
                Cards taken: &nbsp;
                <span  style={{color:
                  game.cards_taken_in_this_turn == game.max_draws_per_turn
                  ? "#d04040" : ""}}>
                  {game.cards_taken_in_this_turn}/
                  {game.max_draws_per_turn}
                </span>
              </motion.div>
            }
            </AnimatePresence>
        </div>

      </div>

      {game.turn_timer !== "infinite" &&
        <div className="game-timer-track">
          <div
            ref={timerRef}
            className="game-timer-fill"
          />
        </div>
      }

      <div className="flex-3 min-w-0 w-full flex justify-center 
            main-game-hand-holder">
        <div className="relative w-full min-w-0 ">

          <div className="absolute left-0 top-0 bottom-0 z-99 pointer-events-none">
            <div className="game-hand-left-gradiant h-full" />
          </div>
          <div className="absolute right-0 top-0 bottom-0 z-99 pointer-events-none">
            <div className="game-hand-right-gradiant h-full" />
          </div>

          <div
            className="h-full overflow-x-scroll scrollbar-none"
            onWheel={(e) => {
              const el = e.currentTarget;
              el.scrollBy({
                left: e.deltaY,
                behavior: "smooth"
              });
            }}

            onPointerDown={(e) => {
              const el = e.currentTarget;

              startX.current = e.clientX;
              startScrollLeft.current = el.scrollLeft;
              isScrolling.current = false;

              holdTimer.current = setTimeout(() => {
                isScrolling.current = true;
                el.setPointerCapture(e.pointerId);
              }, 100);
            }}
            onPointerMove={(e) => {
              if (!isScrolling.current) return;

              e.currentTarget.scrollLeft =
                startScrollLeft.current - (e.clientX - startX.current);
            }}
            onPointerUp={() => {
              clearTimeout(holdTimer.current);
              isScrolling.current = false;
            }}
            onPointerCancel={() => {
              clearTimeout(holdTimer.current);
              isScrolling.current = false;
            }}
          >
            <div className="flex h-full w-max min-w-full flex-row justify-center items-center px-[100px]">
              <AnimatePresence mode="popLayout">
                {thisPlayer.deck.map((card, i) => {
                  if (handCardIds.current.length < thisPlayer.deck.length)
                    handCardIds.current.push(generateId())
                  
                  return(
                    <RenderCard 
                      key={handCardIds.current[i]}
                      className="shrink-0"
                      base_color={card.base_color} 
                      overlay_image={card.overlay_image} 
                      rednered_text={card.rednered_text} 
                      width={80}
                      grayscale={card.allowed_to_play ? false : true}
                      onclick_enabled={thisTurn && card.allowed_to_play}
                      onclikc_callback={() => {
                        card.choice?.ui_id 
                          ? openChoiceUI(card.choice.ui_id, i)
                          : playCard(i)
                      }}
                      style={{
                        marginLeft:`-${
                          Math.min(25, thisPlayer.deck.length*3)
                        }px`,
                        zIndex:i,
                      }}
                      rainbow={thisTurn && card.type == "wild" && card.allowed_to_play}

                      // layout
                      initial={{scale:0.7 ,opacity:0.7, y:20}}
                      animate={{opacity:1, y:card.allowed_to_play?0:3, scale: 1,}}
                      exit={{scale:0.7, opacity:0.7, y:20}}
                      whileHover={{y:card.allowed_to_play ? -5 : 3}}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

    </main>

  </ui.FullScreen>
  )
}


export default Game
