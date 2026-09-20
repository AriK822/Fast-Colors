import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import * as SocketAPI from "../api/socket_handler"
import { useNotification } from "../helpers/context/notification";
import { useApp } from "../helpers/context/app_provider"

import RenderCard from "../helpers/utils/render_card"
import SpinnerLoader from "../helpers/loaders/inside_spinner1"
import FullScreenLoader from "../helpers/loaders/fullscreen1";
import Skeleton from "react-loading-skeleton";
import UiIdMapper from "../helpers/ui_choices/map_ui_id"
import card from "../helpers/utils/render_card";


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

    if (result.redirect){
      navigate(result.redirect);
    }
  }


  async function playCard(card_index, choice=undefined) {
    const result = await SocketAPI.playCard(card_index, choice);

    showNotification({
        text: result.msg,
        type: result.error ? "error" : "success",
    });
  }

  async function skipMove() {
    const result = await SocketAPI.skipMove();

    showNotification({
        text: result.msg,
        type: result.error ? "error" : "success",
    });
  }

  async function takeCard() {
    const result = await SocketAPI.takeCard();

    showNotification({
        text: result.msg,
        type: result.error ? "error" : "success",
    });
  }

  function openChoiceUI(choice_ui_id, card_index){
    const ChoiceComponent = UiIdMapper[choice_ui_id];
    const onSelect = (choice_data) => {
      playCard(card_index, choice_data);
      setChoiceComponent(null);
    };
    setChoiceComponent(<ChoiceComponent game={game} onSelect={onSelect} />)
  }



  if (!game){
    return <FullScreenLoader />
  }

  return (
    <div className="card">

      <button
        onClick={leaveGame}
        disabled={leave_game_loading}
      >
        {leave_game_loading ? <SpinnerLoader /> : "Leave game"}
      </button>


      <div className="card">
        <strong>Current card:</strong>
        <p>id: {game.current_card.id}</p>
        <p>type: {game.current_card.type}</p>
        <p>rednered_text: {game.current_card.rednered_text}</p>
        <p>base_color: {game.current_card.base_color}</p>
        <p>overlay_image: {game.current_card.overlay_image}</p>
        <p>choice: {game.current_card.choice?.ui_id ?? "No choice"}</p>

        <RenderCard 
          base_color={game.current_card.base_color} 
          overlay_image={game.current_card.overlay_image} 
          rednered_text={game.current_card.rednered_text} 
        />
      </div>


      <div className="card">
        <strong>Players:</strong>
        {game.players.map((player, p_index) => (
          <div 
            className="card"
            style={{
              border:session.player_id == player.id ? "1px solid lime" : "",
              outline:p_index == game.turn ? "1px solid orange" : "",
            }}
            key={player.id}
          >
            <p>id: {player.id}</p>
            <p>type: {player.type}</p>
            <p>name: {player.name}</p>
            <p>connection_status: {player.connection_status}</p>
            <p>game_status: {player.game_status}</p>
            <p>card_count: {player.card_count}</p>

            {player.deck && <>

            {game.cards_to_take > 0 &&
            <p style={{color:"red"}}>Danger, cards to take: {game.cards_to_take}</p>
            }

            {choiceComponent}

            <div className="flex">
              {player.deck.map((card, i) => (
                <RenderCard 
                  key={i}
                  base_color={card.base_color} 
                  overlay_image={card.overlay_image} 
                  rednered_text={card.rednered_text} 
                  width={80}
                  grayscale={card.allowed_to_play ? false : true}
                  onclick_enabled={true}
                  onclikc_callback={() => {
                    card.choice?.ui_id 
                      ? openChoiceUI(card.choice.ui_id, i)
                      : playCard(i)
                  }}
                />
              ))}
            </div>

            <button onClick={takeCard}>Take card</button>
            <button onClick={skipMove}>Skip turn</button>
            </>}

            {!player.deck &&
              <div className="flex">
                {Array.from({length:player.card_count}).map((i) => (
                  <RenderCard 
                    key={i}
                    overlay_image={"card_back_side.png"} 
                    width={80}
                  />
                ))}
              </div>
            }

          </div>
        ))}
      </div>

      <div className="card">
        <strong>Game info</strong>
        <div>
          <p>Game id: {game.id}</p>
          <p>Turn: {game.turn}</p>
          <p>Direction: {game.direction}</p>
          <p>Base color: {game.base_color}</p>
          <p>Cards to take: {game.cards_to_take}</p>
          <p>cards taken in this turn: {game.cards_taken_in_this_turn}</p>
        </div>
      </div>


      <div className="card">
        <strong>Game settings:</strong>
        <div>
          <p>Base colors: {game.base_colors.join(" - ")}</p>
          <p>Can draw when playable: {game.can_draw_when_playable}</p>
          <p>Max draw per turn: {game.max_draws_per_turn}</p>
          <p>Allow wild card stacking: {game.allow_wild_card_stacking}</p>
          <p>Wild cards must match: {game.wild_cards_must_match}</p>
          <p>Turn timer: {game.turn_timer}</p>
          <p>Last move time: {game.last_move_time}</p>
        </div>
      </div>


      <div className="card">
          <strong>Chat:</strong>
          <div 
              className="card" 
              style={{height:"200px", overflowY:"scroll"}}
              ref={chat_container}
          >
          {game.chat.map((msg, i) => (
            <p key={i} style={{color:"white"}}>{msg}</p>
          ))}
          </div>
          
          <div className="flex">
              <input 
                  placeholder="Chat" 
                  value={game_chat_input} 
                  onChange={(e)=>{setGameChatInput(e.target.value)}}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter' && game_chat_input.trim() != "" && !game_chat_sending){
                          sendGameChatMassage();
                      }
                  }}
              ></input>
              <button 
                  onClick={sendGameChatMassage} 
                  disabled={game_chat_sending || game_chat_input.trim() == ""}
              >
                  {game_chat_sending ? <SpinnerLoader/> : "Send"}
              </button>
          </div>
      </div>

    </div>
  )
}


export default Game
