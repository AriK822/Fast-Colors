import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import * as SocketAPI from "../api/socket_handler"
import { useNotification } from "../utils/context/notification";
import { useApp } from "../utils/context/app_provider"
import { useCountdown } from "../utils/hooks/timer_hooks";

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
  Object.assign(ui, {Lobby:lobby_ui})


//   return (
//   <div className="card">

//     <input 
//       className="name-input" 
//       placeholder="Enter your name" 
//       onChange={(e) => setNameInputValue(e.target.value)} 
//       value={nameInputValue}
//     />

//     <p>
//     You'll appear as{" "}
//     {nameInputLoading
//       ? <Skeleton inline width={90} />
//       : session.player_name
//     }
//     </p>

//     <button onClick={leaveLobbyBtn}>
//       {leave_lobby_loading ? <Loader.Spinner /> : "Leave Lobby"}
//     </button>


//     <p>Lobby id: {lobby.id}</p>
//     <p>Owner id: {lobby.owner}</p>


//     <div className="card">
//       <strong>Players:</strong>
//       {Object.entries(lobby.players).map(([id, desc]) => (
//         <div key={id} className="flex gap-ui-md">

//           <p>Name: {desc.name}</p>
//           <p>Status: {desc.connection_status}</p>

//           {desc.disconnect_expires_at ? 
//           <KickTimer target_time={desc.disconnect_expires_at} />
//           : <></>}

//           {session.player_id == lobby.owner && id != lobby.owner ? (
//             <button 
//             onClick={() => kickPlayer(id)}
//             disabled={kick_player_loading!=null}
//             >
//               {kick_player_loading == id ? <Loader.Spinner /> : "Kick"}
//             </button>
//           ) : <></>}

//           {id == lobby.owner ? <p>👑</p> : <></>}

//         </div>
//       ))}
//     </div>



//     {lobby.owner == session.player_id ? 
//     // Lobby owner settings
//     (<>
//       <div className="card">
//       <strong>Game settings:</strong>

//       <div className="card">
//         <button 
//           onClick={() => {
//           setGameOptions("use_advanced_options", !lobby.game_options.use_advanced_options )
//           }}
//         >
//           {lobby.game_options.use_advanced_options 
//             ? "Disable advanced options" 
//             : "Enable advanced options"
//           }
//         </button>
//         <br></br><br></br>


//         {!lobby.game_options.use_advanced_options && 
//           Object.entries(lobby.game_options.card_objects).map(([card_id, card_desc]) => {
//           const selected =lobby.game_options.selected_card_objects.includes(card_id);

//           return (
//             <button
//               key={card_id}
//               className="flex"
//               style={
//                 {border: `1px solid ${selected ? "lime" : "grey"}`}
//               }
//               onClick={() => {
//                 const selectedCards = [...lobby.game_options.selected_card_objects];

//                 if (selected) {
//                   selectedCards.splice(selectedCards.indexOf(card_id), 1);
//                 } else {
//                   selectedCards.push(card_id);
//                 }

//                 setGameOptions(
//                   "selected_card_objects",
//                   selectedCards
//                 );
//               }}
//             >
//               {card_desc}
//             </button>
//           );
//           }
//         )}


//         {lobby.game_options.use_advanced_options && <>

//         <strong>Base colors:</strong>
//           <div className="flex flex-col card gap-ui-xs">
//           {lobby.game_options.base_colors.map((b_color, i) => (
//             <div className="flex flex-row gap-ui-xs" key={i} >
//               <input 
//                 type={"color"} 
//                 value={b_color} 
//                 style={{height:"50px"}}
//                 onChange={(e) => {
//                   const new_colors = [...lobby.game_options.base_colors];
//                   new_colors[i] = e.target.value;

//                   setLobby(prevLobby => ({
//                     ...prevLobby,
//                     game_options: {
//                       ...prevLobby.game_options,
//                       base_colors: new_colors,
//                     },
//                   }));
//                 }}
//                 onBlur={() => {
//                   setGameOptions("base_colors", lobby.game_options.base_colors);
//                 }}
//               />
//               <button
//                 onClick={() => {
//                   const new_colors = [...lobby.game_options.base_colors];
//                   new_colors.splice(i, 1);
//                   setGameOptions("base_colors", new_colors);
//                 }}
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//           <button 
//             onClick={() => {
//               const new_colors = [...lobby.game_options.base_colors];
//               new_colors.push(
//                 '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')
//               )
//               setGameOptions("base_colors", new_colors);
//             }}
//           >
//             Add base color +
//           </button>
//           </div>

