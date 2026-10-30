import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import * as SocketAPI from "../api/socket_handler"
import { useNotification } from "../utils/context/notification";
import { useApp } from "../utils/context/app_provider"

import { motion, AnimatePresence, scale } from "motion/react";
import confetti from "canvas-confetti";
import ui from "../components/shared/_ui"
import game_ui from "../components/game/game_ui"
import RenderCard from "../components/game/render_card"
import Loader from "../components/loaders/_loaders"
import Skeleton from "react-loading-skeleton";
import UiIdMapper from "../components/game/ui_choices/map_ui_id"
import PopupMapper from "../components/game/popups/_popups"


Object.assign(ui, {Game: game_ui})


function PlayersStrip({game, sideLength=2}){
  const labels = []
  for (let i=-sideLength; i<=sideLength; i++){
    const thisPlayer = game.players[
      ((game.turn - i) % game.players.length
      + game.players.length) % game.players.length
    ];
  
    labels.push(
      <motion.div
        key={thisPlayer.id}
        layout="position"
        className="
          w-[150px] lg:w-[250px] xl:w-[350px]
          shrink-0
        "
        transition={{
          layout: {
            duration: 0.3,
            ease: "easeOut",
          },
        }}
      >
        <ui.Game.PlayerStripLabel
          player={thisPlayer}
          distance={i}
          className="w-full"
          thisTurn={i === 0}
          blockedCount={game.effects_data?.skip_blocked_players?.[game.players.indexOf(thisPlayer)] ?? 0}
          showTimer={game.turn_timer !== "infinite"}

          initial={{
            opacity: 0,
            scale: 0.7,
          }}
          animate={{
            opacity: 1 - Math.abs(i) * 0.1,
            scale: 1 - Math.abs(i) * 0.1,
          }}
          exit={{
            opacity: 0,
            scale: 0.5,
          }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
        />
      </motion.div>
    );


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
        winner={game.winner}
        showTimer={game.turn_timer !== "infinite"}
        blockedCount={game.effects_data?.skip_blocked_players?.[(thisIdx+1)%playersLen] ?? 0}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute left-[50%] top-[7%] -translate-x-1/2"
        drag
        dragSnapToOrigin
      />
    </>)
  if (game.players.length == 3)
    return (<>
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+1)%playersLen]}
        thisTurn={(thisIdx+1)%playersLen == game.turn}
        winner={game.winner}
        showTimer={game.turn_timer !== "infinite"}
        blockedCount={game.effects_data?.skip_blocked_players?.[(thisIdx+1)%playersLen] ?? 0}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute left-[5%] top-[12%]"
        drag
        dragSnapToOrigin
      />
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+2)%playersLen]}
        thisTurn={(thisIdx+2)%playersLen == game.turn}
        winner={game.winner}
        showTimer={game.turn_timer !== "infinite"}
        blockedCount={game.effects_data?.skip_blocked_players?.[(thisIdx+2)%playersLen] ?? 0}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute right-[5%] top-[12%]"
        drag
        dragSnapToOrigin
      />
    </>)
  if (game.players.length == 4)
    return (<>
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+1)%playersLen]}
        thisTurn={(thisIdx+1)%playersLen == game.turn}
        winner={game.winner}
        showTimer={game.turn_timer !== "infinite"}
        blockedCount={game.effects_data?.skip_blocked_players?.[(thisIdx+1)%playersLen] ?? 0}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute left-[5%] top-[15%]"
        drag
        dragSnapToOrigin
      />
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+2)%playersLen]}
        thisTurn={(thisIdx+2)%playersLen == game.turn}
        winner={game.winner}
        showTimer={game.turn_timer !== "infinite"}
        blockedCount={game.effects_data?.skip_blocked_players?.[(thisIdx+2)%playersLen] ?? 0}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute left-[50%] top-[2%] sm:top-[7%] -translate-x-1/2"
        drag
        dragSnapToOrigin
      />
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+3)%playersLen]}
        thisTurn={(thisIdx+3)%playersLen == game.turn}
        winner={game.winner}
        showTimer={game.turn_timer !== "infinite"}
        blockedCount={game.effects_data?.skip_blocked_players?.[(thisIdx+3)%playersLen] ?? 0}
        className="w-[150px] lg:w-[250px] shrink-0
          !absolute right-[5%] top-[15%]"
        drag
        dragSnapToOrigin
      />
    </>)
  if (game.players.length == 5)
    return (<>
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+1)%playersLen]}
        thisTurn={(thisIdx+1)%playersLen == game.turn}
        winner={game.winner}
        showTimer={game.turn_timer !== "infinite"}
        blockedCount={game.effects_data?.skip_blocked_players?.[(thisIdx+1)%playersLen] ?? 0}
        className="w-[125px] xs:w-[150px] lg:w-[250px] shrink-0
          !absolute left-[5%] top-[22%]"
        drag
        dragSnapToOrigin
      />
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+2)%playersLen]}
        thisTurn={(thisIdx+2)%playersLen == game.turn}
        winner={game.winner}
        showTimer={game.turn_timer !== "infinite"}
        blockedCount={game.effects_data?.skip_blocked_players?.[(thisIdx+2)%playersLen] ?? 0}
        className="w-[125px] xs:w-[150px] lg:w-[250px] shrink-0
          !absolute left-[33%] top-[7%] -translate-x-1/2"
        drag
        dragSnapToOrigin
      />
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+3)%playersLen]}
        thisTurn={(thisIdx+3)%playersLen == game.turn}
        winner={game.winner}
        showTimer={game.turn_timer !== "infinite"}
        blockedCount={game.effects_data?.skip_blocked_players?.[(thisIdx+3)%playersLen] ?? 0}
        className="w-[125px] xs:w-[150px] lg:w-[250px] shrink-0
          !absolute left-[66%] top-[7%] -translate-x-1/2"
        drag
        dragSnapToOrigin
      />
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+4)%playersLen]}
        thisTurn={(thisIdx+4)%playersLen == game.turn}
        winner={game.winner}
        showTimer={game.turn_timer !== "infinite"}
        blockedCount={game.effects_data?.skip_blocked_players?.[(thisIdx+4)%playersLen] ?? 0}
        className="w-[125px] xs:w-[150px] lg:w-[250px] shrink-0
          !absolute right-[5%] top-[22%]"
        drag
        dragSnapToOrigin
      />
    </>)
  if (game.players.length == 6)
    return (<>
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+1)%playersLen]}
        thisTurn={(thisIdx+1)%playersLen == game.turn}
        winner={game.winner}
        showTimer={game.turn_timer !== "infinite"}
        blockedCount={game.effects_data?.skip_blocked_players?.[(thisIdx+1)%playersLen] ?? 0}
        className="w-[125px] xs:w-[150px] lg:w-[250px] shrink-0
          !absolute left-[5%] top-[66%]"
        drag
        dragSnapToOrigin
      />
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+2)%playersLen]}
        thisTurn={(thisIdx+2)%playersLen == game.turn}
        winner={game.winner}
        showTimer={game.turn_timer !== "infinite"}
        blockedCount={game.effects_data?.skip_blocked_players?.[(thisIdx+2)%playersLen] ?? 0}
        className="w-[125px] xs:w-[150px] lg:w-[250px] shrink-0
          !absolute left-[5%] top-[18%]"
        drag
        dragSnapToOrigin
      />
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+3)%playersLen]}
        thisTurn={(thisIdx+3)%playersLen == game.turn}
        winner={game.winner}
        showTimer={game.turn_timer !== "infinite"}
        blockedCount={game.effects_data?.skip_blocked_players?.[(thisIdx+3)%playersLen] ?? 0}
        className="w-[125px] xs:w-[150px] lg:w-[250px] shrink-0
          !absolute left-[50%] top-[3%] -translate-x-1/2"
        drag
        dragSnapToOrigin
      />
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+4)%playersLen]}
        thisTurn={(thisIdx+4)%playersLen == game.turn}
        winner={game.winner}
        showTimer={game.turn_timer !== "infinite"}
        blockedCount={game.effects_data?.skip_blocked_players?.[(thisIdx+4)%playersLen] ?? 0}
        className="w-[125px] xs:w-[150px] lg:w-[250px] shrink-0
          !absolute right-[5%] top-[18%]"
        drag
        dragSnapToOrigin
      />
      <ui.Game.PlayerStripLabel
        player={game.players[(thisIdx+5)%playersLen]}
        thisTurn={(thisIdx+5)%playersLen == game.turn}
        winner={game.winner}
        showTimer={game.turn_timer !== "infinite"}
        blockedCount={game.effects_data?.skip_blocked_players?.[(thisIdx+5)%playersLen] ?? 0}
        className="w-[125px] xs:w-[150px] lg:w-[250px] shrink-0
          !absolute right-[5%] top-[66%]"
        drag
        dragSnapToOrigin
      />
    </>)
}



