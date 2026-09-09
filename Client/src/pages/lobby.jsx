import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import * as SocketAPI from "../api/socket_handler"
import { useNotification } from "../helpers/context/notification";
import { useApp } from "../helpers/context/app_provider"

import SpinnerLoader from "../helpers/loaders/inside_spinner1"
import Skeleton from "react-loading-skeleton";
import { useCountdown } from "../helpers/utils/timer_hooks";


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


    async function loadLobby(show_notifications=true) {
        setLobby(null);
        const result = await SocketAPI.loadLobby();

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

        setLobby(result.lobby);
        console.log(result)
    }

    useEffect(() => {
        loadLobby();
    }, []);

  
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

  function KickTimer({target_time}){
    const time_left = useCountdown(target_time);
    return <p>Kicking in {time_left}</p>
  }


  useEffect(() => {
    if (isNameInputInitLoad.current){
        isNameInputInitLoad.current = false;
        return;
    }

    const timeout = setTimeout(async () => {
        setNameInputLoading(true)
        const result = await SocketAPI.setPlayerName(nameInputValue);
        setNameInputLoading(false)

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
        console.log(result);
        
        if (result.error){

            showNotification({
                text: `Error changing settings: ${result.msg}. Syncing lobby...`,
                type: "error",
            });
            
            loadLobby(false);
        }

    }


  if (!lobby){
    return (
      <Skeleton />
    )
  }

  return (
    <div className="card">

        <input 
            className="name-input" 
            placeholder="Enter your name" 
            onChange={(e) => setNameInputValue(e.target.value)} 
            value={nameInputValue}
        />

        <p>
        You'll appear as{" "}
        {nameInputLoading
            ? <Skeleton inline width={90} />
            : session.player_name
        }
        </p>

        <button onClick={leaveLobbyBtn}>
            {leave_lobby_loading ? <SpinnerLoader /> : "Leave Lobby"}
        </button>


        <p>Lobby id: {lobby.id}</p>
        <p>Owner id: {lobby.owner}</p>


        <div className="card">
            <strong>Players:</strong>
            {Object.entries(lobby.players).map(([id, desc]) => (
                <div key={id} className="flex gap-3">

                    <p>Name: {desc.name}</p>
                    <p>Status: {desc.status}</p>

                    {desc.disconnect_expires_at ? 
                    <KickTimer target_time={desc.disconnect_expires_at} />
                    : <></>}

                    {session.player_id == lobby.owner && id != lobby.owner ? (
                        <button 
                        onClick={() => kickPlayer(id)}
                        disabled={kick_player_loading!=null}
                        >
                            {kick_player_loading == id ? <SpinnerLoader /> : "Kick"}
                        </button>
                    ) : <></>}

                    {id == lobby.owner ? <p>👑</p> : <></>}

                </div>
            ))}
        </div>


        {lobby.owner == session.player_id ? 
        (<>
          <div className="card">
            <strong>Game settings:</strong>

            <div className="card gap-1">
                <strong>Card types:</strong>
                {Object.entries(lobby.game_options.card_objects).map(([card_id, card_desc]) => {
                    const selected =lobby.game_options.selected_card_objects.includes(card_id);

                    return (
                        <button
                            key={card_id}
                            className="flex"
                            style={
                                {border: `1px solid ${selected ? "lime" : "grey"}`}
                            }
                            onClick={() => {
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
                        >
                            {card_desc}
                        </button>
                    );
                }
            )}
            </div>

            <div className="card">
                <strong>Bots:</strong>
                {lobby.game_options.bots.map((bot_name, i) => (
                <div className="flex gap-3" key={i}>
                    <p>{bot_name}</p>
                    <button 
                        style={{color:"red"}}
                        onClick={() => {
                            const new_bot_names = [...lobby.game_options.bots];
                            new_bot_names.splice(i, 1);
                            setGameOptions("bots", new_bot_names)
                        }}
                    >
                        Remove
                    </button>
                </div>
                ))}
                <strong>Add bot:</strong>
                <input 
                    placeholder="bot name"
                    value={bot_name_input}
                    onChange={(e) => {setBotNameInput(e.target.value)}}
                ></input>
                <button
                    onClick={() => {
                        if (bot_name_input.trim() == ""){
                            showNotification({
                                type:"warning",
                                text:"Please enter a name first.",
                            })
                            return;
                        }
                        const this_name = bot_name_input;
                        setBotNameInput("");
                        const new_bot_names = [...lobby.game_options.bots];
                        new_bot_names.push(this_name);
                        setGameOptions("bots", new_bot_names);
                    }}
                >
                    Add new bot
                </button>
            </div>

            <div className="card">
                <strong>Other options:</strong>

                <div className="flex gap-3">
                    <label>
                        Initial cards:
                    </label>

                    <select
                        value={lobby.game_options.init_card_count}
                        onChange={(e) =>
                            setGameOptions(
                                "init_card_count",
                                Number(e.target.value)
                            )
                        }
                    >
                        {Array.from({ length: 13 }, (_, i) => i + 3).map(count => (
                            <option key={count} value={count}>
                                {count}
                            </option>
                        ))}
                    </select>
                </div>


                <div className="flex gap-3">
                    <label>
                        Allow skip move:
                    </label>

                    <input
                        type="checkbox"
                        checked={lobby.game_options.allowed_to_skip_move}
                        onChange={(e) =>
                            setGameOptions(
                                "allowed_to_skip_move",
                                e.target.checked
                            )
                        }
                    />
                </div>


                <div className="flex gap-3">
                    <label>
                        Max card takes:
                    </label>

                    <select
                        value={lobby.game_options.max_card_takes}
                        onChange={(e) =>
                            setGameOptions(
                                "max_card_takes",
                                Number(e.target.value)
                            )
                        }
                    >
                        {Array.from({ length: 11 }, (_, i) => i).map(count => (
                            <option key={count} value={count}>
                                {count}
                            </option>
                        ))}
                    </select>
                </div>


                <div className="flex gap-3">
                    <label>
                        Allow wild card stacking:
                    </label>

                    <input
                        type="checkbox"
                        checked={lobby.game_options.allow_wild_card_stacking}
                        onChange={(e) =>
                            setGameOptions(
                                "allow_wild_card_stacking",
                                e.target.checked
                            )
                        }
                    />
                </div>


                <div className="flex gap-3">
                    <label>
                        Wild cards must match:
                    </label>

                    <input
                        type="checkbox"
                        checked={lobby.game_options.wild_cards_must_match}
                        onChange={(e) =>
                            setGameOptions(
                                "wild_cards_must_match",
                                e.target.checked
                            )
                        }
                    />
                </div>


                <div className="flex gap-3">
                    <label>
                        Turn timer:
                    </label>

                    <select
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
                        {[5, 10, 15, 20, 25, 30, 45, 60].map(seconds => (
                            <option key={seconds} value={seconds}>
                                {seconds} seconds
                            </option>
                        ))}
                    </select>
                </div>
            </div>

          </div>
        </>) 
        : 
        (<>
          <div className="card">
            <strong>Game settings:</strong>

            <div className="card gap-1">
                <strong>Card types:</strong>
                {Object.entries(lobby.game_options.card_objects).map(([card_id, card_desc]) => {
                    const selected =lobby.game_options.selected_card_objects.includes(card_id);

                    return (
                        <button
                            key={card_id}
                            className="flex"
                            style={
                                {border: `1px solid ${selected ? "lime" : "grey"}`}
                            }
                        >
                            {card_desc}
                        </button>
                    );
                }
            )}
            </div>

            <div className="card">
                <strong>Bots:</strong>
                {lobby.game_options.bots.map((bot_name, i) => (
                <div key={i}>{bot_name}</div>
                ))}
            </div>

            <div className="card">
                <strong>Other options:</strong>
                <li>Initial cards: {lobby.game_options.init_card_count}</li>
                <li>Allow skip move: {lobby.game_options.allowed_to_skip_move ? 'Yes' : 'No'}</li>
                <li>Max card takes: {lobby.game_options.max_card_takes}</li>
                <li>Allow wild card stacking: {lobby.game_options.allow_wild_card_stacking ? 'Yes' : 'No'}</li>
                <li>Wild cards must match: {lobby.game_options.wild_cards_must_match ? 'Yes' : 'No'}</li>
                <li>Turn timer: {lobby.game_options.turn_timer} seconds</li>
            </div>

          </div>
        </>)
        }

    </div>
  );
}


export default Lobby;