//           <strong>Card objects:</strong>
//           <div className="card">

//           {lobby.game_options.advanced_card_objects.map((card_obj, i) => (
//             <div key={i} className="flex flex-col gap-ui-xs card">
//               <div className="flex flex-row gap-ui-xs">
//                 <label>Type:</label>
//                 <select
//                   value={card_obj.id}
//                   onChange={(e) => {
//                     const new_objects = [
//                       ...lobby.game_options.advanced_card_objects
//                     ];
//                     new_objects[i] = {
//                       ...new_objects[i],
//                       id: e.target.value,
//                     };
//                     setGameOptions(
//                       "advanced_card_objects",
//                       new_objects
//                     );
//                   }}
//                 >
//                   {Object.entries(
//                     lobby.game_options.allowed_advanced_card_objects
//                   ).map(([c_id, c_desc]) => (
//                     <option key={c_id} value={c_id}>
//                       {c_desc}
//                     </option>
//                   ))}
//                 </select>
//               </div>


//               <div className="flex flex-row gap-ui-xs">
//                 <label>
//                   Weight: {card_obj.weight}
//                 </label>

//                 <input
//                   type="range"
//                   min={`${limits.min_weight}`}
//                   max={`${limits.max_weight}`}
//                   value={card_obj.weight}
//                   onChange={(e) => {
//                     const new_objects = [
//                       ...lobby.game_options.advanced_card_objects
//                     ];

//                     new_objects[i] = {
//                       ...new_objects[i],
//                       weight: Number(e.target.value),
//                     };

//                     setLobby(prevLobby => ({
//                       ...prevLobby,
//                       game_options: {
//                         ...prevLobby.game_options,
//                         advanced_card_objects: new_objects,
//                       },
//                     }));
//                   }}
//                   onBlur={() => {
//                     setGameOptions(
//                       "advanced_card_objects",
//                       lobby.game_options.advanced_card_objects
//                     );
//                   }}
//                 />
//               </div>


//               {card_obj.id === "norm_base_cards" && (
//                 <div className="flex flex-col gap-ui-xs">
//                   <p>Numbers: {String(card_obj.nums)}</p>
//                   <button
//                     onClick={() => {
//                       setOpenNumsIndex(
//                         openNumsIndex === i ? null : i
//                       );
//                     }}
//                   >
//                     Modify numbers
//                   </button>

//                   {openNumsIndex === i && (
//                     <div className="flex flex-col gap-ui-xs card">

//                       <button
//                         onClick={() => {
//                           const allSelected =
//                             card_obj.nums.length===limits.max_norm_num-limits.min_norm_num+1;

//                           const new_objects = [
//                             ...lobby.game_options.advanced_card_objects
//                           ];

//                           new_objects[i] = {
//                             ...new_objects[i],
//                             nums: allSelected
//                               ? []
//                               : Array.from(
//                                 { length: limits.max_norm_num - limits.min_norm_num + 1 },
//                                 (_, index) => index + limits.min_norm_num
//                               ),
//                           };

//                           setGameOptions(
//                             "advanced_card_objects",
//                             new_objects
//                           );
//                         }}
//                       >
//                         {card_obj.nums.length===limits.max_norm_num-limits.min_norm_num+1
//                           ? "Deselect all"
//                           : "Select all"}
//                       </button>


//                       <div className="flex flex-row flex-wrap gap-ui-xs">
//                         {Array.from(
//                           { length: limits.max_norm_num-limits.min_norm_num+1 },
//                           (_, index) => index + limits.min_norm_num
//                         ).map((num) => {

//                           const isSelected =
//                             card_obj.nums.includes(num);

//                           return (
//                             <button
//                               key={num}
//                               style={{background: isSelected ? "green" : ""}}
//                               onClick={() => {
//                                 const new_nums =
//                                   isSelected
//                                     ? card_obj.nums.filter(
//                                       n => n !== num
//                                     )
//                                     : [
//                                       ...card_obj.nums,
//                                       num
//                                     ].sort(
//                                       (a, b) => a - b
//                                     );

//                                 const new_objects = [
//                                   ...lobby.game_options.advanced_card_objects
//                                 ];

//                                 new_objects[i] = {
//                                   ...new_objects[i],
//                                   nums: new_nums,
//                                 };

//                                 setGameOptions(
//                                   "advanced_card_objects",
//                                   new_objects
//                                 );
//                               }}
//                             >
//                               {num}
//                             </button>
//                           );
//                         })}
//                       </div>

//                     </div>
//                   )}

//                 </div>
//               )}


