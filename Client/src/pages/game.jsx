import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import * as SocketAPI from "../api/socket_handler"
import { useNotification } from "../helpers/context/notification";
import { useApp } from "../helpers/context/app_provider"

import RenderCard from "../helpers/utils/render_card"
import SpinnerLoader from "../helpers/loaders/inside_spinner1"
import FullScreenLoader from "../helpers/loaders/fullscreen1";
import Skeleton from "react-loading-skeleton";


function Game(){
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { session, setSession } = useApp();

  const [game, setGame] = useState(null);

  const [game_chat_input, setGameChatInput] = useState("");
  const [game_chat_sending, setGameChatSending] = useState(false);
  const chat_container = useRef(null);
  const [leave_game_loading, setLeaveGameLoading] = useState(false);



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

  SocketAPI.listenForSyncGameProperty((data) => {
    console.log(data)
    setGame(prevGame => ({
      ...prevGame,
      [data.property]: data.value,
    }));
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
        <p>choice: {game.current_card.choice ?? "No choice"}</p>

        <RenderCard 
          base_color={game.current_card.base_color} 
          overlay_image={game.current_card.overlay_image} 
          rednered_text={game.current_card.rednered_text} 
        />
      </div>


      <div className="card">
        <strong>Players:</strong>
        {game.players.map((player) => (
          <div 
            className="card"
            style={{border:session.player_id == player.id ? "1px solid lime" : ""}}
            key={player.id}
          >
            <p>id: {player.id}</p>
            <p>type: {player.type}</p>
            <p>name: {player.name}</p>
            <p>connection_status: {player.connection_status}</p>
            <p>game_status: {player.game_status}</p>
            <p>card_count: {player.card_count}</p>

            {player.deck &&
            <div className="flex">
              {player.deck.map(card => (
                <RenderCard 
                  base_color={card.base_color} 
                  overlay_image={card.overlay_image} 
                  rednered_text={card.rednered_text} 
                  width={80}
                  grayscale={card.allowed_to_play ? false : true}
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
          <p>Allowed to skip move: {game.allowed_to_skip_move}</p>
          <p>Max card takes: {game.max_card_takes}</p>
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
