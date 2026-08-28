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

  async function startBtn(){
    navigate("/lobby");
  }


  return (
    <div className="game-container">

      <div className="left-section">
        <h1 className="title">Fast Colors</h1>
        <p className="subtitle">open-source multiplayer UNO</p>
        
        <div className="button-group">
          <button 
            className="btn btn-create" 
            onClick={startBtn} 
            disabled={loading} 
          >
            { loading ? 
            <SpinnerLoading />
            :
            "Start"
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