//               <button
//                 onClick={() => {
//                   const new_objects = [
//                     ...lobby.game_options.advanced_card_objects
//                   ];

//                   new_objects.splice(i, 1);

//                   setGameOptions(
//                     "advanced_card_objects",
//                     new_objects
//                   );
//                 }}
//               >
//                 Remove
//               </button>

//             </div>
//           ))}

//           <button
//           onClick={() => {
//             const to_add_index = 
//               lobby.game_options.advanced_card_objects.length %
//               Object.entries(lobby.game_options.allowed_advanced_card_objects).length;
//             const toAddCardObjID = Object.keys(
//             lobby.game_options.allowed_advanced_card_objects
//             )[to_add_index];

//             const new_object = {
//             id: toAddCardObjID,
//             weight: 4,
//             ...(toAddCardObjID === "norm_base_cards" && {
//               nums: Array.from({ length: 10 }, (_, i) => i + 1),
//             }),
//             };

//             setGameOptions(
//             "advanced_card_objects",
//             [...lobby.game_options.advanced_card_objects, new_object]
//             );
//           }}
//           >
//           Add new object
//           </button>

//           </div>

//         </>}
//       </div>


//       <div className="card">
//         <strong>Bots:</strong>
//         {lobby.game_options.bots.map((bot_name, i) => (
//         <div className="flex gap-ui-md" key={i}>
//           <p>{bot_name}</p>
//           <button 
//             style={{color:"orange"}}
//             onClick={() => {
//               const new_bot_names = [...lobby.game_options.bots];
//               new_bot_names.splice(i, 1);
//               setGameOptions("bots", new_bot_names)
//             }}
//           >
//             Remove
//           </button>
//         </div>
//         ))}
//         <strong>Add bot:</strong>
//         <input 
//           placeholder="bot name"
//           value={bot_name_input}
//           onChange={(e) => {setBotNameInput(e.target.value)}}
//         ></input>
//         <button
//           onClick={() => {
//             if (bot_name_input.trim() == ""){
//               showNotification({
//                 type:"warning",
//                 text:"Please enter a name first.",
//               })
//               return;
//             }
//             const this_name = bot_name_input;
//             setBotNameInput("");
//             const new_bot_names = [...lobby.game_options.bots];
//             new_bot_names.push(this_name);
//             setGameOptions("bots", new_bot_names);
//           }}
//           disabled={
//             lobby.game_options.bots.length + 
//             Object.entries(lobby.players).length 
//             >= limits.max_total_game_players
//           }
//         >
//           Add new bot
//         </button>
//       </div>

//       <div className="card">
//         <strong>Other options:</strong>

//         <div className="flex gap-ui-md">
//           <label>
//             Initial deck size:
//           </label>

//           <select
//             value={lobby.game_options.init_deck_size}
//             onChange={(e) =>
//               setGameOptions(
//                 "init_deck_size",
//                 Number(e.target.value)
//               )
//             }
//           >
//             {Array.from({ length: limits.max_init_deck_size - limits.min_init_deck_size + 1}, 
//               (_, i) => i + limits.min_init_deck_size).map(count => (
//                 <option key={count} value={count}>
//                   {count}
//                 </option>
//               ))
//             }
//           </select>
//         </div>


//         <div className="flex gap-ui-md">
//           <label>
//             Can draw when playable:
//           </label>

//           <input
//             type="checkbox"
//             checked={lobby.game_options.can_draw_when_playable}
//             onChange={(e) =>
//               setGameOptions(
//                 "can_draw_when_playable",
//                 e.target.checked
//               )
//             }
//           />
//         </div>


//         <div className="flex gap-ui-md">
//           <label>
//             Max draw per turn:
//           </label>

//           <select
//             value={lobby.game_options.max_draws_per_turn}
//             onChange={(e) =>{
//               const value = e.target.value;
//               setGameOptions(
//                 "max_draws_per_turn",
//                 value === "infinite" ? "infinite" : Number(value)
//               )
//             }}
//           >
//             <option value={"infinite"}>Infinite</option>
//             {Array.from(
//               { length: 
//                 limits.max_max_draws_per_turn - limits.min_max_draws_per_turn + 1
//               }, 
//               (_, i) => i+limits.min_max_draws_per_turn).map(count => (
//                 <option key={count} value={count}>
//                   {count}
//                 </option>
//               ))
//             }
//           </select>
//         </div>


//         <div className="flex gap-ui-md">
//           <label>
//             Allow wild card stacking:
//           </label>

//           <input
//             type="checkbox"
//             checked={lobby.game_options.allow_wild_card_stacking}
//             onChange={(e) =>
//               setGameOptions(
//                 "allow_wild_card_stacking",
//                 e.target.checked
//               )
//             }
//           />
//         </div>


