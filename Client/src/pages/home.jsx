import { useState } from "react";
import { useNavigate } from "react-router-dom";
import mainUnoImage from "../assets/main-uno-image.png";
import "./css/Home.css";
import * as socketAPI from "../api/socket_handler"
import FSLoading from "../helpers/loaders/fullscreen1"
import SpinnerLoading from "../helpers/loaders/inside_spinner1"


function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("")


  async function createLobbyBtn(){
    setLoading(true);
    const result = await socketAPI.setName(name);
    navigate("/lobby");
  }
  
  async function joinLobbyBtn(){
    setLoading(true);
    const result = await socketAPI.setName(name);
    navigate("/findlobby");
  }


  return (
    <div className="game-container">

      <div className="left-section">
        <h1 className="title">Fast Colors</h1>
        <p className="subtitle">open-source multiplayer UNO</p>
        
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Enter your name" 
            className="name-input"
            maxLength={20}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="button-group">
          <button 
            className="btn btn-create" 
            onClick={createLobbyBtn} 
            disabled={loading} 
          >
            { loading ? 
            <SpinnerLoading />
            :
            "Create Room"
            }
          </button>
          <button 
            className="btn btn-join" 
            onClick={joinLobbyBtn} 
            disabled={loading} 
          >
            { loading ? 
            <SpinnerLoading />
            :
            "Join Room"
            }
          </button>
        </div>
      </div>
      
      <div className="right-section">
        <img src={mainUnoImage} alt="UNO Cards" className="hero-image" />
      </div>
      
    </div>
  );
}


export default Home;