function GameDirectionIndicator({ game }) {
  return (
    <motion.div
      className="absolute"
      initial={{ rotateY: game.direction === -1 ? 180 : 0 }}
      animate={{ rotateY: game.direction === -1 ? 180 : 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <ui.Logo
        id="GameDirectionArrow"
        className="direction !h-[18rem]"
        color="var(--game-base-color)"
      />
    </motion.div>
  );
}



function ConnectionDetailsComponent(){
  const [connectionPing, setConnectionPing] = useState("-")
  const [connectionQuality, setConnectionQuality] = useState("-")
  const [connectionQualityColor, setConnectionQualityColor] = useState("-")

    function updateConectionQualityFromPing(ping){
      if (ping < 30) {
          setConnectionQuality("Excellent");
          setConnectionQualityColor("#22C55E");
      }
      else if (ping < 60) {
          setConnectionQuality("Great");
          setConnectionQualityColor("#84CC16");
      }
      else if (ping < 100) {
          setConnectionQuality("Good");
          setConnectionQualityColor("#EAB308");
      }
      else if (ping < 150) {
          setConnectionQuality("Fair");
          setConnectionQualityColor("#F59E0B");
      }
      else if (ping < 250) {
          setConnectionQuality("Poor");
          setConnectionQualityColor("#F97316");
      }
      else {
          setConnectionQuality("Very Poor");
          setConnectionQualityColor("#EF4444");
      }
    }

  useEffect(() => {
    const checkPing = async () => {
      const ping = await SocketAPI.getPing();
      setConnectionPing(ping);
      updateConectionQualityFromPing(ping);
    };

    checkPing();
    const interval = setInterval(checkPing, 10000);

    return () => clearInterval(interval);
  }, []);

  return (<>
    <p><span className="opacity-35">Quality: </span>
      <span style={{color:connectionQualityColor}}>{connectionQuality}</span>
    </p>
    <p><span className="opacity-35">Ping: </span>{connectionPing}ms</p>
  </>)
}


function SyncingIndicator({className}){
  return (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        fill="currentColor"
        className={"game-syncing-indcator " + className}
    >
        <path d="
            M 129 60
            C 190 25, 263 13, 329 39
            C 416 73, 473 151, 480 246
            C 481 261, 473 267, 464 256
            L 416 201
            C 362 147, 287 150, 210 182
            L 243 231
            C 248 239, 242 246, 233 244
            L 39 210
            C 31 209, 29 205, 32 197
            L 80 7
            C 83 -3, 89 -2, 94 6
            Z
        "/>
        <path d="
            M 383 452
            C 322 487, 249 499, 183 473
            C 96 439, 39 361, 32 266
            C 31 251, 39 245, 48 256
            L 96 311
            C 150 365, 225 362, 302 330
            L 269 281
            C 264 273, 270 266, 279 268
            L 473 302
            C 481 303, 483 307, 480 315
            L 432 505
            C 429 515, 423 514, 418 506
            Z
        "/>
    </svg>
  )
}



function Game(){
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { session, setSession, serverTimerOffset, runSyncSession } = useApp();
  const assets = ui.Assets();

  const [game, setGame] = useState(null);
  const gameRef = useRef(game);

  const [showSettings, setShowSettings] = useState(false);
  const [game_chat_input, setGameChatInput] = useState("");
  const [game_chat_sending, setGameChatSending] = useState(false);
  const chat_container = useRef(null);
  const [chatBoxOpen, setChatBoxOpen] = useState(true);
  const [playerInfoBoxOpen, setPlayerInfoBoxOpen] = useState(true);
  const [leave_game_loading, setLeaveGameLoading] = useState(false);
  const [choiceComponent, setChoiceComponent] = useState(null);
  const [popupComponent, setPopupComponent] = useState(null);
  const holdTimer = useRef(null);
  const isScrolling = useRef(false);
  const startX = useRef(0);
  const latestX = useRef(0);
  const startScrollLeft = useRef(0);
  const timerRef = useRef(null);
  const playedConfettiAnimation = useRef(false);
  const subBoxRef = useRef(null);
  const [inspectGameAfterWin, setInspectGameAfterWin] = useState(false);
  const [GameInfoBoxOpen, setGameInfoBoxOpen] = useState(false);
  const [hintBoxOpen, setHintBoxOpen] = useState(false);
  const [showChatIconNotif, setShowChatIconNotif] = useState(false)
  const hideChatIconTimeout = useRef(null);
  const [showSyncingIndicator, setShowSyncingIndicator] = useState(false);



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

      if(result.error) runSyncSession();

      if (result.redirect) {
        navigate(result.redirect, {replace:true});
        return;
      }

      setGame(result.game);
      console.log(result)
  }

  useEffect(() => {
    loadGame();

    SocketAPI.listenForSyncGame((data) => {
      console.log(data)
      setGame(data);
    })

    SocketAPI.listenForSyncGameProperty((data) => {
      setGame(prevGame => ({
        ...prevGame,
        [data.property]: data.value,
      }));

      if(data.property == "chat"){
        setShowChatIconNotif(true);
        clearTimeout(hideChatIconTimeout.current)
        hideChatIconTimeout.current = setTimeout(() => {
          setShowChatIconNotif(false);
        }, 1000)        
      }
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

      navigate("/", {replace:true});
    })

    SocketAPI.listenForGamePopup((data) => {
      const ThisPopup = PopupMapper[data.id];
      if (data.id == "spy-eye-result") 
        setPopupComponent(
          <ThisPopup 
            onClose={() => setPopupComponent(null)}
            game={gameRef.current}
            {...data}
          />
        )
    })

  }, []);


  useEffect(() => {
    gameRef.current = game;
  }, [game]);


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


  useEffect(() => {
    if (chat_container.current) {
      chat_container.current.scrollTo({
        top: chat_container.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [game?.chat, chatBoxOpen]);


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
    if (showSyncingIndicator) return
    setShowSyncingIndicator(true);

    const delayed = setTimeout(() => {
      const newGame = {...game};
      const thisCard = thisPlayer.deck[card_index];
      newGame.current_card = thisCard;
      if(thisCard.base_color) newGame.base_color = thisCard.base_color;
      thisPlayer.deck.splice(card_index, 1);
      setGame((prev) => newGame)
    }, 150);

    const result = await SocketAPI.playCard(card_index, choice);

    clearTimeout(delayed);
    setShowSyncingIndicator(false);

    if (result.error){
      showNotification({
          text: result.msg,
          type: result.error ? "error" : "success",
      });
      loadGame();
    }
  }

  async function skipMove() {
    if (showSyncingIndicator) return
    setShowSyncingIndicator(true);

    const delayed = setTimeout(() => {
      setGame((prev)=>({
        ...prev, 
        turn:(prev.turn+prev.direction+prev.players.length)%prev.players.length,
        last_move_time:Date.now()+serverTimerOffset,
      }))
    }, 150)

    const result = await SocketAPI.skipMove();

    clearTimeout(delayed);
    setShowSyncingIndicator(false);

    if (result.error){
      showNotification({
          text: result.msg,
          type: result.error ? "error" : "success",
      });
      loadGame();
    }
  }

  async function takeCard() {
    if (showSyncingIndicator) return
    setShowSyncingIndicator(true);

    const delayed = setTimeout(() => {
      if (game.cards_to_take > 0){
        for (let i=0; i<game.cards_to_take; i++){
          game.players[game.turn].deck.push({
            overlay_image: ["card_back_side"],
            uuid:generateId(),
          })
        }
      }
      else
        game.players[game.turn].deck.push({
          overlay_image: ["card_back_side"],
        })
      setGame((prev) => ({...prev,}))
    }, 150)

    const result = await SocketAPI.takeCard();

    clearTimeout(delayed)
    setShowSyncingIndicator(false);

    if (result.error){
      showNotification({
          text: result.msg,
          type: result.error ? "error" : "success",
      });
      loadGame();
    }
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
    const elapsed = Date.now() + serverTimerOffset - game.last_move_time;
    const remaining = Math.max(0, duration - elapsed);

    document.documentElement.style.setProperty("--timer-duration", `${remaining}ms`);
    document.documentElement.style.setProperty("--timer-progress",`${(remaining / duration) * 100}%`);

    function restartAnimation(element) {
        element.style.animation = "none";
        void element.offsetWidth;
        element.style.animation = "";
    }
    if (timerRef.current) {
        restartAnimation(timerRef.current);
    }
    document
        .querySelectorAll(".game-strip-label-card-count")
        .forEach(restartAnimation);

  }, [game?.last_move_time, game?.turn_timer]);


  useEffect(() => {
    document.documentElement.style.setProperty(
      "--game-direction",
      game?.direction
    );
  }, [game?.direction]);


  useEffect(() => {
    setChoiceComponent(null);
  }, [game?.turn]);


  function gameEndedConfettiAnimation() {
      if (playedConfettiAnimation.current) return true;

      const rect = subBoxRef.current?.getBoundingClientRect();

      if (!rect) return true;

      confetti({
          particleCount: 100,
          spread: 80,
          startVelocity: 35,
          gravity: 1,
          colors: [
              "#f76c57",
              "#58ed80",
              "#34a8eb",
              "#ede158",
              "#b67130",
          ],
          origin: {
              x: (rect.left + rect.width / 2) / window.innerWidth,
              y: (rect.top + rect.height / 2) / window.innerHeight,
          },
      });

      playedConfettiAnimation.current = true;
      return true;
  }



  if (!game) {
    return (
      <ui.FullScreen className="flex overflow-hidden">
        <ui.SideBar
          style={{ "--bg-paint-texture": `url(${assets.sideBarTexture})` }}
          className="flex flex-col gap-ui-md p-ui-md"
        >

          <div className="flex flex-col gap-ui-sm">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton circle width={32} height={32} />
                <div className="flex-1">
                  <Skeleton width="65%" />
                  <Skeleton width="35%" />
                </div>
              </div>
            ))}
          </div>

          <Skeleton height={150} />

          <Skeleton height={30} />
          <Skeleton height={30} />
          <Skeleton height={30} />

        </ui.SideBar>

        <main
          className="
            relative flex min-w-0 flex-1 flex-col
            items-center justify-center overflow-hidden
            bg-cover bg-center
            bg-[image:var(--bg-mobile)]
            md:bg-[image:var(--bg-desktop)]
          "
          style={{
            "--bg-mobile": `url(${assets.bgMobile})`,
            "--bg-desktop": `url(${assets.bgLandscape})`,
          }}
        >
          <div className="absolute top-[8%] flex gap-ui-md">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton circle width={36} height={36} />
                <div>
                  <Skeleton width={60} />
                  <Skeleton width={38} />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-5">
            <Skeleton
              width={70}
              height={124}
              borderRadius={12}
            />

            <Skeleton
              width={120}
              height={200}
              borderRadius={16}
            />

            <Skeleton
              width={65}
              height={65}
              borderRadius={16}
            />
          </div>

          <div className="
            absolute bottom-[7%] left-1/2 -translate-x-1/2
            flex items-end justify-center
          ">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className="-mx-2"
                style={{
                  transform: `translateY(${Math.abs(i - 3) * 5}px)
                    rotate(${(i - 3) * 5}deg)`,
                  zIndex: i,
                }}
              >
                <Skeleton
                  width={75}
                  height={125}
                  borderRadius={12}
                />
              </div>
            ))}
          </div>
        </main>
      </ui.FullScreen>
    );
  }


  const thisPlayer = game.players.find((p) => p.id === session.player_id);
  const thisIdx = game.players.indexOf(thisPlayer);
  const thisTurn = game.turn == game.players.indexOf(thisPlayer);
  const toPlayLen = thisPlayer.deck.filter(card => (card.allowed_to_play)).length;


  return (
  <ui.FullScreen className="flex">

    <ui.SideBar 
      style={{"--bg-paint-texture": `url(${assets.sideBarTexture})`,}}
    >

      {hintBoxOpen && <>
      <div
        className="ui-text text-lg opacity-70 flex flex-col
          min-h-22 max-h-22 overflow-hidden"
      >
        {!game.winner && <>
          {thisTurn 
          ? 
          <>
          {(() => {
            let skip_msg = "";
            if (game.cards_taken_in_this_turn > 0) 
              skip_msg = "You can skip your turn";
            else
              skip_msg = "Take at least one card to skip"
            if (!game.can_draw_when_playable && toPlayLen > 0)
              skip_msg = "Skip or draw not allowed, use your playable cards"

            if (game.cards_to_take > 0){
              return (<>
                  Danger mode! <br/>
                  {toPlayLen > 0 
                  ? `${toPlayLen} cards to play`
                  : `No playable card. Click on the deck to take the cards`}
              </>)
            }
            return (<>
                Your turn, Click on a card to play...<br/>
                {toPlayLen} cards are playable<br/>
                {skip_msg}
            </>)
          })()}
          </>
          : 
          <>
            {game.players[game.turn].name}'s turn...
          </>
          }
        </>}

        {game.winner && (
            <p>
                Game over.<br />
                {game.winner.name} has won. <br />
                Game will be deleted after&nbsp;
                <ui.Timer.Countdown
                    targetTime={
                        game.last_move_time +
                        game.finished_game_delete_timeout
                    }
                />
                s
            </p>
        )}
      </div>

      <ui.Frame.ContrastBtn
        onClick={() => setHintBoxOpen(false)}
      >
        Hide hints
      </ui.Frame.ContrastBtn>
      <ui.SideBar.Divider />
      </>}


      <ui.Frame.Btn 
        className="ui-text text-2xl truncate shrink-0
          w-full mb-ui-md"
        onClick={() => setPlayerInfoBoxOpen(prev => !prev)}
      >
        {playerInfoBoxOpen 
          ? <><ui.Logo id="player_avatar" /> Players <ui.Logo id="expand" /></>
          : <><ui.Logo id="player_avatar" /> Players <ui.Logo id="expand" className="rotate-180" /></>
        }
      </ui.Frame.Btn>

      <AnimatePresence>
      {playerInfoBoxOpen && game.players.map((player, i) => (
        <motion.div
          key={player.id}

          initial={{ height: 0,opacity:0}}
          animate={{ height: "auto",opacity:1}}
          exit={{ height: 0,opacity:0 }}
        >
          <ui.Game.PlayerLabel
            key={player.id}
            player={player}
            thisTurn={!game.winner && game.turn == i}
            winner={game.winner}
            activePlayer={player.id==thisPlayer.id}
            disconnected_at={player.disconnected_at}
            play_as_offline_after={game.play_as_offline_after}
            timerIsInfinite={game.turn_timer=="infinite"}
          />
        </motion.div>
      ))}
      </AnimatePresence>

      <ui.SideBar.Divider />

      <ui.Frame.Btn 
        className="ui-text text-2xl truncate shrink-0
          w-full mb-ui-md"
        onClick={() => setChatBoxOpen(prev => !prev)}
      >
        {chatBoxOpen
          ? <><ui.Logo id="chat" /> Chat <ui.Logo id="expand" /></>
          : <><ui.Logo id="chat" /> Chat <ui.Logo id="expand" className="rotate-180" /></>
        }
      </ui.Frame.Btn>

      <AnimatePresence>
      {chatBoxOpen &&
      <motion.div
        key="chatbox"
        className="relative"

        initial={{ height: 0,opacity:0}}
        animate={{ height: "auto",opacity:1}}
        exit={{ height: 0,opacity:0 }}
      >
      <ui.Frame.SubBox
        ref={chat_container}
        className="!p-ui-xs max-h-[400px] h-[400px] 
          ui-text game-theme-scrollbar !pb-15"
      >
        {game.chat.map((msg, i) => (
          <ui.Game.ChatMsg key={i} msg={msg} />
        ))}
        
        <div className="flex flex-row
          gap-ui-xs items-center absolute bottom-ui-md
          left-0 right-0 px-ui-md">

          <ui.Frame.ContrastInput 
            className="w-full"
            placeholder="Say something..." 
            value={game_chat_input} 
            onChange={(e)=>{setGameChatInput(e.target.value)}}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && game_chat_input.trim() != "" && !game_chat_sending){
                sendGameChatMassage();
              }
            }}
          />
          <ui.Frame.ContrastBtn
            className="relative"
            onClick={sendGameChatMassage} 
            disabled={game_chat_sending || game_chat_input.trim() == ""}                
          >
            {game_chat_sending 
              ? <Loader.Spinner/> 
              : <>
                <ui.Logo id="send" className="absolute top-1/2 left-1/2 -translate-1/2 !h-[1.5rem]" />
                <span className="opacity-0">.....</span>
                </>
            }
          </ui.Frame.ContrastBtn>

        </div>

      </ui.Frame.SubBox>
      </motion.div>
      }
      </AnimatePresence>


      <ui.SideBar.Divider />

      <div className="ui-text">
        <ui.Frame.Btn 
          className="ui-text text-2xl truncate shrink-0
            w-full mb-ui-md"
          onClick={() => setGameInfoBoxOpen(prev => !prev)}
        >
          {GameInfoBoxOpen
          ? <><ui.Logo id="info" className="!h-[1.5rem] -mb-[2px]" /> Game Info <ui.Logo id="expand" /></>
          : <><ui.Logo id="info" className="!h-[1.5rem] -mb-[2px]" /> Game Info <ui.Logo id="expand" className="rotate-180" /></>
          }
        </ui.Frame.Btn>

        <AnimatePresence>
        {GameInfoBoxOpen && 
        <motion.div
          key="game-info-box"
          initial={{ height: 0,opacity:0}}
          animate={{ height: "auto",opacity:1}}
          exit={{ height: 0,opacity:0 }}
        >
        <ui.Frame.SubBox
          className="!p-ui-xs"
        >
          <p style={{color:"var(--theme-accent)"}}>Connection:</p>
          <ConnectionDetailsComponent />
          
          <p style={{color:"var(--theme-accent)"}}>General:</p>
          <p><span className="opacity-35">Time passed: </span><ui.Timer.ElapsedTimeFormatted targetTime={game.created_at} /></p>
          <p><span className="opacity-35">Game Id: </span>{game.id}</p>
          <p><span className="opacity-35">Game State: </span>{game.state}</p>
          <p><span className="opacity-35">Total Placed Cards: </span>{game.history.total_placed_cards}</p>
          <p><span className="opacity-35">Winner: </span>{game.winner ? game.winner?.name : "No winner"}</p>
          
          <p style={{color:"var(--theme-accent)"}}>Settings:</p>
          <p><span className="opacity-35">Base colors: </span>{game.base_colors.join(", ")}</p>
          <p><span className="opacity-35">Turn timer: </span>{game.turn_timer}</p>
          <p><span className="opacity-35">Max Draws Per Turn: </span>{game.max_draws_per_turn ?? "Infinite"}</p>
          <p><span className="opacity-35">Wild card stacking: </span>{game.allow_wild_card_stacking ? "YES" : "NO"}</p>
          <p><span className="opacity-35">Same card type placement: </span>{game.allow_same_type_placement ? "YES" : "NO"}</p>
          <p><span className="opacity-35">Can draw when playable: </span>{game.can_draw_when_playable ? " YES" : "NO"}</p>
          <p><span className="opacity-35">Wild cards must match: </span>{game.wild_cards_must_match ? "YES" : "NO"}</p>
          <p><span className="opacity-35">Direction: </span>{game.direction == 1 ? "Clockwise" : "Counter-Clockwise"}</p>
        </ui.Frame.SubBox>
        </motion.div>
        }
      </AnimatePresence>

      </div>

      <ui.SideBar.Divider />

      <ui.SideBar.Btn 
        onClick={() => {navigate("/")}}
        className="shrink-0"
      >
        <ui.Logo id="home" /> 
        Home
      </ui.SideBar.Btn>
      {!hintBoxOpen &&
      <ui.SideBar.Btn 
        onClick={() => {setHintBoxOpen(true)}}
        className="shrink-0"
      >
        ? Show hints
      </ui.SideBar.Btn>
      }
      <ui.SideBar.Btn
        className="shrink-0"
        onClick={() => setShowSettings(true)}
      >
        <ui.Logo id="settings" />&nbsp;
        Settings
      </ui.SideBar.Btn>
      <ui.SideBar.Btn 
        className="shrink-0"
        onClick={() => {
            if(leave_game_loading) return
            leaveGame()
          }
        }
      >
        {leave_game_loading
          ? <Loader.Spinner />
          : <>
            <ui.Logo id="leave" /> 
            Leave Game
            </>
        }
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
        "--bg-mobile": `url(${assets.bgMobile})`,
        "--bg-desktop": `url(${assets.bgLandscape})`,
      }}
    >

      {showSettings &&
      <ui.Settings onClose={() => setShowSettings(false)} />
      }

      <AnimatePresence>
      {game.winner && !inspectGameAfterWin &&
        gameEndedConfettiAnimation() &&
        <ui.FullScreen 
          className="!absolute z-99 !bg-overlay
            ui-text flex justify-center items-center">
          <ui.Frame.SubBox
            ref={subBoxRef}
            className="!p-ui-lg flex flex-col gap-ui-md"
            initial={{scale:0.3, opacity:0.3}}
            animate={{scale:1, opacity:1}}
            exit={{scale:1, opacity:0}}
          >
            <p className="text-3xl">
              {
                game.winner.id == thisPlayer.id 
                ? `YOU WON!`
                : <>
                  {game.winner?.name} WON!
                  <ui.Logo id="winner_crown" />
                </>
              }
            </p>
            <p>
              Game ended!<br/>
              This game will be automatically deleted after a short time.
            </p>
            <ui.Frame.ContrastBtn
              onClick={() => setInspectGameAfterWin(true)}
            >
              <ui.Logo id="clock" />&nbsp;
              Inspect
            </ui.Frame.ContrastBtn>
            <ui.Frame.ContrastBtn
              onClick={leaveGame}
            >
              {leave_game_loading
              ? <Loader.Spinner />
              : <>
                <ui.Logo id="leave" />&nbsp;
                Leave Game
                </>
              }
            </ui.Frame.ContrastBtn>
          </ui.Frame.SubBox>
        </ui.FullScreen>
      }
      </AnimatePresence>

      {!game.winner && choiceComponent}

      {!game.winner && popupComponent}

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
        {showSyncingIndicator &&
        <motion.div
          className="absolute top-3 right-3"

          initial={{opacity:0}}
          animate={{opacity:1}}
          transition={{
              delay: 0.15,
              duration: 0.8,
              ease: "easeInOut",
          }}        
        >
          <SyncingIndicator 
            className="w-[40px]"
          />
        </motion.div>
        }
        </AnimatePresence>

        <AnimatePresence>
          {(thisTurn || game.winner) &&
          <ui.Game.PlayerStripLabel
            player={thisPlayer}
            thisTurn={true}
            winner={game.winner}
            showTimer={game.turn_timer !== "infinite"}
            
            className="w-[150px] lg:w-[250px] shrink-0
              !absolute right-[5%] bottom-[7%]"

            initial={{x:"150%"}}
            animate={{x:0}}
            exit={{x:"150%"}}
          />
          }
        </AnimatePresence>

        <AnimatePresence>
          {chatBoxOpen && showChatIconNotif &&
          <motion.div
            key="chat-icon"
            className="absolute top-20 left-3"
            initial={{ opacity:0}}
            animate={{ opacity:1}}
            exit={{ opacity:0}}
          >
            <ui.Frame.Label
              className="!p-1 relative
                flex justify-center items-center
                md:hidden cursor-pointer w-[40px] h-[40px]"
            >
              &nbsp;
              &nbsp;
              &nbsp;
              <ui.Logo 
                id="chat"
                className="!h-[1.5rem] absolute top-1/2 left-1/2 -translate-1/2"
              />
            </ui.Frame.Label>
          </motion.div>
          }
        </AnimatePresence>

        {(() => {
        const deckVariants = {
            initial: {},
            hover: {},
        };

        const cardVariants = [
            { rotate: 6, x: 3, y: 2 },
            { rotate: -4, x: -5, y: 5 },
            { rotate: 0, x: 0, y: 0 },
        ];

        const hoverCardVariants = [
            { rotate: 12, x: 12, y: -5 },
            { rotate: -10, x: -12, y: 2 },
            { rotate: 0, x: 0, y: 8 },
        ];

        return <motion.div
          className="w-[70px] aspect-9/16 relative
            mx-ui-md cursor-pointer !z-1"
          variants={deckVariants}
          initial="initial"
          whileHover="hover"
          onClick={() => {
            if (
              !thisTurn ||
              game.cards_taken_in_this_turn >= (game.max_draws_per_turn ?? Infinity) ||
              (!game.can_draw_when_playable && toPlayLen > 0)
            ) return;

            takeCard();
          }}
        >
            {cardVariants.map((style, i) => (
              <RenderCard
                key={i}
                width="100%"
                className={i < 2 ? "!absolute" : ""}
                overlay_image={["card_back_side"]}
                variants={{
                  initial: style,
                  hover: hoverCardVariants[i],
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 18,
                }}
              />
            ))}
        </motion.div>
        })()}

        <div
          className="w-[120px] aspect-9/16 relative mx-ui-md !z-2"
        >
          <AnimatePresence mode="popLayout">

          {game.history.played_cards.slice(0, -1).map((card, i) => (
            <RenderCard 
              key={card.uuid}
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
            initial={{opacity:0.8, scale:0.8}}
            animate={{opacity:1, scale:1}}
          />
          
          </AnimatePresence>
        </div>

        <div
          className="w-[65px] aspect-1/1 mx-ui-sm !z-1"
        >
          <ui.Frame.Btn 
            className="w-full h-full cursor-pointer !rounded-[100%]
              flex justify-center items-center"
            onClick={skipMove}
            disabled={
              !thisTurn ||
              game.cards_taken_in_this_turn == 0 ||
              game.cards_to_take > 0 ||
              (!game.can_draw_when_playable && toPlayLen>0)
            }
          >
            <ui.Logo id="skip" className="!h-[1.75rem]" />
          </ui.Frame.Btn>
        </div>

        <div className="absolute left-0 bottom-[10px]
          flex flex-col gap-ui-xs ui-text">
            <AnimatePresence>
            {game.cards_to_take > 1 && !game.winner &&
              <motion.div
                className="game-side-pannel-info !px-ui-sm"

                initial={{x:"-100%"}}
                animate={{x:0}}
                exit={{x:"-100%"}}
              >
                <p style={{color:"#d04040"}}>Danger!</p>
                Cards to take: &nbsp; {game.cards_to_take}
              </motion.div>
            }
            {game.cards_taken_in_this_turn > 0 &&
              thisTurn && !game.winner &&
              <motion.div
                className="game-side-pannel-info"

                initial={{x:-200}}
                animate={{x:0}}
                exit={{x:-200}}
              >
                Cards taken: &nbsp;
                {game.max_draws_per_turn
                ? <span  style={{color:
                  game.cards_taken_in_this_turn == game.max_draws_per_turn
                  ? "#d04040" : ""}}>
                  {game.cards_taken_in_this_turn}/
                  {game.max_draws_per_turn}
                </span>
                : <span>{game.cards_taken_in_this_turn}</span>
                }
              </motion.div>
            }
            {(game.effects_data?.skip_blocked_players?.[thisIdx] ?? 0) > 0 &&
              !game.winner &&
              <motion.div
                className="game-side-pannel-info"

                initial={{x:-200}}
                animate={{x:0}}
                exit={{x:-200}}
              >
                <div
                  className="w-auto h-[30px] flex relative"
                >
                  {Array.from({length:game.effects_data?.skip_blocked_players?.[thisIdx]}).map((_, i) => (
                    <ui.Logo 
                      key={i}
                      id="blocked" 
                      className="!h-full !w-full drop-shadow-img relative"
                      color="var(--theme-highlight)" 
                    />
                  ))}
                </div>
              </motion.div>
            }
            </AnimatePresence>
        </div>

      </div>

      {game.turn_timer !== "infinite" &&
        !game.winner &&
        <motion.div 
          className="game-timer-track"

          animate={{opacity:thisTurn ? 1 : 0.5}}
        >
          <div
            ref={timerRef}
            className="game-timer-fill"
          />
        </motion.div>
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
            className="h-full overflow-x-scroll !overflow-y-hidden scrollbar-none"
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
                latestX.current = e.clientX;
                startScrollLeft.current = el.scrollLeft;
                isScrolling.current = false;

                holdTimer.current = setTimeout(() => {
                    isScrolling.current = true;

                    // Use the latest recorded pointer position
                    startX.current = latestX.current;

                    el.setPointerCapture(e.pointerId);
                }, 100);
            }}
            onPointerMove={(e) => {
                latestX.current = e.clientX;

                if (!isScrolling.current) return;

                const dx = e.clientX - startX.current;
                e.currentTarget.scrollLeft = startScrollLeft.current - dx;
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
            <div className="relative flex h-full w-max min-w-full flex-row justify-center items-center px-[100px]">
              <AnimatePresence mode="popLayout">
                {thisPlayer.deck.map((card, i) => {
                  return(
                    <motion.div
                      key={card.uuid}
                      layout="position"
                      className="relative shrink-0"
                      style={{
                        marginLeft: `-${Math.min(25, thisPlayer.deck.length * 3)}px`,
                        zIndex: i,
                      }}
                      transition={{
                        layout: { duration: 0.3, ease: "easeOut" },
                      }}
                    >
                    <RenderCard 
                      className="shrink-0 
                        [@media(max-height:600px)]:max-w-[65px]"
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
                      rainbow={thisTurn && card.type == "wild" && card.allowed_to_play}

                      initial={{scale:0.7 ,opacity:0.7, y:20}}
                      animate={{opacity:card.allowed_to_play?1:0.8, y:card.allowed_to_play?-2:10, scale: 1,}}
                      exit={{scale:0.7, opacity:0.7, y:20}}
                      whileHover={{y:card.allowed_to_play ? -10 : 3,}}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    />
                    </motion.div>
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
