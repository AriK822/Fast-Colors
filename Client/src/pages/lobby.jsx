// Lobby.jsx
import { useState, useEffect } from "react";
import { replace, useNavigate } from "react-router-dom";
import * as APICalls from "../api/base_calls"
import "./css/lobby.css";
import FSLoader from "../helpers/loaders/fullscreen1"
import * as socketAPI from "../api/socket_handler"


// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";

{/* <Skeleton className="dark-skeleton" key={i} width={50} /> */}

// .dark-skeleton {
//   --base-color: #242424;
//   --highlight-color: #3a3a3a;
// }


function lobbyLoader(){
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  async function load_create_lobby_(){
    const data_ = await socketAPI.loadCreateLobby();

    if (data_.err){
      if (data_.state == "game"){
        navigate("/game", {replace:true});
        return;
      }
      return;
    }
    console.log(data_)

    setData(data_);
  }

  useEffect(() => {
      load_create_lobby_();
  }, []);

  if (!data){
    return (
      <FSLoader />
    );
  }
  
  return (
    <Lobby data={data} />
  )

}


function Lobby({data}) {

  function startGame(){
    return;
  }


  function kickPlayer(p_id){
    return;
  }
  

  if (data.renderer_id == data.owner_id) {
    return (
      <div className="lobby-container">
        <div className="lobby-card">
          <h2 className="lobby-title">Game Lobby</h2>
          
          <div className="lobby-section">
            <h5 className="section-label">You will appear as:</h5>
            <h3 className="player-name">{data.player_name || "Guest"}</h3> 
          </div>

          <div className="lobby-section">
            <h4 className="section-label">Player count:</h4>
            <select className="lobby-select">
              {data.allowed_player_counts?.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </div>

          <div className="lobby-section">
            <h5 className="section-label">Players:</h5>
            {data.players?.map((player) => (
              <div key={player.id} className="player-row">
                <h6 className="player-name-display">
                  {player.name || "Guest"}
                  {player.id === data.owner_id && <span className="owner-badge">Owner</span>}
                </h6>
                {player.id !== data.owner_id && (
                  <button 
                    className="btn-kick" 
                    onClick={() => kickPlayer(player.id)}
                  >
                    Kick
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="lobby-section">
            <h4 className="section-label">Game Settings:</h4>
            <div className="options-grid">
              {data.card_types?.map((option) => (
                <label key={option.id} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    id={option.id} 
                    name={option.id} 
                    value={option.id}
                    className="checkbox-input"
                    defaultChecked={option.enabled}
                  />
                  <span className="checkbox-text">{option.description}</span>
                </label>
              ))}
            </div>
          </div>

          <button className="btn-start-game" onClick={startGame}>
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <h2 className="lobby-title">Game Lobby</h2>
        
        <div className="lobby-section">
          <h5 className="section-label">You will appear as:</h5>
          <h3 className="player-name">{data.player_name || "Guest"}</h3> 
        </div>

        <div className="lobby-section">
          <h5 className="section-label">Players:</h5>
          {data.players?.map((player) => (
            <div key={player.id} className="player-row">
              <h6 className="player-name-display">
                {player.name || "Guest"}
                {player.id === data.owner_id && <span className="owner-badge">Owner</span>}
              </h6>
            </div>
          ))}
        </div>

        <div className="lobby-section">
          <h4 className="section-label">Game Settings:</h4>
          <div className="options-grid">
            {data.card_types?.map((option) => (
              <div key={option.id} className="setting-display">
                <span className="setting-dot">◆</span>
                <span className="setting-text">{option.description}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

  export default lobbyLoader;