//         <div className="flex gap-ui-md">
//           <label>
//             Wild cards must match:
//           </label>

//           <input
//             type="checkbox"
//             checked={lobby.game_options.wild_cards_must_match}
//             onChange={(e) =>
//               setGameOptions(
//                 "wild_cards_must_match",
//                 e.target.checked
//               )
//             }
//           />
//         </div>


//         <div className="flex gap-ui-md">
//           <label>
//             Turn timer:
//           </label>

//           <select
//             value={lobby.game_options.turn_timer}
//             onChange={(e) => {
//               const value = e.target.value;

//               setGameOptions(
//                 "turn_timer",
//                 value === "infinite" ? "infinite" : Number(value)
//               );
//             }}
//           >
//             <option value="infinite">Infinite</option>
//             {limits.turn_timers.map(seconds => (
//               <option key={seconds} value={seconds}>
//                 {seconds} seconds
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       </div>

//       <button 
//       className="w-full"
//       style={{background:"lime", color:"black"}}
//       onClick={startGame}
//       disabled={!startGameValidation()[0] || start_game_btn_loading}
//       >
//       {start_game_btn_loading ? <Loader.Spinner/> : "Start Game"}
//       </button>

//       {
//       !startGameValidation()[0] &&
//       <p>{startGameValidation()[1]}</p>
//       }

//       {
//       Object.entries(lobby.players).some(([p_id, p_info]) => p_info.connection_status == "offline") &&
//       <p style={{color:"orange"}}>
//         Warning: some players appear to be offline. 
//         You wont be able to kick them after starting the game
//       </p>
//       }
//     </>) 




//     : 
//     // Non owner clients



//     (<>
//       <div className="card">
//       <strong>Game settings:</strong>

//       <div className="card gap-ui-xs">
//         <strong>Game settings:</strong>

//         {!lobby.game_options.use_advanced_options && (
//           <>
//             <strong>Card types:</strong>

//             <div className="flex flex-col gap-1">
//               {Object.entries(lobby.game_options.card_objects).map(
//                 ([card_id, card_desc]) => {
//                   const selected =
//                     lobby.game_options.selected_card_objects.includes(card_id);

//                   return (
//                     <button
//                       key={card_id}
//                       className="flex"
//                       style={{
//                         border: `1px solid ${selected ? "lime" : "grey"}`,
//                         color: selected ? "white" : "grey",
//                       }}
//                     >
//                       {card_desc}
//                     </button>
//                   );
//                 }
//               )}
//             </div>
//           </>
//         )}

//         {lobby.game_options.use_advanced_options && (
//           <>
//             <strong>Base colors:</strong>

//             <div className="flex flex-col gap-ui-xs card">
//               {lobby.game_options.base_colors.map((color, i) => (
//                 <div
//                   key={i}
//                   className="flex flex-row gap-ui-xs"
//                 >
//                   <div
//                     style={{
//                       width: "50px",
//                       height: "50px",
//                       backgroundColor: color,
//                       border: "1px solid grey",
//                     }}
//                   />

//                   <span>{color}</span>
//                 </div>
//               ))}
//             </div>


//             <strong>Card objects:</strong>

//             <div className="flex flex-col gap-ui-xs card">
//               {lobby.game_options.advanced_card_objects.map(
//                 (card_obj, i) => (
//                   <div
//                     key={i}
//                     className="flex flex-col gap-ui-xs card"
//                   >
//                     <div className="flex flex-row gap-ui-xs">
//                       <strong>Type:</strong>

//                       <span>
//                         {
//                           lobby.game_options
//                             .allowed_advanced_card_objects[
//                             card_obj.id
//                           ]
//                         }
//                       </span>
//                     </div>

//                     <div className="flex flex-row gap-ui-xs">
//                       <strong>Weight:</strong>
//                       <span>{card_obj.weight}</span>
//                     </div>

//                     {card_obj.id === "norm_base_cards" && (
//                       <div className="flex flex-col gap-1">
//                         <strong>Numbers:</strong>

//                         <span>
//                           {String(card_obj.nums)}
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 )
//               )}
//             </div>
//           </>
//         )}
//       </div>


//       <div className="card">
//         <strong>Bots:</strong>
//         {lobby.game_options.bots.map((bot_name, i) => (
//         <div key={i}>{bot_name}</div>
//         ))}
//       </div>

