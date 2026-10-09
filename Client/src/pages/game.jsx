import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import * as SocketAPI from "../api/socket_handler"
import { useNotification } from "../utils/context/notification";
import { useApp } from "../utils/context/app_provider"

import ui from "../components/shared/_ui"
import game_ui from "../components/game/game_ui"
import RenderCard from "../components/game/render_card"
import Loader from "../components/loaders/_loaders"
import Skeleton from "react-loading-skeleton";
import UiIdMapper from "../components/game/ui_choices/map_ui_id"

import bgLandscape from "../assets_staging/bg1.png"
import bgMobile from "../assets_staging/bg2.png"
import paintTexture from "../assets_staging/t1.jpg"
import { AnimatePresence, scale } from "motion/react";



function PlayersStrip({game, sideLength=1}){
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
    setChoiceComponent(<ChoiceComponent game={game} onSelect={onSelect} />)
  }


  // useEffect(() => {
  //   if (!game){return}
  //     if (game.turn_timer === "infinite") {
  //         setRemainingPercent(100);
  //         return;
  //     }

  //     const totalTime = game.turn_timer * 1000;

  //     function updateTimer() {
  //         const elapsedTime = Date.now() - game.last_move_time;

  //         const remainingTime = Math.max(
  //             0,
  //             totalTime - elapsedTime
  //         );

  //         const percent = (remainingTime / totalTime) * 100;

  //         setRemainingPercent(percent);
  //     }

  //     updateTimer();

  //     const interval = setInterval(updateTimer, 50);

  //     return () => clearInterval(interval);
  // }, [game?.last_move_time, game?.turn_timer]);


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
  const thisTurn = game.turn == game.players.indexOf(thisPlayer);

  console.log("Rerendering.")

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
      <div
        className="w-full flex-2 flex 
        flex-row justify-center items-center gap-ui-sm
        overflow-visible"
      >
        <PlayersStrip game={game} />
      </div>

      <div
        className="relative
        w-full flex-12 flex flex-row justify-center items-center
        gap-[10px]"
      >

        <div
          className="w-[70px] aspect-9/16 relative 
            mx-ui-md cursor-pointer"
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
          className="w-[120px] aspect-9/16 relative mx-ui-md"
        >
          <AnimatePresence mode="popLayout">

          {game.history.played_cards.map(([card, c_id], i) => (
            <RenderCard 
              key={c_id}
              className="!absolute"
              width="100%"
              base_color={card.base_color} 
              overlay_image={card.overlay_image} 
              rednered_text={card.rednered_text}

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
            />
          ))}
          <RenderCard
            key={game.history.total_placed_cards+1}
            width={"100%"}
            base_color={game.current_card.base_color} 
            overlay_image={game.current_card.overlay_image} 
            rednered_text={game.current_card.rednered_text} 

            layout
            initial={{opacity:0.8, scale:0.8}}
            animate={{opacity:1, scale:1}}
          />
          
          </AnimatePresence>
        </div>

        <div
          className="w-[65px] aspect-1/1 mx-ui-sm"
        >
          <ui.Frame.Btn 
            className="w-full h-full cursor-pointer !rounded-[100%]"
            onClick={skipMove}
          >
            Skip
          </ui.Frame.Btn>
        </div>

      </div>
      <div
        className="flex-3 flex justify-center
          w-full lg:w-[80%]"
      >
        <div
          className="h-full overflow-y-auto scrollbar-none
            flex flex-row items-center px-[100px]"
          onWheel={(e) => {
              const el = e.currentTarget;
              el.scrollBy({
                  left: e.deltaY,
                  behavior: "smooth"
              });
          }}
        >
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

                  layout
                  initial={{scale:0.7, opacity:0.7, y:20}}
                  animate={{opacity:1, y:0,scale: 1,}}
                  exit={{scale:0.7, opacity:0.7, y:20}}
                  transition={{type:"linear"}}
                />
              )
            })}
          </AnimatePresence>
        </div>
      </div>

    </main>

  </ui.FullScreen>
  )
}


export default Game
