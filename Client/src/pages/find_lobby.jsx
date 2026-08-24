// FindLobby.jsx
import { useNavigate, replace } from "react-router-dom";
import { useState, useEffect } from "react";
import "./css/find_lobby.css";
import FSLoader from "../helpers/loaders/fullscreen1"
import * as socketAPI from "../api/socket_handler"



function FindLobbyLoader(){
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  async function load_find_lobby_(){
    const data_ = await socketAPI.loadJoinLobby();

    if (data_.err){
      if (data_.state == "game"){
        navigate("/game", {replace:true});
        return;
      }
      if (data_.state == "lobby"){
        navigate("/lobby", {replace:true});
        return;
      }
      return;
    }

    setData(data_);
  }

  useEffect(() => {
      load_find_lobby_();
  }, []);

  if (!data){
    return (
      <FSLoader />
    );
  }
  
  return (
    <FindLobby data={data} />
  )

}



function FindLobby({data}) {
  console.log(data)
  const navigate = useNavigate();

  const handleJoinLobby = async (lobbyId) => {
    const res = await socketAPI.joinLobby(lobbyId);
    if (res.err){
      if (err.state == "game"){
        navigate("/game")
      }
      if (err.state == "lobby"){
        navigate("/game")
      }
    }

    navigate(`/lobby`);
  };

  return (
    <div className="find-lobby-container">
      <div className="find-lobby-card">
        <h2 className="find-lobby-title">Available Lobbies</h2>
        
        {data.lobbies && data.lobbies.length > 0 ? (
          <div className="lobbies-list">
            {data.lobbies.map((lobby) => {
              const isFull = lobby.online_players >= lobby.max_players;
              
              return (
                <div key={lobby.id} className="lobby-item">
                  <div className="lobby-info">
                    <h3 className="lobby-name">{lobby.id}</h3>
                    <p className="lobby-players">
                      <span className="player-count-current">{lobby.online_players}</span>
                      <span className="player-count-separator">/</span>
                      <span className="player-count-max">{lobby.max_players}</span>
                      <span className="player-count-label"> players</span>
                    </p>
                  </div>
                  
                  <button 
                    className={`btn-join ${isFull ? 'btn-disabled' : ''}`}
                    disabled={isFull}
                    onClick={() => handleJoinLobby(lobby.id)}
                  >
                    {isFull ? 'Full' : 'Join'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-icon">🎴</p>
            <p className="empty-text">No lobbies available</p>
            <p className="empty-subtext">Create a new lobby to get started</p>
          </div>
        )}
        
      </div>
    </div>
  );
}

export default FindLobbyLoader;