//       <div className="card">
//         <strong>Other options:</strong>
//         <li>Initial deck size: {lobby.game_options.init_deck_size}</li>
//         <li>Can draw when playable: {lobby.game_options.can_draw_when_playable ? 'Yes' : 'No'}</li>
//         <li>Max draw per turn: {lobby.game_options.max_draws_per_turn}</li>
//         <li>Allow wild card stacking: {lobby.game_options.allow_wild_card_stacking ? 'Yes' : 'No'}</li>
//         <li>Wild cards must match: {lobby.game_options.wild_cards_must_match ? 'Yes' : 'No'}</li>
//         <li>Turn timer: {lobby.game_options.turn_timer} seconds</li>
//       </div>

//       </div>
//     </>)
//     }

//     <div className="card">
//       <strong>Chat:</strong>
//       <div 
//         className="card" 
//         style={{height:"200px", overflowY:"scroll"}}
//         ref={chat_container}
//       >
//       {lobby.chat.map(([source, msg], i) => (
//         source === "server-log" 
//           ? <p key={i} >{msg}</p>
//           : <p key={i} style={{color:"white"}}>{msg}</p>
//       ))}
//       </div>
      
//       <div className="flex">
//         <input 
//           placeholder="Chat" 
//           value={lobby_chat_input} 
//           onChange={(e)=>{setLobbyChatInput(e.target.value)}}
//           onKeyDown={(e) => {
//             if (e.key === 'Enter' && lobby_chat_input.trim() != "" && !lobby_chat_sending){
//               addLobbyMsg();
//             }
//           }}
//         ></input>
//         <button 
//           onClick={addLobbyMsg} 
//           disabled={lobby_chat_sending || lobby_chat_input.trim() == ""}
//         >
//           {lobby_chat_sending ? <Loader.Spinner/> : "Send"}
//         </button>
//       </div>
//     </div>

//   </div>
//   );



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
          {Object.entries(lobby.players).map(([id, p_info]) => (
              <ui.Lobby.PlayerLabel 
                key={id}
                player={p_info}
                owner={id == lobby.owner}
                hasKick={session.player_id == lobby.owner && id != lobby.owner}
                kickFunc={() => kickPlayer(id)}
                kickContent={kick_player_loading == id ? <Loader.Spinner /> : "Kick"}
                kickDisabled={kick_player_loading == id}
              />
          ))}
          <ui.Frame.hr className="my-ui-xxs" />
          {lobby.game_options.bots.map((bot_name, i) => {
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
                key={i}
                botName={bot_name}
                botKick={botKick}
              />
            )
          })}
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
            {Object.entries(lobby.players).map(([id, p_info]) => (
                <ui.Lobby.PlayerLabel 
                  key={id}
                  player={p_info}
                  owner={id == lobby.owner}
                  hasKick={session.player_id == lobby.owner && id != lobby.owner}
                  kickFunc={() => kickPlayer(id)}
                  kickContent={kick_player_loading == id ? <Loader.Spinner /> : "Kick"}
                  kickDisabled={kick_player_loading == id}
                />
            ))}
            <ui.Frame.hr className="col-span-1 sm:col-span-2" />
            {lobby.game_options.bots.map((bot_name, i) => {
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
                  key={i}
                  botName={bot_name}
                  botKick={botKick}
                />
              )
            })}
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
              className="flex-2 min-h-auto lg:min-h-0"
              insideBoxClassName="h-full game-theme-scrollbar
                flex flex-col gap-ui-xs"
            >
              <ui.Frame.SubBox>
                <h1 className="text-lg p-ui-xxs">Bots:</h1>
                <ui.Frame.hr className="mb-ui-xs" />

                <div className="flex flex-col gap-ui-xxs">
                {lobby.game_options.bots.map((bot_name, i) => {
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
                      key={i}
                      botName={bot_name}
                      botKick={botKick}
                    />
                  )
                })}
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
                      const this_name = bot_name_input;
                      setBotNameInput("");
                      const new_bot_names = [...lobby.game_options.bots];
                      new_bot_names.push(this_name);
                      setGameOptions("bots", new_bot_names);
                    }
                  }}
                />

                <ui.Frame.ContrastBtn
                  className="shrink-0"
                  onClick={() => {
                    const this_name = bot_name_input;
                    setBotNameInput("");
                    const new_bot_names = [...lobby.game_options.bots];
                    new_bot_names.push(this_name);
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
                </>}
               
              </ui.Frame.SubBox>

              {/* <ui.Frame.SubBox>
                Cards
              </ui.Frame.SubBox> */}

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
            

          </div>
        </ui.Frame>

      </main>
    </ui.FullScreen>
  )
}


export default Lobby;

