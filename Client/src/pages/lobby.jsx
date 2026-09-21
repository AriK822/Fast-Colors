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
  const chat_container = useRef(null);
  const [lobby_chat_input, setLobbyChatInput] = useState("");
  const [lobby_chat_sending, setLobbyChatSending] = useState(false);
  const [start_game_btn_loading, setStartGameBtnLoading] = useState(false);
  const [openNumsIndex, setOpenNumsIndex] = useState(null);


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
            chat_container.current.scrollTop = chat_container.current.scrollHeight;
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


    SocketAPI.listenForGameStart(() => {
        showNotification({
            text: "Game Started. Redirecting to game...",
            type: "success"
        })

        navigate("/game");
    })



  if (!lobby){
    return (
      <Skeleton />
    )
  }


  const limits = lobby.game_options.limits;


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
                    <p>Status: {desc.connection_status}</p>

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
        // Lobby owner settings
        (<>
          <div className="card">
            <strong>Game settings:</strong>

            <div className="card">
                <button 
                  onClick={() => {
                    setGameOptions("use_advanced_options", !lobby.game_options.use_advanced_options )
                  }}
                >
                    {lobby.game_options.use_advanced_options 
                        ? "Disable advanced options" 
                        : "Enable advanced options"
                    }
                </button>
                <br></br><br></br>


                {!lobby.game_options.use_advanced_options && 
                  Object.entries(lobby.game_options.card_objects).map(([card_id, card_desc]) => {
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


                {lobby.game_options.use_advanced_options && <>

                <strong>Base colors:</strong>
                  <div className="flex flex-col card gap-2">
                    {lobby.game_options.base_colors.map((b_color, i) => (
                        <div className="flex flex-row gap-2" key={i} >
                            <input 
                                type={"color"} 
                                value={b_color} 
                                style={{height:"50px"}}
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
                                onClick={() => {
                                    const new_colors = [...lobby.game_options.base_colors];
                                    new_colors.splice(i, 1);
                                    setGameOptions("base_colors", new_colors);
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <button 
                        onClick={() => {
                            const new_colors = [...lobby.game_options.base_colors];
                            new_colors.push(
                                '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')
                            )
                            setGameOptions("base_colors", new_colors);
                        }}
                    >
                        Add base color +
                    </button>
                  </div>

                  <strong>Card objects:</strong>
                  <div className="card">

                    {lobby.game_options.advanced_card_objects.map((card_obj, i) => (
                        <div key={i} className="flex flex-col gap-2 card">
                            <div className="flex flex-row gap-2">
                                <label>Type:</label>
                                <select
                                    value={card_obj.id}
                                    onChange={(e) => {
                                        const new_objects = [
                                            ...lobby.game_options.advanced_card_objects
                                        ];
                                        new_objects[i] = {
                                            ...new_objects[i],
                                            id: e.target.value,
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
                                            {c_desc}
                                        </option>
                                    ))}
                                </select>
                            </div>


                            <div className="flex flex-row gap-2">
                                <label>
                                    Weight: {card_obj.weight}
                                </label>

                                <input
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
                            </div>


                            {card_obj.id === "norm_base_cards" && (
                                <div className="flex flex-col gap-2">
                                    <p>Numbers: {String(card_obj.nums)}</p>
                                    <button
                                        onClick={() => {
                                            setOpenNumsIndex(
                                                openNumsIndex === i ? null : i
                                            );
                                        }}
                                    >
                                        Modify numbers
                                    </button>

                                    {openNumsIndex === i && (
                                        <div className="flex flex-col gap-2 card">

                                            <button
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


                                            <div className="flex flex-row flex-wrap gap-2">
                                                {Array.from(
                                                    { length: limits.max_norm_num-limits.min_norm_num+1 },
                                                    (_, index) => index + limits.min_norm_num
                                                ).map((num) => {

                                                    const isSelected =
                                                        card_obj.nums.includes(num);

                                                    return (
                                                        <button
                                                            key={num}
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


                            <button
                                onClick={() => {
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
                            </button>

                        </div>
                    ))}

                    <button
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
                    >
                    Add new object
                    </button>

                  </div>

                </>}
            </div>


            <div className="card">
                <strong>Bots:</strong>
                {lobby.game_options.bots.map((bot_name, i) => (
                <div className="flex gap-3" key={i}>
                    <p>{bot_name}</p>
                    <button 
                        style={{color:"orange"}}
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
                    disabled={
                        lobby.game_options.bots.length + 
                        Object.entries(lobby.players).length 
                        >= limits.max_total_game_players
                    }
                >
                    Add new bot
                </button>
            </div>

            <div className="card">
                <strong>Other options:</strong>

                <div className="flex gap-3">
                    <label>
                        Initial deck size:
                    </label>

                    <select
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
                                    {count}
                                </option>
                            ))
                        }
                    </select>
                </div>


                <div className="flex gap-3">
                    <label>
                        Can draw when playable:
                    </label>

                    <input
                        type="checkbox"
                        checked={lobby.game_options.can_draw_when_playable}
                        onChange={(e) =>
                            setGameOptions(
                                "can_draw_when_playable",
                                e.target.checked
                            )
                        }
                    />
                </div>


                <div className="flex gap-3">
                    <label>
                        Max draw per turn:
                    </label>

                    <select
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
                                    {count}
                                </option>
                            ))
                        }
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
                        {limits.turn_timers.map(seconds => (
                            <option key={seconds} value={seconds}>
                                {seconds} seconds
                            </option>
                        ))}
                    </select>
                </div>
            </div>

          </div>

          <button 
            className="w-full"
            style={{background:"lime", color:"black"}}
            onClick={startGame}
            disabled={!startGameValidation()[0] || start_game_btn_loading}
          >
            {start_game_btn_loading ? <SpinnerLoader/> : "Start Game"}
          </button>

            {
            !startGameValidation()[0] &&
            <p>{startGameValidation()[1]}</p>
            }

            {
            Object.entries(lobby.players).some(([p_id, p_info]) => p_info.status == "offline") &&
            <p style={{color:"orange"}}>
                Warning: some players appear to be offline. 
                You wont be able to kick them after starting the game
            </p>
            }
        </>) 




        : 
        // Non owner clients



        (<>
          <div className="card">
            <strong>Game settings:</strong>

            <div className="card gap-2">
                <strong>Game settings:</strong>

                {!lobby.game_options.use_advanced_options && (
                    <>
                        <strong>Card types:</strong>

                        <div className="flex flex-col gap-1">
                            {Object.entries(lobby.game_options.card_objects).map(
                                ([card_id, card_desc]) => {
                                    const selected =
                                        lobby.game_options.selected_card_objects.includes(card_id);

                                    return (
                                        <button
                                            key={card_id}
                                            className="flex"
                                            style={{
                                                border: `1px solid ${selected ? "lime" : "grey"}`,
                                                color: selected ? "white" : "grey",
                                            }}
                                        >
                                            {card_desc}
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    </>
                )}

                {lobby.game_options.use_advanced_options && (
                    <>
                        <strong>Base colors:</strong>

                        <div className="flex flex-col gap-2 card">
                            {lobby.game_options.base_colors.map((color, i) => (
                                <div
                                    key={i}
                                    className="flex flex-row gap-2"
                                >
                                    <div
                                        style={{
                                            width: "50px",
                                            height: "50px",
                                            backgroundColor: color,
                                            border: "1px solid grey",
                                        }}
                                    />

                                    <span>{color}</span>
                                </div>
                            ))}
                        </div>


                        <strong>Card objects:</strong>

                        <div className="flex flex-col gap-2 card">
                            {lobby.game_options.advanced_card_objects.map(
                                (card_obj, i) => (
                                    <div
                                        key={i}
                                        className="flex flex-col gap-2 card"
                                    >
                                        <div className="flex flex-row gap-2">
                                            <strong>Type:</strong>

                                            <span>
                                                {
                                                    lobby.game_options
                                                        .allowed_advanced_card_objects[
                                                        card_obj.id
                                                    ]
                                                }
                                            </span>
                                        </div>

                                        <div className="flex flex-row gap-2">
                                            <strong>Weight:</strong>
                                            <span>{card_obj.weight}</span>
                                        </div>

                                        {card_obj.id === "norm_base_cards" && (
                                            <div className="flex flex-col gap-1">
                                                <strong>Numbers:</strong>

                                                <span>
                                                    {String(card_obj.nums)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    </>
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
                <li>Initial deck size: {lobby.game_options.init_deck_size}</li>
                <li>Can draw when playable: {lobby.game_options.can_draw_when_playable ? 'Yes' : 'No'}</li>
                <li>Max draw per turn: {lobby.game_options.max_draws_per_turn}</li>
                <li>Allow wild card stacking: {lobby.game_options.allow_wild_card_stacking ? 'Yes' : 'No'}</li>
                <li>Wild cards must match: {lobby.game_options.wild_cards_must_match ? 'Yes' : 'No'}</li>
                <li>Turn timer: {lobby.game_options.turn_timer} seconds</li>
            </div>

          </div>
        </>)
        }

        <div className="card">
            <strong>Chat:</strong>
            <div 
                className="card" 
                style={{height:"200px", overflowY:"scroll"}}
                ref={chat_container}
            >
            {lobby.chat.map(([source, msg], i) => (
                source === "server-log" 
                    ? <p key={i} >{msg}</p>
                    : <p key={i} style={{color:"white"}}>{msg}</p>
            ))}
            </div>
            
            <div className="flex">
                <input 
                    placeholder="Chat" 
                    value={lobby_chat_input} 
                    onChange={(e)=>{setLobbyChatInput(e.target.value)}}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && lobby_chat_input.trim() != "" && !lobby_chat_sending){
                            addLobbyMsg();
                        }
                    }}
                ></input>
                <button 
                    onClick={addLobbyMsg} 
                    disabled={lobby_chat_sending || lobby_chat_input.trim() == ""}
                >
                    {lobby_chat_sending ? <SpinnerLoader/> : "Send"}
                </button>
            </div>
        </div>

    </div>
  );
}


export default Lobby;
